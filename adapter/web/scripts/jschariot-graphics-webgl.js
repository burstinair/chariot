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

var _start_time = 0;
var _boxes_data = [];
var _target = null;

var WIDTH, HEIGHT, VIEW_ANGLE, ASPECT, NEAR, FAR;
var _renderer, _camera, _scene;

var _initialize = function (data) {
    for(var k in _car_cache) {
        _car_cache[k].clear();
    }
    
    for(var k in _map_cache) {
        _map_cache[k].clear();
    }
    
    _start_time = data.start_time;
    _boxes_data = data.boxes;
    
    WIDTH = GAME_WIDTH;
    HEIGHT = GAME_HEIGHT;
    VIEW_ANGLE = 45;
    ASPECT = WIDTH / HEIGHT;
    NEAR = 0.1;
    FAR = 100000;
    
    _renderer = new THREE.WebGLRenderer( { antialias: true } );
    _renderer.setClearColor(0xffffff, 1);
    _renderer.setSize(WIDTH, HEIGHT);
    _renderer.autoClear = false;
    _renderer.gammaInput = true;
    _renderer.gammaOutput = true;
    _renderer.physicallyBasedShading = true;
    //_renderer.shadowMapSoft = false;
    _target = _renderer.domElement;
    _camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    
    return _target;
};

var first = true;
var drawing = false;

window.jschariot_graphics_webgl = {
    initialize: _initialize,
    set_car_model: function (tp, data) {
        _car_cache[tp] = data;
        _car_cache[tp].loaded = true;
    },
    set_map_model: function (map, data) {
        _map_cache[map] = data;
        _map_cache[map].loaded = true;
    },
    draw: function (data, _rinfo, options) {

        if(drawing) {
            return;
        }
        //drawing = true;

        var map = _get_map(data[INDEX_MAP_TYPE]);

        _scene = new THREE.Scene();

        //camera
        var d_pos = data[INDEX_CARS][data[INDEX_INDEX]];
        var d_angle = d_pos[INDEX_D] * Math.PI / 180;
        _camera.rotation.y = d_angle;
        _camera.position.x = d_pos[INDEX_X] + 600 * Math.sin(d_angle);
        _camera.position.y = 200;
        _camera.position.z = 600 * Math.cos(d_angle) - d_pos[INDEX_Z];
        _scene.add(_camera);
        
        //boxes visible
        var _box_visible_status = parseInt(data[INDEX_BOXES], 36);
        for(var i = _boxes_data.length - 1; i >= 0; --i) {
            _boxes_data[i].v = !!(_box_visible_status & (1 << i));
        }
        
        //scene
        if(map != null) {
            _scene.fog = map.gen_fog();
            var scene_objs = map.gen_scene();
            for(var k in scene_objs) {
                _scene.add(scene_objs[k]);
            }
            var lights = map.gen_lights(data, options);
            for(var k in lights) {
                _scene.add(lights[k]);
            }
            $.each(data[INDEX_CARS], function (i) {
                var car = _get_car(this[INDEX_TYPE]);
                if(car != null) {
                    _scene.add(car.gen_car(this, i == data[INDEX_INDEX] ? -1 : data[INDEX_HP][i]));
                }
            });
            var box_d_date = new Date();
            var box_d = (box_d_date.getSeconds() % 4 + box_d_date.getMilliseconds() / 1000) * 90;
            $.each(_boxes_data, function (i, box_data) {
                if(box_data.v) {
                    _scene.add(map.gen_box(box_data, box_d));
                }
            });
            $.each(data[INDEX_TRAPS], function () {
                _scene.add(_get_car(this[INDEX_TYPE]).gen_trap(this, this[INDEX_OWNER] != data[INDEX_INDEX]));
            });
            $.each(data[INDEX_MISSILES], function () {
                _scene.add(_get_car(this[INDEX_TYPE]).gen_missile(this));
            });
        }
        
        //map, status
        if(map != null) {
            var player_infos = [];
            for(var i = 0, l = data[INDEX_CARS].length; i < l; ++i) {
                if(i != data[INDEX_INDEX]) {
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
            jcu.refresh(0, data, player_infos, _boxes_data, _start_time, STATUS_RUNNING);
        } else {
            jcu.refresh(0, data, null, _boxes_data, _start_time, STATUS_LOADING);
        }

        _renderer.shadowMapEnabled = options.shadow != 0;
        _renderer.render(_scene, _camera);

        drawing = false;
    }
};

})(jQuery, window, THREE, jschariot_ui);
