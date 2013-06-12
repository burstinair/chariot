(function ($, THREE, jcg_webgl) {

var _missile_cache = null,
    _missile_material = null,
    _trap_cache = null,
    _trap_material = null,
    _trap_cache_self = null,
    _trap_material_self = null,
    _car_cache = null,
    _car_material = null;

var _gen_car_geometry = function (lock) {
    var loader = new THREE.JSONLoader();
    loader.load("images/textures/cars/1/car.js", function (geometry, materials) {
        //var adjust = new THREE.Matrix4();
        //adjust.setPosition(new THREE.Vector3(0, 15, 0));
        //geometry.applyMatrix(adjust);
        var adjust = new THREE.Matrix4();
        adjust.makeRotationY(Math.PI);
        geometry.applyMatrix(adjust);

        //adjust = new THREE.Matrix4();
        //adjust.makeRotationX(Math.PI / 3);
        //geometry.applyMatrix(adjust);

        //adjust = new THREE.Matrix4();
        //adjust.makeScale(4, 4, 4);
        //geometry.applyMatrix(adjust);
        _car_cache = geometry;
        $.each(materials, function () {
            this.transparent = true;
        });
        _car_material = new THREE.MeshFaceMaterial(materials);
        _car_material.transparent = true;

        lock.done();
    });
};

var _reset = function (lock) {
    var missile_lock = lock.require();
    //_missile_cache = new THREE.CylinderGeometry(0, 5, 50, 10, 1, false);
    //var adjust = new THREE.Matrix4();
    //adjust.makeRotationX(-Math.PI / 2);
    //_missile_cache.applyMatrix(adjust);
    var loader = new THREE.JSONLoader();
    loader.load("images/textures/cars/1/missile.js", function (geometry, materials) {
        //var loader = new THREE.OBJMTLLoader();
        //loader.addEventListener( 'load', function (event) {
        //    _missile_cache = event.content;
        _missile_cache = geometry;
        //var adjust = new THREE.Matrix4();
        //adjust.makeScale(3, 3, 3);
        //_missile_cache.applyMatrix(adjust);
        //var adjust = new THREE.Matrix4();
        //adjust.makeRotationY(Math.PI / 2);
        //_missile_cache.applyMatrix(adjust);

        //adjust = new THREE.Matrix4();
        //adjust.makeRotationX(Math.PI / 3);
        //_missile_cache.applyMatrix(adjust);

        _missile_material = new THREE.MeshFaceMaterial(materials);

        missile_lock.done();
    });
    //loader.load("images/textures/cars/1/13.obj", "images/textures/cars/1/13.mtl")
    var _trap_lock = lock.require();
    loader.load("images/textures/cars/1/trap.js", function (geometry, materials) {
        //_trap_cache = new THREE.CylinderGeometry(0, 56, 28, 7, 1, false);
        _trap_cache = geometry;
        _trap_material = new THREE.MeshFaceMaterial(materials);
        _trap_lock.done();
    });
    var _trap_self_lock = lock.require();
    loader.load("images/textures/cars/1/trap_safe.js", function (geometry, materials) {
        //_trap_cache = new THREE.CylinderGeometry(0, 56, 28, 7, 1, false);
        _trap_cache_self = geometry;
        _trap_material_self = new THREE.MeshFaceMaterial(materials);
        _trap_self_lock.done();
    });

    $.start(_gen_car_geometry, lock.require());

    lock.start();
};
_reset($.lock(true, function () {
    jcg_webgl.set_car_model("1", {
        reset: _reset,
        gen_car: function (data) {
            var da = data[INDEX_DA];
            var res_m = new THREE.Mesh(_car_cache, _car_material);
            res_m.rotation.y = data[INDEX_D] * Math.PI / 180;
            jcg_webgl.utils.da_yaw(res_m, da, 5);
            res_m.position.x = data[INDEX_X];
            res_m.position.y = 0;
            res_m.position.z = -data[INDEX_Z];
            res_m.castShadow = true;
            res_m.receiveShadow = true;
            return res_m;
        },
        gen_trap: function (data, not_own) {
            var geometry = _trap_cache_self, material = _trap_material_self;
            //var color = 0x333333;
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
            //res_m.castShadow = true;
            //res_m.receiveShadow = true;
            return res_m;
        },
        gen_missile: function (data, rotate_d) {
            //var res_m = new THREE.Mesh(_missile_cache, new THREE.MeshLambertMaterial({color: 0x444444}));
            //var res_m = new THREE.Mesh(_missile_cache, new THREE.MeshPhongMaterial({color: 0x444444, specular: 0x333333, shininess: 100}));
            //var res_m = new THREE.Mesh(_missile_cache, _material);
            //var res_m = new THREE.Mesh(_missile_cache, _missile_material);
            //_missile_material.morphTargets = true;
            var res_m = new THREE.MorphAnimMesh(_missile_cache, _missile_material);
            //var res_m = _missile_cache;
            res_m.rotation.y = data[INDEX_D] * Math.PI / 180;
            res_m.position.x = data[INDEX_X];
            res_m.position.y = 100;
            res_m.position.z = -data[INDEX_Z];
            var r = Math.random();
            /*var size = 2;
             if(r > 0.8)
             size = 6;
             else if(r > 0.5)
             size = 3;
             res_m.scale.x = size;
             res_m.scale.y = size;
             res_m.scale_z = size;*/
            //res_m.castShadow = true;
            //res_m.receiveShadow = true;
            return res_m;
        },
        trap_msg: function (self, target) {
            return [target, "被", self, "的考研占座吓到了！"].join(' ');
        },
        missile_msg: function (self, target) {
            return [target, "居然被", self, "的瓶盖打中了！"].join(' ');
        }
    });
}));

})(jQuery, THREE, jschariot_graphics_webgl);