(function ($, THREE, jcg_webgl, jcg) {

var _item_id_list = [0, 1, 2, 101];
var _id_item_map = {};

var _items_cache = [];
for(var i = 0; i < _item_id_list.length; ++i) {
    var _img = new Image();
    _img.src = 'images/styles/0/items/' + _item_id_list[i] + '.png';
    _id_item_map[_item_id_list[i]] = i;
    _items_cache.push(_img);
}

var _scene_cube_cache = null,
    _scene_cube_texture = null,
    _scene_cube_material = null,
    _floor_cache = null,
    _floor_material = null,
    _wall_cache = null,
    _wall_material = null,
    _box_cache = null,
    _box_material = null;

jcg_webgl.set_map_model(0, {
    clear: function () {
        _scene_cube_cache = null;
        _scene_cube_texture = null;
        _scene_cube_material = null;
        _floor_cache = null;
        _floor_material = null;
        _wall_cache = null;
        _wall_material = null;
        _box_cache = null;
        _box_material = null;
    },
    gen_wall: function () {
    
        if(_wall_cache == null) {

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
        }
        var res_m = new THREE.Mesh(_wall_cache, _wall_material);
        res_m.castShadow = true;
        res_m.receiveShadow = true;
        return res_m;
    },
    gen_floor: function () {
        if(_floor_cache == null) {
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
        }
        var res_m = new THREE.Mesh( _floor_cache, _floor_material );
        res_m.rotation.x = - Math.PI / 2;
        res_m.scale.set( 83, 83, 83 );
        res_m.receiveShadow = true;
        return res_m;
    },
    gen_fog: function () {
        return new THREE.Fog( 0xf2f7ff, 1, 15000);
        //res.push(new THREE.FogExp2(0x444444, 100000));
    },
    gen_lights: function (data, options) {
        var res = [];

        var hemiLight = new THREE.HemisphereLight(0xddeeff, 0xcccccc, 1.25);
        //hemiLight.color.setHSL( 0.6, 1, 0.75 );
        //hemiLight.groundColor.setHSL( 0.1, 0.8, 0.7 );
        hemiLight.position.y = 500;
        res.push(hemiLight);

        //for()

        var godlight = new THREE.DirectionalLight(0xffffff, 1);
        //godlight.position.set(1, 100, 1);
        
        //var godlight = new THREE.SpotLight(0xffffff, 1);
        //godlight.position.set(1000, 2000, 1500);
        //godlight.angle = Math.PI / 2;
        //godlight.distance = 100000;

        //godlight.rotation.x = -Math.PI / 2 * 3;
        godlight.castShadow = options.shadow != 0;
        //godlight.onlyShadow = true;
        godlight.shadowMapWidth = options.shadow;
        godlight.shadowMapHeight = options.shadow;
        godlight.shadowMapDarkness = 0.95;
        godlight.shadowBias = -0.00125;
        godlight.shadowCameraNear = 500;
        godlight.shadowCameraFar = 100000;
        godlight.shadowCameraFov = 30;
        godlight.shadowCameraVisible = true;
        
        res.push(godlight);
        
        return res;
    },
    gen_scene: function () {
        var res = [];
        res.push(this.gen_wall());
        res.push(this.gen_scene_cube());
        res.push(this.gen_floor());
        return res;
    },
    gen_box: function (data, d) {        
        if(_box_cache == null) {
            _box_cache = new THREE.CubeGeometry(50, 50, 50);
            //_box_material = new THREE.MeshLambertMaterial({color: 0x999966});
            //_box_material = new THREE.MeshLambertMaterial({color: 0xdddd66});
            var texture = THREE.ImageUtils.loadTexture("images/textures/woodboard2.jpg");
            texture.anisotropy = 8;
            _box_material = new THREE.MeshPhongMaterial({color: 0xdddd66, specular: 0x333333, shininess: 100, map: texture});
        }
        var res_m = new THREE.Mesh(_box_cache, _box_material);
        res_m.rotation.y = (d || 50) * Math.PI / 180;
        res_m.position.x = data.x;
        res_m.position.y = 100;
        res_m.position.z = -data.z;
        res_m.castShadow = true;
        res_m.receiveShadow = true;
        return res_m;
    },
    get_scene_cube_texture: function () {
        return _scene_cube_texture;
    },
    gen_scene_cube: function () {
        if(_scene_cube_cache == null) {
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
        }
        return new THREE.Mesh(_scene_cube_cache, _scene_cube_material);
    }
});

})(jQuery, THREE, jschariot_graphics_webgl, jschariot_graphics);