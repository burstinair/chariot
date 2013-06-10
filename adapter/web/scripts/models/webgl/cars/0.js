(function ($, THREE, jcg_webgl) {

var _missile_cache = null,
    _missile_material = null,
    _trap_cache = null,
    _trap_material = null,
    _trap_cache_self = null,
    _trap_material_self = null,
    _turn_left_car = null,
    _turn_right_car = null,
    _normal_car = null,
    _material = null;

var _gen_car_geometry = function (da) {
    var res = new THREE.Geometry();
    var wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    var adjust = new THREE.Matrix4();
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(-75, 15, 40));
    wheel.applyMatrix(adjust);
    jcg_webgl.utils.da_yaw(wheel, da);
    THREE.GeometryUtils.merge(res, wheel);
    
    wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(75, 15, 40));
    wheel.applyMatrix(adjust);
    jcg_webgl.utils.da_yaw(wheel, da);
    THREE.GeometryUtils.merge(res, wheel);
    
    wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(-75, 15, -40));
    wheel.applyMatrix(adjust);
    jcg_webgl.utils.da_yaw(wheel, da);
    THREE.GeometryUtils.merge(res, wheel);
    
    wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(75, 15, -40));
    wheel.applyMatrix(adjust);
    jcg_webgl.utils.da_yaw(wheel, da);
    THREE.GeometryUtils.merge(res, wheel);
    
    var body = new THREE.CubeGeometry(150, 50, 200);
    /*body[0][2].y += 15;
    body[0][3].y += 15;
    body[2][3].z -= 15;
    body[2].push({
        x: 75, y: -10, z: 100
    });
    body[3][0].z -= 15;
    body[3] = $.merge([{
        x: -75, y: -10, z: 100
    }], body[3]);
    body[5][0].z -= 15;
    body[5][1].z -= 15;
    body.push([
        {x: -75, y: -10, z: 100},
        {x: 75, y: -10, z: 100},
        {x: 75, y: -25, z: 85},
        {x: -75, y: -25, z: 85}
    ]);*/
    adjust = new THREE.Matrix4();
    adjust.setPosition(new THREE.Vector3(0, 50, 0));
    body.applyMatrix(adjust);
    THREE.GeometryUtils.merge(res, body);
    
    var head = new THREE.CubeGeometry(100, 50, 100);
    /*head[0][2].y += 15;
    head[0][3].y += 15;
    head[2][3].z -= 15;
    head[2].push({
        x: 50, y: -10, z: 50
    });
    head[3][0].z -= 15;
    head[3] = $.merge([{
        x: -50, y: -10, z: 50
    }], head[3]);
    head[5][0].z -= 15;
    head[5][1].z -= 15;
    head.push([
        {x: -50, y: -10, z: 50},
        {x: 50, y: -10, z: 50},
        {x: 50, y: -25, z: 35},
        {x: -50, y: -25, z: 35}
    ]);*/
    adjust = new THREE.Matrix4();
    adjust.setPosition(new THREE.Vector3(0, 100, 20));
    head.applyMatrix(adjust);
    THREE.GeometryUtils.merge(res, head);

    jcg_webgl.utils.da_yaw(res, da, 5);
    return res;
};

var loadMaterial = function () {
    var texture = THREE.ImageUtils.loadTexture("images/textures/cars/0/car.jpg");
    _material = new THREE.MeshPhongMaterial({color: 0xdddd66, specular: 0x333333, shininess: 100, map: texture});
    //_material = new THREE.MeshLambertMaterial({color: 0xcc6622, morphTargets: true, morphNormals: true});
    //_material = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0xffffff, shininess: 20, morphTargets: true, morphNormals: true, vertexColors: THREE.FaceColors, shading: THREE.SmoothShading});
    //_material = new THREE.MeshPhongMaterial({color: 0x886644, specular: 0x333333, shininess: 100});
    //_material = new THREE.MeshPhongMaterial({color: 0xcc6622});
    //_material.envMap = textureCube;
    //_material.combine = THREE.MixOperation;
    //_material.reflectivity = 0.75;
}

