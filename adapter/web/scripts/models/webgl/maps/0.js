(function ($, THREE, jcg_webgl, jcg) {

var _scene_cube_cache = null,
    _scene_cube_texture = null,
    _scene_cube_material = null,
    _floor_cache = null,
    _floor_material = null,
    _wall_cache = null,
    _wall_material = null,
    _box_cache = null,
    _box_material = null,

    _boxes_cache = null,
    _hemi_light = null,
    _god_light = null;

var init_wall = function (lock) {
    _wall_cache = new THREE.Geometry();

    var wall = new THREE.PlaneGeometry(8300, 400);
    var adjust = new THREE.Matrix4();
    adjust.setPosition(new THREE.Vector3(0, 100, -4150));
    wall.applyMatrix(adjust);
    THREE.GeometryUtils.merge(_wall_cache, wall);

    wall = new THREE.PlaneGeometry(8300, 400);
    adjust = new THREE.Matrix4();
    adjust.makeRotationY(Math.PI);
    adjust.setPosition(new THREE.Vector3(0, 100, 4150));
    wall.applyMatrix(adjust);
    THREE.GeometryUtils.merge(_wall_cache, wall);

    wall = new THREE.PlaneGeometry(8300, 400);
    adjust = new THREE.Matrix4();
    adjust.makeRotationY(-Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(4150, 100, 0));
    wall.applyMatrix(adjust);
    THREE.GeometryUtils.merge(_wall_cache, wall);

    wall = new THREE.PlaneGeometry(8300, 400);
    adjust = new THREE.Matrix4();
    adjust.makeRotationY(Math.PI / 2);
    adjust.setPosition(new THREE.Vector3(-4150, 100, 0));
    wall.applyMatrix(adjust);
    THREE.GeometryUtils.merge(_wall_cache, wall);

    var texture = THREE.ImageUtils.loadTexture( "images/textures/crate.gif" );
    texture.anisotropy = 8;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(44, 2);
    _wall_material = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture } );
    //_wall_material = new THREE.MeshLambertMaterial({color: 0x999999});
    //_wall_material = new THREE.MeshPhongMaterial({color: 0x999999, specular: 0x333333, shininess: 100});

    lock.done();
};

var init_floor = function (lock) {
    //var texture = THREE.ImageUtils.loadTexture( "images/textures/crate.gif" );
    //var texture = THREE.ImageUtils.loadTexture("images/textures/terrain/grasslight-big.jpg");
    //var texture = THREE.ImageUtils.loadTexture("images/textures/terrain/backgrounddetailed6.jpg");
    //var texture = THREE.ImageUtils.loadTexture("images/textures/stone.jpg");
    var texture = THREE.ImageUtils.loadTexture("images/textures/rocks.jpg");
    //var texture = THREE.ImageUtils.loadTexture("images/textures/lava/lavatile.jpg");
    texture.anisotropy = 8;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);

    _floor_material = new THREE.MeshPhongMaterial({color: 0xffffff, shininess: 0, emissive: 0xbbbbbb, map: texture});
    //_floor_material = new THREE.MeshPhongMaterial( { emissive: 0xbbbbbb } );

    _floor_cache = new THREE.PlaneGeometry(100, 100);

    lock.done();
};

var init_box = function (lock) {
    _box_cache = new THREE.CubeGeometry(50, 50, 50);
    //_box_material = new THREE.MeshLambertMaterial({color: 0x999966});
    //_box_material = new THREE.MeshLambertMaterial({color: 0xdddd66});
    var texture = THREE.ImageUtils.loadTexture("images/textures/woodboard2.jpg");
    texture.anisotropy = 8;
    _box_material = new THREE.MeshPhongMaterial({color: 0xdddd66, specular: 0x333333, shininess: 100, map: texture});
    lock.done();
};

var init_scene_cube = function (lock) {
    /*var r = "images/textures/cube/skybox/";
     var urls = [ r + "px.jpg", r + "nx.jpg",
     r + "py.jpg", r + "ny.jpg",
     r + "pz.jpg", r + "nz.jpg" ];
     _scene_cube_texture = THREE.ImageUtils.loadTextureCube( urls );

     var shader = THREE.ShaderLib[ "cube" ];
     shader.uniforms[ "tCube" ].value = _scene_cube_texture;

     _scene_cube_material = new THREE.ShaderMaterial( {

     fragmentShader: shader.fragmentShader,
     vertexShader: shader.vertexShader,
     uniforms: shader.uniforms,
     depthWrite: false,
     side: THREE.BackSide

     } ),

     _scene_cube_cache = new THREE.CubeGeometry( 10000, 10000, 10000 );*/

    var vertexShader = "varying vec3 vWorldPosition;void main() {vec4 worldPosition = modelMatrix * vec4( position, 1.0 );vWorldPosition = worldPosition.xyz;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}";
    var fragmentShader = "uniform vec3 topColor;uniform vec3 bottomColor;uniform float offset;uniform float exponent;varying vec3 vWorldPosition;void main() {float h = normalize( vWorldPosition + offset ).y;gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );}";
    var uniforms = {
        topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
        bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
        offset:		 { type: "f", value: 400 },
        exponent:	 { type: "f", value: 0.6 }
    }
    uniforms.topColor.value.setHSL(0.6, 1, 0.75);

    //_scene.fog.color.copy( uniforms.bottomColor.value );

    _scene_cube_cache = new THREE.SphereGeometry( 6000, 32, 15 );
    _scene_cube_material = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

    lock.done();
};

