(function ($, window) {

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

var _sphere, _floor;

var _initialize = function (data) {
    _start_time = data.start_time;
    _boxes_data = data.boxes;
    
    WIDTH = GAME_WIDTH;
    HEIGHT = GAME_HEIGHT;
    VIEW_ANGLE = 45;
    ASPECT = WIDTH / HEIGHT;
    NEAR = 0.1;
    FAR = 10000;
    
    _renderer = new THREE.WebGLRenderer();
    _camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    _scene = new THREE.Scene();
    _scene.add(_camera);
    _camera.position.z = 300;
    _renderer.setSize(WIDTH, HEIGHT);
    _target = _renderer.domElement;

    geometry = new THREE.PlaneGeometry( 200, 200 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 4 ) );

    var material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );

    _floor = new THREE.Mesh( geometry, material );
    _scene.add( _floor );

    var sphereMaterial = new THREE.MeshPhongMaterial(
    {
        color: 0xff4400, specular: 0x333333, shininess: 100
    });
    
    // create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!
    _sphere = new THREE.Mesh(
        new THREE.CylinderGeometry(15, 15, 20, 20, 1, false),
        sphereMaterial
    );
    
    _sphere.geometry.dynamic = true;
    //_sphere.geometry.verticesNeedUpdate = true;
    //_sphere.geometry.normalsNeedUpdate = true;
    
    // add the sphere to the scene
    _scene.add(_sphere);
    
    var pointLight = new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 0;
    pointLight.position.y = 150;
    pointLight.position.z = 150;

    // add to the scene
    _scene.add(pointLight);
    
    return _target;
};

window.jschariot_graphics_webgl = {
    initialize: _initialize,
    draw: function (data, _rinfo, options) {
        //_sphere.rotation.x += Math.PI / 10;
        _renderer.render(_scene, _camera);
    }
};

})(jQuery, window);
