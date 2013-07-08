(function ($, window, THREE, jcu) {

var _car_cache = {};
var _get_car = function (tp) {
    if(_car_cache[tp] != null) {
        if(_car_cache[tp].loaded) {
            return _car_cache[tp];
        }
    } else {
        _car_cache[tp] = {
            loaded: false
        };        
        $.getScript('scripts/models/webgl/cars/' + tp + '.js');
        return null;
    }
};
var _map_cache = {};
var _get_map = function (map) {
    if(_map_cache[map] != null) {
        if(_map_cache[map].loaded) {
            return _map_cache[map];
        }
    } else {
        _map_cache[map] = {
            loaded: false
        };
        $.getScript('scripts/models/webgl/maps/' + map + '.js');
        return null;
    }
};

var _car_mesh_cache = {};
var _trap_cache = {};
var _trap_owner_cache = {};
var _missile_cache = {};

var _start_time = 0;
var _boxes_data = [];
var _car_data = {};
var _barriers = {};
var _map_type = null;
var _target = null;

var _load_lock;
var _load_complete_time;
var _not_loading;
var _is_first = null;

var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;
var _renderer, _camera, _scene;

var _push_obj = function (array, type, obj) {
    if(!array[type]) {
        array[type] = [];
    }
    array[type].push(obj);
};

var _initialize = function (data, options) {

    jcu.refresh(null, null, null, null, null, null, null, null, STATUS_LOADING);

    _not_loading = false;

    var geometry_hp = new THREE.CylinderGeometry(40, 40, 15, 20, 1, false);
    var geometry_hoods = new THREE.SphereGeometry(160);
    var material_hoods = new THREE.MeshPhongMaterial({
        color: 0xaaaaff, transparent: true, opacity: 0.3
    });

    _car_data = {};
    _car_mesh_cache = {};
    _trap_cache = {};
    _trap_owner_cache = {};
    _missile_cache = {};

    _load_lock = $.lock(false, function () {
        var map = _get_map(_map_type);
        _scene.fog = map.gen_fog();
        map.add_lights(data, options);
        map.add_scene();
        var self_index = data.index;
        var self_team = data.cars[self_index].team;
        $.each(data.cars, function (i) {
            var car_data = _car_data[this.id] = this;
            var car_model = _get_car(car_data.type);
            var profile = _car_mesh_cache[car_data.id] = {
                wrapper: new THREE.Object3D(),
                cars: {}
            };
            profile.cars[DA_NORMAL] = car_model.gen_car(DA_NORMAL);
            profile.cars[DA_LEFT] = car_model.gen_car(DA_LEFT);
            profile.cars[DA_RIGHT] = car_model.gen_car(DA_RIGHT);
            profile.wrapper.add(profile.cars[DA_NORMAL]);
            profile.wrapper.add(profile.cars[DA_LEFT]);
            profile.wrapper.add(profile.cars[DA_RIGHT]);
            profile.current = profile.cars[DA_NORMAL];
            profile.cars[DA_LEFT].visible = false;
            profile.cars[DA_RIGHT].visible = false;
            if(i != self_index) {
                profile.hp = new THREE.Object3D();
                profile.last_hp = 0;
                for(var i = 0; i < 3; ++i) {
                    var mhp = new THREE.Mesh(geometry_hp, new THREE.MeshPhongMaterial({color: 0xf8f8f8}));
                    mhp.position.y = (i - 1) * 17 + 180;
                    profile.hp.add(mhp);
                }
                profile.wrapper.add(profile.hp);
            }
            if(car_data.team == self_team) {
                profile.hoods = new THREE.Mesh(geometry_hoods, material_hoods);
                profile.hoods.position.y = 30;
                profile.wrapper.add(profile.hoods);
            }
            _scene.add(profile.wrapper);

            //Preload
            var mesh = car_model.gen_trap(true);
            _push_obj(_trap_cache, car_data.type, mesh);
            _scene.add(mesh);
            mesh = car_model.gen_trap(false);
            _push_obj(_trap_owner_cache, car_data.type, mesh);
            _scene.add(mesh);
            mesh = car_model.gen_missile();
            _push_obj(_missile_cache, car_data.type, mesh);
            _scene.add(mesh);

        });
        map.add_boxes(_boxes_data);

        _load_complete_time = new Date().getTime();
    });

    for(var k in _car_cache) {
        _car_cache[k].reset(_load_lock.require_lock(true));
    }
    for(var i = 0, l = data.cars.length; i < l; ++i) {
        var type = data.cars[i].type;
        if(!_car_cache[type]) {
            _load_lock.require();
            _get_car(type);
        }
    }
    
    for(var k in _map_cache) {
        _map_cache[k].reset(_load_lock.require_lock(true));
    }
    if(!_map_cache[data.map_type]) {
        _load_lock.require();
        _get_map(data.map_type);
    }
    _map_type = data.map_type;

    _start_time = data.start_time;
    _boxes_data = data.boxes;
    _barriers = data.barriers;
    
    WIDTH = GAME_WIDTH;
    HEIGHT = GAME_HEIGHT;
    VIEW_ANGLE = 45;
    ASPECT = WIDTH / HEIGHT;
    NEAR = 0.1;
    FAR = 30000;

    _scene = new THREE.Scene();

    _renderer = new THREE.WebGLRenderer( { antialias: true } );
    _renderer.setClearColor(0xffffff, 1);
    _renderer.setSize(WIDTH, HEIGHT);
    _renderer.autoClear = false;
    _renderer.gammaInput = true;
    _renderer.gammaOutput = true;
    _renderer.physicallyBasedShading = true;
    _renderer.shadowMapEnabled = true;
    //_renderer.shadowMapType = THREE.PCFShadowMap;
    //_renderer.shadowMapSoft = false;
    _target = _renderer.domElement;
    _camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    _scene.add(_camera);

    _load_lock.start();

    if(_is_first == null) {
        _is_first = true;
    } else {
        _is_first = false;
    }

    return _target;
};

window.jschariot_graphics_webgl = {
    initialize: _initialize,
    set_car_model: function (tp, data) {
        _car_cache[tp] = data;
        _car_cache[tp].loaded = true;
        _load_lock.done_one();
    },
    set_map_model: function (map, data) {
        _map_cache[map] = data;
        _map_cache[map].loaded = true;
        _load_lock.done_one();
    },
    utils: {
        da_yaw: function (obj, da, degree) {
            degree = (degree || 4) * Math.PI / 180;
            if(da < 0) {
                degree = -degree;
            }
            if(da != 0) {
                if(obj instanceof THREE.Object3D) {
                    obj.rotation.y += degree;
                } else if(obj instanceof THREE.Geometry) {
                    var adjust = new THREE.Matrix4();
                    adjust.makeRotationY(degree);
                    obj.applyMatrix(adjust);
                }
            }
        },
        scene_add: function (obj) {
            _scene.add(obj);
        },
        scene_remove: function (obj) {
            _scene.remove(obj);
        }
    },
    draw: function (data, _rinfo, options) {

        if(!_load_lock.is_done()) {
            jcu.refresh(0, data, null, _boxes_data, _car_data, _start_time, _rinfo, _get_car, STATUS_LOADING);
            return;
        }

        if(!_not_loading) {
            if(_is_first) {
                _not_loading = new Date().getTime() - _load_complete_time >= FIRST_LOADING_EXTRA_TIME;
            } else {
                _not_loading = new Date().getTime() - _load_complete_time >= LOADING_EXTRA_TIME;
            }
        }

        var self_index = data[INDEX_INDEX];
        var self_team = _car_data[data[INDEX_CARS][self_index][INDEX_CAR_ID]].team;
        var map = _get_map(_map_type);

        //camera
        var d_pos = data[INDEX_CARS][self_index];
        var d_angle = d_pos[INDEX_D] * Math.PI / 180;
        //_camera.rotation.x = Math.PI / 2;
        //_camera.rotation.y = d_angle;
        _camera.position.x = d_pos[INDEX_X] + 600 * Math.sin(d_angle);
        _camera.position.y = 200;
        _camera.position.z = 600 * Math.cos(d_angle) - d_pos[INDEX_Z];
        _camera.lookAt(new THREE.Vector3(d_pos[INDEX_X], 0, -d_pos[INDEX_Z]));
        _camera.position.y = 350;

        //scene
        var rotate_d_date = new Date();
        var rotate_d = (rotate_d_date.getSeconds() % 4 + rotate_d_date.getMilliseconds() / 1000) * 90;
        //boxes visible
        var boxes_status_tmp = data[INDEX_BOXES];
        var boxes_readed_length = 0;
        var boxes_index = _boxes_data.length - 1;
        while(boxes_readed_length < boxes_status_tmp.length) {
            var cur_boxes = boxes_status_tmp.substr(boxes_readed_length, 6);
            boxes_readed_length += cur_boxes.length;
            var _box_visible_status = parseInt(cur_boxes, 36);
            for(var i = 29 > boxes_index ? boxes_index : 29; i >= 0 && boxes_index >= 0; --i, --boxes_index) {
                _boxes_data[boxes_index].v = !!(_box_visible_status & (1 << i));
            }
        }
        map.update_boxes(_boxes_data, rotate_d);
        map.update_lights(data, options);
        $.each(_car_mesh_cache, function () {
            this.wrapper.visible = false;
        });
        $.each(data[INDEX_CARS], function (i) {
            var car_data = this;
            var car_init_data = _car_data[car_data[INDEX_CAR_ID]];
            var car_model = _get_car(car_init_data.type);
            var car_cache = _car_mesh_cache[car_data[INDEX_CAR_ID]];
            car_cache.current.visible = false;
            car_cache.current = car_cache.cars[car_data[INDEX_DA]];
            car_cache.current.visible = true;
            if(i != self_index) {
                var hp = data[INDEX_HP][i];
                if(car_cache.last_hp != hp) {
                    car_cache.last_hp = hp;
                    for(var j = 0; j < 3; ++j) {
                        var color = 0xf8f8f8;
                        if(hp > j) {
                            if(options.all_colors) {
                                color = TEAM_COLORS[car_init_data.team];
                            } else {
                                color = self_team == car_init_data.team ? 0x6666cc : 0xcc6666;
                            }
                        }
                        car_cache.hp.children[j].material.color.set(color);
                    }
                }
            }
            if(car_init_data.team == self_team) {
                car_cache.hoods.visible = car_data[INDEX_CAR_STATUS] == CAR_STATUS_HOODS;
            }
            car_cache.wrapper.visible = true;
            car_cache.wrapper.rotation.y = car_data[INDEX_D] * Math.PI / 180;
            car_cache.wrapper.position.set(car_data[INDEX_X], 0, -car_data[INDEX_Z]);
        });
        if(_not_loading) {
            var _disable_method = function () {
                this.visible = false;
            };
            var missile_lists = {};
            $.each(data[INDEX_MISSILES], function () {
                _push_obj(missile_lists, _car_data[data[INDEX_CARS][this[INDEX_OWNER]][INDEX_CAR_ID]].type, this);
            });
            $.each(missile_lists, function (type, list) {
                var car_model = _get_car(type);
                if(!_missile_cache[type]) {
                    _missile_cache[type] = [];
                }
                $.sync_cache(list, _missile_cache[type], function () {
                    var res = car_model.gen_missile();
                    _scene.add(res);
                    return res;
                }, _disable_method, function (data, cache) {
                    cache.visible = true;
                    car_model.update_missile(cache, data, rotate_d);
                });
            });
            $.each(_missile_cache, function (type, list) {
                if(!missile_lists[type]) {
                    $.each(list, function () {
                        this.visible = false;
                    });
                }
            });
            var trap_lists = {};
            var trap_owner_lists = {};
            $.each(data[INDEX_TRAPS], function () {
                var type = _car_data[data[INDEX_CARS][this[INDEX_OWNER]][INDEX_CAR_ID]].type;
                var not_owner = this[INDEX_OWNER] != self_index;
                if(not_owner) {
                    _push_obj(trap_lists, type, this);
                } else {
                    _push_obj(trap_owner_lists, type, this);
                }
            });
            $.each(trap_lists, function (type, list) {
                var car_model = _get_car(type);
                if(!_trap_cache[type]) {
                    _trap_cache[type] = [];
                }
                $.sync_cache(list, _trap_cache[type], function () {
                    var res = car_model.gen_trap(true);
                    _scene.add(res);
                    return res;
                }, _disable_method, function (data, cache) {
                    cache.visible = true;
                    car_model.update_trap(cache, data, rotate_d);
                });
            });
            $.each(_trap_cache, function (type, list) {
                if(!trap_lists[type]) {
                    $.each(list, function () {
                        this.visible = false;
                    });
                }
            });
            $.each(trap_owner_lists, function (type, list) {
                var car_model = _get_car(type);
                if(!_trap_owner_cache[type]) {
                    _trap_owner_cache[type] = [];
                }
                $.sync_cache(list, _trap_owner_cache[type], function () {
                    var res = car_model.gen_trap(false);
                    _scene.add(res);
                    return res;
                }, _disable_method, function (data, cache) {
                    cache.visible = true;
                    car_model.update_trap(cache, data, rotate_d);
                });
            });
            $.each(_trap_owner_cache, function (type, list) {
                if(!trap_owner_lists[type]) {
                    $.each(list, function () {
                        this.visible = false;
                    });
                }
            });
        }

        //map, status
        var player_infos = [];
        for(var i = 0, l = data[INDEX_CARS].length; i < l; ++i) {
            if(i != self_index) {
                /*var p = cam.adjust_point({
                    x: data[INDEX_CARS][i][INDEX_X],
                    y: -200,
                    z: data[INDEX_CARS][i][INDEX_Z]
                });
                if(p.z + cam.focal_length - FAR >= 0) {
                    map.draw_others_status(_graphics2d, {
                        hp: data[INDEX_HP][i],
                        name: _rinfo.players[i].name,
                        ip: _rinfo.players[i].ip
                    }, cam.transform_point(p));
                }*/
                player_infos.push({
                    name: _rinfo.players[i].name,
                    hp: data[INDEX_HP][i],
                    position: null
                });
            }
        }
        if(_not_loading) {
            jcu.refresh(0, data, player_infos, _boxes_data, _car_data, _start_time, _rinfo, _get_car, STATUS_RUNNING);
        }

        //_renderer.shadowMapEnabled = options.quality != 0;
        _renderer.clear();
        _renderer.render(_scene, _camera);
    }
};

})(jQuery, window, THREE, jschariot_ui);
