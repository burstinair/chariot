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

var _hp_geometry = null;

var _start_time = 0;
var _boxes_data = [];
var _barriers = {};
var _map_type = null;
var _target = null;

var _load_lock;
var _load_complete_time;
var _not_loading;
var _is_first = null;

var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;
var _renderer, _camera, _scene;

var _initialize = function (data) {

    _not_loading = false;

    _load_lock = $.lock(false, function () {
        _load_complete_time = new Date().getTime();
    });

    for(var k in _car_cache) {
        _car_cache[k].reset(_load_lock.require_lock(true));
    }
    for(var i = 0, l = data.car_types.length; i < l; ++i) {
        var type = data.car_types[i];
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
    
    _renderer = new THREE.WebGLRenderer( { antialias: true } );
    _renderer.setClearColor(0xffffff, 1);
    _renderer.setSize(WIDTH, HEIGHT);
    _renderer.autoClear = false;
    _renderer.gammaInput = true;
    _renderer.gammaOutput = true;
    _renderer.physicallyBasedShading = true;
    _renderer.shadowMapType = THREE.PCFShadowMap;
    //_renderer.shadowMapSoft = false;
    _target = _renderer.domElement;
    _camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

    _hp_geometry = new THREE.CylinderGeometry(40, 40, 15, 20, 1, false);

    _load_lock.start();

    if(_is_first == null) {
        _is_first = true;
    } else {
        _is_first = false;
    }

    return _target;
};

/*var text_geometry = new THREE.TextGeometry("THREE.JS", {

    size: 200,
    height: 50,
    curveSegments: 12,

    font: "Arial",
    weight: "bold",
    style: "normal",

    bevelThickness: 2,
    bevelSize: 5,
    bevelEnabled: true

});
var text_material = new THREE.MeshPhongMaterial({color: 0xff0000, specular: 0xffffff, ambient: 0xaa0000});
*/
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
            degree = degree || 4;
            if(da < 0) {
                degree = -degree;
            }
            if(da != 0) {
                var adjust = new THREE.Matrix4();
                adjust.makeRotationY(degree * Math.PI / 180);
                obj.applyMatrix(adjust);
            }
        }
    },
    draw: function (data, _rinfo, options) {

        if(!_load_lock.is_done()) {
            jcu.refresh(0, data, null, _boxes_data, _start_time, _rinfo, _get_car, STATUS_LOADING);
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
        var self_team = data[INDEX_CARS][self_index][INDEX_TEAM];
        var map = _get_map(_map_type);

        _scene = new THREE.Scene();

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
        _scene.add(_camera);
        //var camera = new THREE.PerspectiveCamera( 23, ASPECT, NEAR, FAR );
        //camera.position.set( 700, 50, 1900 );
        //_scene.add(camera);
        
        //boxes visible
        var boxes_status_tmp = data[INDEX_BOXES];
        var boxes_readed_length = 0
        var boxes_index = _boxes_data.length - 1;
        while(boxes_readed_length < boxes_status_tmp.length) {
            var cur_boxes = boxes_status_tmp.substr(boxes_readed_length, 6);
            boxes_readed_length += cur_boxes.length;
            var _box_visible_status = parseInt(cur_boxes, 36);
            for(var i = 29 > boxes_index ? boxes_index : 29; i >= 0 && boxes_index >= 0; --i, --boxes_index) {
                _boxes_data[boxes_index].v = !!(_box_visible_status & (1 << i));
            }
        }
        
        //scene
        if(map != null) {
            _scene.fog = map.gen_fog();
            var lights = map.gen_lights(data, options);
            for(var k in lights) {
                _scene.add(lights[k]);
            }

            /*var scene = _scene;
            var ambient = new THREE.AmbientLight( 0x444444 );
            scene.add( ambient );

            //light = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI, 1 );
            light = new THREE.DirectionalLight( 0xffffff, 1, 0, Math.PI, 10 );
            light.position.set( 0, 25000, 1000 );
            light.target.position.set( 0, 0, 0 );

            light.castShadow = true;
            //light.onlyShadow = true;

            light.shadowCameraLeft = -1000;
            light.shadowCameraRight = 1000;
            light.shadowCameraTop = 1000;
            light.shadowCameraBottom = -1000;
            light.shadowCameraNear = 700;
            light.shadowCameraFar = FAR;
            light.shadowCameraFov = 50;

            light.shadowCameraVisible = true;

            light.shadowBias = 0.0001;
            light.shadowDarkness = 0.5;

            light.shadowMapWidth = 512;
            light.shadowMapHeight = 512;

            scene.add( light );*/
            var scene_objs = map.gen_scene();
            for(var k in scene_objs) {
                _scene.add(scene_objs[k]);
            }
            $.each(data[INDEX_CARS], function (i) {
                var car_data = this;
                var car = _get_car(car_data[INDEX_TYPE]);
                if(car != null) {
                    var res_m;
                    if(i != self_index) {
                        res_m = new THREE.Object3D();
                        res_m.add(car.gen_car(this));

                        var hp = data[INDEX_HP][i];
                        var res_hp = new THREE.Object3D();
                        for(var i = 0; i < 3; ++i) {
                            var color = 0xf8f8f8;
                            if(hp > i) {
                                if(options.all_colors) {
                                    color = TEAM_COLORS[car_data[INDEX_TEAM]];
                                } else {
                                    color = self_team == car_data[INDEX_TEAM] ? 0x6666cc : 0xcc6666;
                                }
                            }
                            var mhp = new THREE.Mesh(_hp_geometry, new THREE.MeshPhongMaterial({color: color}));
                            mhp.position.y = (i - 1) * 17 + 180;
                            res_hp.add(mhp);
                        }

                        res_hp.position.x = car_data[INDEX_X];
                        res_hp.position.z = -car_data[INDEX_Z];

                        res_m.add(res_hp);
                    } else {
                        res_m = car.gen_car(car_data);
                    }
                    _scene.add(res_m);
                }
            });
            var rotate_d_date = new Date();
            var rotate_d = (rotate_d_date.getSeconds() % 4 + rotate_d_date.getMilliseconds() / 1000) * 90;
            $.each(_boxes_data, function (i, box_data) {
                if(box_data.v) {
                    _scene.add(map.gen_box(box_data, rotate_d));
                }
            });
            $.each(data[INDEX_TRAPS], function () {
                _scene.add(_get_car(this[INDEX_TYPE]).gen_trap(this, this[INDEX_OWNER] != self_index, rotate_d));
            });
            $.each(data[INDEX_MISSILES], function () {
                _scene.add(_get_car(this[INDEX_TYPE]).gen_missile(this, rotate_d));
            });
        }

        //_scene.add(new THREE.Mesh(text_geometry, text_material));

        //map, status
        if(map != null) {
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
                jcu.refresh(0, data, player_infos, _boxes_data, _start_time, _rinfo, _get_car, STATUS_RUNNING);
            }
        }

        _renderer.shadowMapEnabled = options.shadow != 0;
        _renderer.shadowMapType = THREE.PCFShadowMap;
        _renderer.clear();
        _renderer.render(_scene, _camera);
    }
};

})(jQuery, window, THREE, jschariot_ui);
