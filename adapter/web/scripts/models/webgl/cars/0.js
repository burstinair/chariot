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
    _normal_car = null;

var _gen_geometry = function (data) {
    var res = new THREE.Geometry();
    var wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    var adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(-75, 15, 40));
    wheel.applyMatrix(adjust);
    da_yaw(wheel, data[INDEX_DA]);
    THREE.GeometryUtils.merge(res, wheel);
    
    wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(75, 15, 40));
    wheel.applyMatrix(adjust);
    da_yaw(wheel, data[INDEX_DA]);
    THREE.GeometryUtils.merge(res, wheel);
    
    wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(-75, 15, -40));
    wheel.applyMatrix(adjust);
    da_yaw(wheel, data[INDEX_DA]);
    THREE.GeometryUtils.merge(res, wheel);
    
    wheel = new THREE.CylinderGeometry(15, 15, 20, 20, 1, false);
    adjust = new THREE.Matrix4();
    adjust.makeRotationX(Math.PI / 2);
    adjust.makeRotationZ(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(75, 15, -40));
    wheel.applyMatrix(adjust);
    da_yaw(wheel, data[INDEX_DA]);
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
    
    da_yaw(res, data[INDEX_DA], 5);
    return res;
};

jcg_webgl.set_car_model(0, {
    clear: function () {
        _turn_left_car = null;
        _turn_right_car = null;
        _normal_car = null;
    },
    gen_car: function (data) {
        var da = data[INDEX_DA];
        var geometry = null;
        if(da == 1) {
            if(_turn_right_car == null) {
                _turn_right_car = _gen_geometry(data);
            }
            geometry = _turn_right_car;
        } else if(da == -1) {
            if(_turn_left_car == null) {
                _turn_left_car = _gen_geometry(data);
            }
            geometry = _turn_left_car;
        } else {
            if(_normal_car == null) {
                _normal_car = _gen_geometry(data);
            }
            geometry = _normal_car;
        }
        
        //var mm = new THREE.MeshLambertMaterial({color: 0xcc6622});
        var mm = new THREE.MeshPhongMaterial({color: 0xcc6622, specular: 0x333333, shininess: 100});
        //var mm = new THREE.MeshPhongMaterial({color: 0xcc6622});
        //mm.envMap = textureCube;
        //mm.combine = THREE.MixOperation;
        //mm.reflectivity = 0.75;
        var res_m = new THREE.Mesh(geometry, mm);
        res_m.rotation.y = data[INDEX_D] * Math.PI / 180;
        res_m.position.x = data[INDEX_X];
        res_m.position.y = 0;
        res_m.position.z = -data[INDEX_Z];
        return res_m;
    }
});

})(jQuery, THREE, jschariot_graphics_webgl);