var _reset = function (lock) {
    var trap_lock = lock.require();
    var loader = new THREE.JSONLoader();
    loader.load("images/textures/cars/0/trap.js", function (geometry, materials) {
        _trap_cache = geometry;
        _trap_material = new THREE.MeshFaceMaterial(materials);
        trap_lock.done();
    })

    var trap_lock_safe = lock.require();
    loader.load("images/textures/cars/0/trap_safe.js", function (geometry, materials) {
        _trap_cache_self = geometry;
        _trap_material_self = new THREE.MeshFaceMaterial(materials);
        trap_lock_safe.done();
    });

    var missile_lock = lock.require();
    loader.load("images/textures/cars/0/missile.js", function (geometry, materials) {
        _missile_cache = geometry;
        var adjust = new THREE.Matrix4();
        adjust.makeRotationY(Math.PI);
        _missile_cache.applyMatrix(adjust);
        _missile_material = new THREE.MeshFaceMaterial(materials);
        missile_lock.done();
    });

    //_missile_cache = new THREE.CylinderGeometry(0, 5, 50, 10, 1, false);
    //var adjust = new THREE.Matrix4();
    //adjust.makeRotationX(-Math.PI / 2);
    //_missile_cache.applyMatrix(adjust);

    loadMaterial();

    _turn_right_car = _gen_car_geometry(1);
    _turn_left_car = _gen_car_geometry(-1);
    _normal_car = _gen_car_geometry(0);

    lock.start();
};
_reset($.lock(true, function () {
    jcg_webgl.set_car_model("0", {
        reset: _reset,
        gen_car: function (data) {
            var geometry = null;
            var da = data[INDEX_DA];
            if(da == 1) {
                geometry = _turn_right_car;
            } else if(da == -1) {
                geometry = _turn_left_car;
            } else {
                geometry = _normal_car;
            }
            var res_m = new THREE.Mesh(geometry, _material);
            res_m.rotation.y = data[INDEX_D] * Math.PI / 180;
            res_m.position.y = 0;
            res_m.castShadow = true;
            res_m.receiveShadow = true;
            res_m.position.x = data[INDEX_X];
            res_m.position.z = -data[INDEX_Z];
            return res_m;
        },
        gen_trap: function (data, not_own) {
            var geometry = _trap_cache_self;
            var material = _trap_material_self;
            if(not_own) {
                //color = 0x662222;
                geometry = _trap_cache;
                material = _trap_material;
            }
            //var _trap_material = new THREE.MeshLambertMaterial({color: color});
            //var _trap_material = new THREE.MeshPhongMaterial({color: color, specular: 0xffffff, shininess: 1000});
            var res_m = new THREE.Mesh(geometry, material);
            res_m.rotation.y = data[INDEX_D] * Math.PI / 180;
            res_m.position.x = data[INDEX_X];
            res_m.position.y = 23;
            res_m.position.z = -data[INDEX_Z];
            res_m.castShadow = true;
            res_m.receiveShadow = true;
            return res_m;
        },
        gen_missile: function (data) {
            //var res_m = new THREE.Mesh(_missile_cache, new THREE.MeshLambertMaterial({color: 0x444444}));
            //var res_m = new THREE.Mesh(_missile_cache, new THREE.MeshPhongMaterial({color: 0x444444, specular: 0x333333, shininess: 100}));
            //var res_m = new THREE.Mesh(_missile_cache, _material);
            var res_m = new THREE.Mesh(_missile_cache, _missile_material);
            res_m.rotation.y = data[INDEX_D] * Math.PI / 180;
            res_m.position.x = data[INDEX_X];
            res_m.position.y = 100;
            res_m.position.z = -data[INDEX_Z];
            //var r = Math.random();
            //var size = 2;
            //if(r > 0.8)
            //    size = 6;
            //else if(r > 0.5)
            //    size = 3;
            res_m.scale.x = 3;
            res_m.scale.y = 3;
            res_m.scale_z = 3;
            //res_m.castShadow = true;
            //res_m.receiveShadow = true;
            return res_m;
        },
        trap_msg: function (self, target) {
            return [target, "踩到了", self, "的便便(⊙o⊙)…"].join(' ');
        },
        missile_msg: function (self, target) {
            return [target, "被", self, "的铅笔戳了菊花！"].join(' ');
        }
    });
}));

})(jQuery, THREE, jschariot_graphics_webgl);