var _reset = function (lock) {
    $.start(init_wall, lock.require());
    $.start(init_floor, lock.require());
    $.start(init_box, lock.require());
    $.start(init_scene_cube, lock.require());
    lock.start();
};
_reset($.lock(true, function () {
    jcg_webgl.set_map_model(0, {
        reset: _reset,
        gen_wall: function () {
            var res_m = new THREE.Mesh(_wall_cache, _wall_material);
            res_m.castShadow = true;
            res_m.receiveShadow = true;
            return res_m;
        },
        gen_floor: function () {
            var res_m = new THREE.Mesh(_floor_cache, _floor_material);
            res_m.rotation.x = - Math.PI / 2;
            res_m.scale.set(83, 83, 83);
            res_m.castShadow = false;
            res_m.receiveShadow = true;
            return res_m;
        },
        gen_fog: function () {
            return new THREE.Fog( 0xffffff, 1, 15000);
            //res.push(new THREE.FogExp2(0x444444, 100000));
        },
        add_lights: function (data, options) {
            //_hemi_light = new THREE.HemisphereLight(0xddeeff, 0xcccccc, 1.25);
            _hemi_light = new THREE.HemisphereLight(0x999999, 0xffffff, 1);
            //_hemi_light.color.setHSL( 0.6, 1, 0.75 );
            //_hemi_light.groundColor.setHSL( 0.1, 0.8, 0.7 );
            _hemi_light.position.y = 500;
            jcg_webgl.utils.scene_add(_hemi_light);

            //for()

            //_god_light = new THREE.DirectionalLight(0xffffff, 1, 0, Math.PI, 10);
            _god_light = new THREE.DirectionalLight(0xffffff, 1);
            _god_light.position.set(0, 500, 0);

            _god_light.shadowCameraLeft = -10000;
            _god_light.shadowCameraRight = 10000;
            _god_light.shadowCameraTop = 10000;
            _god_light.shadowCameraBottom = -10000;

            //_god_light = new THREE.SpotLight(0xffffff, 1);
            //_god_light.position.set(0, 10000, 0);
            //_god_light.angle = Math.PI / 2;
            //_god_light.distance = 100000;

            _god_light.target.position.set(0, 0, 0);
            //_god_light.castShadow = options.quality != 0;
            _god_light.castShadow = true;
            //_god_light.onlyShadow = true;
            _god_light.shadowMapWidth = _god_light.shadowMapHeight = options.quality * 128;
            _god_light.shadowMapDarkness = 1;
            _god_light.shadowBias = 0.0001;
            _god_light.shadowCameraNear = 0;
            _god_light.shadowCameraFar = 1000;
            _god_light.shadowCameraFov = 50;
            //_god_light.shadowCameraVisible = true;

            jcg_webgl.utils.scene_add(_god_light);
        },
        update_lights: function (data, options) {
            //if(_god_light.shadowMapWidth != new_quality) {
                //$.log(options.quality);
                //_god_light.castShadow = options.quality != 0;
                _god_light.shadowMapWidth = options.quality * 128;
                _god_light.shadowMapHeight = options.quality * 128;
                //_god_light.needsUpdate = true;
            //}
        },
        add_scene: function () {
            jcg_webgl.utils.scene_add(this.gen_wall());
            jcg_webgl.utils.scene_add(this.gen_scene_cube());
            jcg_webgl.utils.scene_add(this.gen_floor());
        },
        add_boxes: function (boxes_data) {
            _boxes_cache = [];
            $.each(boxes_data, function (i, box_data) {
                var mesh = new THREE.Mesh(_box_cache, _box_material);
                mesh.position.set(box_data.x, 100, -box_data.z);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                _boxes_cache.push(mesh);
                jcg_webgl.utils.scene_add(mesh);
            });
        },
        update_boxes: function(boxes_data, rotate_d) {
            $.each(boxes_data, function (i) {
                _boxes_cache[i].rotation.y = rotate_d * Math.PI / 180;
                _boxes_cache[i].visible = !!(this.v);
            });
        },
        get_scene_cube_texture: function () {
            return _scene_cube_texture;
        },
        gen_scene_cube: function () {
            return new THREE.Mesh(_scene_cube_cache, _scene_cube_material);
        }
    });
}));

})(jQuery, THREE, jschariot_graphics_webgl, jschariot_graphics);