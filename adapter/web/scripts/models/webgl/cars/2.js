(function ($, THREE, jcg_webgl) {

var _missile_cache = null,
    _missile_material = null,
    _trap_cache = null,
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
    var texture = THREE.ImageUtils.loadTexture("images/textures/cars/2/car.jpg");
    _material = new THREE.MeshPhongMaterial({ambient: 0xffffff, shininess: 100, map: texture});
    //_material = new THREE.MeshLambertMaterial({color: 0xcc6622});
    //_material = new THREE.MeshPhongMaterial({color: 0x886644, specular: 0x333333, shininess: 100});
    //_material = new THREE.MeshPhongMaterial({color: 0xcc6622});
    //_material.envMap = textureCube;
    //_material.combine = THREE.MixOperation;
    //_material.reflectivity = 0.75;
}

var _reset = function (lock) {
    _trap_cache = new THREE.CylinderGeometry(0, 56, 28, 7, 1, false);

    var missile_lock = lock.require();
    //_missile_cache = new THREE.CylinderGeometry(0, 5, 50, 10, 1, false);
    //var adjust = new THREE.Matrix4();
    //adjust.makeRotationX(-Math.PI / 2);
    //_missile_cache.applyMatrix(adjust);
    var loader = new THREE.JSONLoader();
    loader.load("images/textures/cars/2/missile.js", function (geometry, materials) {
        //var loader = new THREE.OBJMTLLoader();
        //loader.addEventListener( 'load', function (event) {
        //    _missile_cache = event.content;
        _missile_cache = geometry;
        var adjust = new THREE.Matrix4();
        adjust.makeScale(4, 4, 4);
        _missile_cache.applyMatrix(adjust);
        adjust = new THREE.Matrix4();
        adjust.makeRotationY(Math.PI / 2);
        _missile_cache.applyMatrix(adjust);

        //adjust = new THREE.Matrix4();
        //adjust.makeRotationX(Math.PI / 3);
        //_missile_cache.applyMatrix(adjust);

        _missile_material = new THREE.MeshFaceMaterial(materials);

        missile_lock.done();
    });
    //loader.load("images/textures/cars/1/13.obj", "images/textures/cars/1/13.mtl");

    loadMaterial();

    _turn_right_car = _gen_car_geometry(1);
    _turn_left_car = _gen_car_geometry(-1);
    _normal_car = _gen_car_geometry(0);

    lock.start();
};
_reset($.lock(true, function () {
    jcg_webgl.set_car_model("2", {
        reset: _reset,
        gen_car: function (da) {
            var geometry = null;
            if(da == 1) {
                geometry = _turn_right_car;
            } else if(da == -1) {
                geometry = _turn_left_car;
            } else {
                geometry = _normal_car;
            }
            var res_m = new THREE.Mesh(geometry, _material);
            res_m.castShadow = true;
            //res_m.receiveShadow = true;
            return res_m;
        },
        gen_trap: function (not_own) {
            var color = 0x333333;
            if(not_own)
                color = 0x662222;
            //var _trap_material = new THREE.MeshLambertMaterial({color: color});
            var _trap_material = new THREE.MeshPhongMaterial({color: color, specular: 0xffffff, shininess: 1000});
            var res_m = new THREE.Mesh(_trap_cache, _trap_material);
            res_m.castShadow = true;
            res_m.receiveShadow = true;
            return res_m;
        },
        update_trap: function(mesh, data, rotate_d) {
            mesh.rotation.y = data[INDEX_D] * Math.PI / 180;
            mesh.position.set(data[INDEX_X], 5, -data[INDEX_Z]);
        },
        gen_missile: function () {
            //var res_m = new THREE.Mesh(_missile_cache, new THREE.MeshLambertMaterial({color: 0x444444}));
            //var res_m = new THREE.Mesh(_missile_cache, new THREE.MeshPhongMaterial({color: 0x444444, specular: 0x333333, shininess: 100}));
            //var res_m = new THREE.Mesh(_missile_cache, _material);
            //var res_m = new THREE.Mesh(_missile_cache, _missile_material);
            //_missile_material.morphTargets = true;
            var res_m = new THREE.Mesh(_missile_cache, _missile_material);
            //var res_m = _missile_cache;
            /*var r = Math.random();
             var size = 2;
             if(r > 0.8)
                size = 6;
             else if(r > 0.5)
                size = 3;
             res_m.scale.x = size;
             res_m.scale.y = size;
             res_m.scale_z = size;*/
            res_m.castShadow = true;
            res_m.receiveShadow = true;
            return res_m;
        },
        update_missile: function(mesh, data, rotate_d) {
            mesh.rotation.set(0, data[INDEX_D] * Math.PI / 180, rotate_d * Math.PI / 45);
            mesh.position.set(data[INDEX_X], 100, -data[INDEX_Z]);
        },
        trap_msg: function (self, target) {
            return [target, "踩到了", self, "的炸弹！"].join(' ');
        },
        missile_msg: function (self, target) {
            return [target, "被", self, "的螺旋飞弹击中了！"].join(' ');
        }
    });
}));


})(jQuery, THREE, jschariot_graphics_webgl);