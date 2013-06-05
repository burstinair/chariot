(function ($, THREE, jcg_webgl) {

var da_yaw = function (obj, da, degree) {
    degree = degree || 4;
    if(da < 0) {
        degree = -degree;
    }
    if(da != 0) {
        var adjust = new THREE.Matrix4();
        adjust.makeRotationY(degree * Math.PI / 180);
        obj.applyMatrix(adjust);
    }
};

var _turn_left_car = null,
    _turn_right_car = null,
    _normal_car = null,
    _material = null,
    _hp = null;

var _gen_car_geometry = function (da) {
    var res = new THREE.Geometry();
    var wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    var adjust = new THREE.Matrix4();
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(-75, 15, 40));
    wheel.applyMatrix(adjust);
    da_yaw(wheel, da);
    THREE.GeometryUtils.merge(res, wheel);
    
    wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(75, 15, 40));
    wheel.applyMatrix(adjust);
    da_yaw(wheel, da);
    THREE.GeometryUtils.merge(res, wheel);
    
    wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(-75, 15, -40));
    wheel.applyMatrix(adjust);
    da_yaw(wheel, da);
    THREE.GeometryUtils.merge(res, wheel);
    
    wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(75, 15, -40));
    wheel.applyMatrix(adjust);
    da_yaw(wheel, da);
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
    
    da_yaw(res, da, 5);
    return res;
};

jcg_webgl.set_car_model(0, {
    clear: function () {
        _turn_left_car = null;
        _turn_right_car = null;
        _normal_car = null;
        _material = null;
        _hp = null;
    },
    gen_car: function (data, hp) {
        if(_material == null) {
            var texture = THREE.ImageUtils.loadTexture("images/textures/cars/0.jpg");
            _material = new THREE.MeshPhongMaterial({color: 0xdddd66, specular: 0x333333, shininess: 100, map: texture});
            //_material = new THREE.MeshLambertMaterial({color: 0xcc6622});
            //_material = new THREE.MeshPhongMaterial({color: 0x886644, specular: 0x333333, shininess: 100});
            //_material = new THREE.MeshPhongMaterial({color: 0xcc6622});
            //_material.envMap = textureCube;
            //_material.combine = THREE.MixOperation;
            //_material.reflectivity = 0.75;
        }
        var geometry = null;
        var da = data[INDEX_DA];
        if(da == 1) {
            if(_turn_right_car == null) {
                _turn_right_car = _gen_car_geometry(da);
            }
            geometry = _turn_right_car;
        } else if(da == -1) {
            if(_turn_left_car == null) {
                _turn_left_car = _gen_car_geometry(da);
            }
            geometry = _turn_left_car;
        } else {
            if(_normal_car == null) {
                _normal_car = _gen_car_geometry(da);
            }
            geometry = _normal_car;
        }
        
        var res_m = new THREE.Object3D();
        
        var res_car = new THREE.Mesh(geometry, _material);
        res_car.rotation.y = data[INDEX_D] * Math.PI / 180;
        res_car.position.x = data[INDEX_X];
        res_car.position.y = 0;
        res_car.position.z = -data[INDEX_Z];
        res_car.castShadow = true;
        res_car.receiveShadow = true;
        
        res_m.add(res_car);
        
        if(hp != -1) {
            if(_hp == null) {
                _hp = new THREE.CylinderGeometry(40, 40, 15, 20, 1, false);
            }
            
            var res_hp = new THREE.Object3D();
            for(var i = 0; i < 3; ++i) {
                var color = 0xf8f8f8;
                if(hp > i) {
                    color = 0xcc4444;
                }
                var mhp = new THREE.Mesh(_hp, new THREE.MeshPhongMaterial({color: color}));
                mhp.position.y = (i - 1) * 17 + 180;
                res_hp.add(mhp);
            }
            
            res_hp.position.x = data[INDEX_X];
            res_hp.position.z = -data[INDEX_Z];
            
            res_m.add(res_hp);
        }
        
        return res_m;
    }
});

})(jQuery, THREE, jschariot_graphics_webgl);