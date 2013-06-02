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

var _wall_cache = null,
    _wall_material = null,
    _trap_cache = null,
    _missile_cache = null,
    _box_cache = null,
    _box_material = null;

jcg_webgl.set_map_model(0, {
    clear: function () {
        _wall_cache = null;
        _wall_material = null;
        _trap_cache = null;
        _missile_cache = null;
        _box_cache = null;
        _box_material = null;
    },
    gen_wall: function () {
    
        if(_wall_cache == null) {

            _wall_cache = new THREE.Geometry();
            
            var wall = new THREE.PlaneGeometry(4300, 200);
            var adjust = new THREE.Matrix4();
            adjust.setPosition(new THREE.Vector3(0, 100, -2150));
            wall.applyMatrix(adjust);
            THREE.GeometryUtils.merge(_wall_cache, wall);

            wall = new THREE.PlaneGeometry(4300, 200);
            adjust = new THREE.Matrix4();
            adjust.makeRotationY(Math.PI);
            adjust.setPosition(new THREE.Vector3(0, 100, 2150));
            wall.applyMatrix(adjust);
            THREE.GeometryUtils.merge(_wall_cache, wall);

            wall = new THREE.PlaneGeometry(4300, 200);
            adjust = new THREE.Matrix4();
            adjust.makeRotationY(-Math.PI / 2);
            adjust.setPosition(new THREE.Vector3(2150, 100, 0));
            wall.applyMatrix(adjust);
            THREE.GeometryUtils.merge(_wall_cache, wall);

            wall = new THREE.PlaneGeometry(4300, 200);
            adjust = new THREE.Matrix4();
            adjust.makeRotationY(Math.PI / 2);
            adjust.setPosition(new THREE.Vector3(-2150, 100, 0));
            wall.applyMatrix(adjust);
            THREE.GeometryUtils.merge(_wall_cache, wall);
            
            _wall_material = new THREE.MeshLambertMaterial({color: 0x999999});
            //_wall_material = new THREE.MeshPhongMaterial({color: 0x999999, specular: 0x333333, shininess: 100});
        }
        return new THREE.Mesh(_wall_cache, _wall_material);
    },
    gen_trap: function (data, not_own) {
        if(_trap_cache == null) {
            _trap_cache = new THREE.CylinderGeometry(0, 40, 15, 7, 1, false);
        }
        var color = 0x444444;
        if(not_own)
            color = 0x993333;
        //var _trap_material = new THREE.MeshLambertMaterial({color: color});
        var _trap_material = new THREE.MeshPhongMaterial({color: color, specular: 0x333333, shininess: 100});
        var res_m = new THREE.Mesh(_trap_cache, _trap_material);
        res_m.rotation.y = data[INDEX_D] * Math.PI / 180;
        res_m.position.x = data[INDEX_X];
        res_m.position.y = 5;
        res_m.position.z = -data[INDEX_Z];
        return res_m;
    },
    gen_missile: function (data) {
        if(_missile_cache == null) {
            _missile_cache = new THREE.CylinderGeometry(0, 5, 50, 10, 1, false);
            var adjust = new THREE.Matrix4();
            adjust.makeRotationX(-Math.PI / 2);
            _missile_cache.applyMatrix(adjust);
            
        }
        
        //var res_m = new THREE.Mesh(_missile_cache, new THREE.MeshLambertMaterial({color: 0x444444}));
        var res_m = new THREE.Mesh(_missile_cache, new THREE.MeshPhongMaterial({color: 0x444444, specular: 0x333333, shininess: 100}));
        res_m.rotation.y = data[INDEX_D] * Math.PI / 180;
        res_m.position.x = data[INDEX_X];
        res_m.position.y = 100;
        res_m.position.z = -data[INDEX_Z];
        return res_m;
    },
    gen_box: function (data, d) {
        if(_box_cache == null) {
            _box_cache = new THREE.CubeGeometry(50, 50, 50);
            //_box_material = new THREE.MeshLambertMaterial({color: 0xdddd66});
            _box_material = new THREE.MeshPhongMaterial({color: 0xdddd66, specular: 0x333333, shininess: 100});
        }
        var res_m = new THREE.Mesh(_box_cache, _box_material);
        res_m.rotation.y = (d || 50) * Math.PI / 180;
        res_m.position.x = data.x;
        res_m.position.y = 100;
        res_m.position.z = -data.z;
        return res_m;
    },
    draw_background: function (cam) {
        /*cam.graphics.fillStyle = "#ddd";
        cam.graphics.fillRect(0, 0, cam.vport_width, cam.vport_height / 2);
        cam.graphics.fillStyle = "#eee";
        cam.graphics.fillRect(0, cam.vport_height / 2, cam.vport_width, cam.vport_height);*/
    },
    draw_others_status: function (cam, data, point) {
        //var hp = data.hp + ' / 3';
        //cam.graphics.fillText(hp, point.x - cam.graphics.measureText(hp).width / 2, point.y - 24);
        /*for(var i = 0; i < 3; i++) {
            cam.drawpolygon([
                {x: point.x - 10, y: point.y - 30 + i * 6},
                {x: point.x + 10, y: point.y - 30 + i * 6},
                {x: point.x + 10, y: point.y - 25 + i * 6},
                {x: point.x - 10, y: point.y - 25 + i * 6}
            ], data.hp >= 3 - i ? '#d88' : '#fff');
        }
        cam.graphics.font = '10px Arial';
        cam.graphics.fillStyle = '#000';
        var name = data.name;
        cam.graphics.fillText(name, point.x - cam.graphics.measureText(name).width / 2, point.y);*/
        //var ip = data.ip.address + ':' + data.ip.port;
        //cam.graphics.fillText(ip, point.x - cam.graphics.measureText(ip).width / 2, point.y);
    },
    draw_status: function (cam, data, boxes_data, start_time) {
        
        /*var self_hp = data[INDEX_HP][data[INDEX_INDEX]];
        
        //hp
        for(var i = 0; i < 3; i++) {
            cam.drawpolygon([
                {x: 820, y: 10 + i * 21},
                {x: 900, y: 10 + i * 21},
                {x: 900, y: 28 + i * 21},
                {x: 820, y: 28 + i * 21}
            ], self_hp >= 3 - i ? '#aaa' : '#fff');
        }
        
        //cd
        if(data[INDEX_CD] > 0) {
            cam.drawpolygon([
                {x: 800 - data[INDEX_CD] / 20, y: 60},
                {x: 800, y: 60},
                {x: 800, y: 70},
                {x: 800 - data[INDEX_CD] / 20, y: 70}
            ], '#eee');
        }
        
        //items
        for(var i = 0; i < 4; i++) {
            cam.drawpolygon([
                {x: 610 + i * 50, y: 10},
                {x: 650 + i * 50, y: 10},
                {x: 650 + i * 50, y: 50},
                {x: 610 + i * 50, y: 50}
            ]);
            cam.graphics.drawImage(_items_cache[_id_item_map[data[INDEX_ITEMS][i]]], 610 + i * 50, 10);
        }
        
        //time
        cam.graphics.font = '20px Arial';
        cam.graphics.fillStyle = '#000';
        var last = Math.floor((new Date().getTime() - start_time) / 1000);
        var timetip = Math.floor(last / 60) + ':' + (last % 60 < 10 ? '0' + last % 60 : last % 60);
        cam.graphics.fillText(timetip, 460 - cam.graphics.measureText(timetip).width / 2, 30);
    
        //game_status
        if(data[INDEX_EVENTS].indexOf(EVENT_GAME_END) != -1) {
            var gametip = '';
            if(last == 300) {
                gametip = '游戏结束';
            } else if(self_hp == 0) {
                gametip = '失败！';
            } else {
                gametip = '胜利！';
            }
            cam.drawpolygon([
                {x: 460 - cam.graphics.measureText(gametip).width / 2 - 30, y: 40},
                {x: 460 + cam.graphics.measureText(gametip).width / 2 + 30, y: 40},
                {x: 460 + cam.graphics.measureText(gametip).width / 2 + 30, y: 80},
                {x: 460 - cam.graphics.measureText(gametip).width / 2 - 30, y: 80}
            ]);
            if(self_hp == 0) {
                cam.graphics.fillStyle = '#448';
            } else {
                cam.graphics.fillStyle = '#844';
            }
            cam.graphics.font = '30px 黑体';
            cam.graphics.fillText(gametip, 460 - cam.graphics.measureText(gametip).width / 2, 70);
        } else if(self_hp == 0) {
            var gametip = '你阵亡了。';
            cam.drawpolygon([
                {x: 460 - cam.graphics.measureText(gametip).width / 2 - 30, y: 40},
                {x: 460 + cam.graphics.measureText(gametip).width / 2 + 30, y: 40},
                {x: 460 + cam.graphics.measureText(gametip).width / 2 + 30, y: 80},
                {x: 460 - cam.graphics.measureText(gametip).width / 2 - 30, y: 80}
            ]);
            cam.graphics.font = '30px 黑体';
            cam.graphics.fillStyle = '#448';
            cam.graphics.fillText(gametip, 460 - cam.graphics.measureText(gametip).width / 2, 70);
        }
        
        //map
        cam.drawpolygon([
            {x: 10, y: 10},
            {x: 210, y: 10},
            {x: 210, y: 210},
            {x: 10, y: 210}
        ]);
        $.each(boxes_data, function () {
            if(this.v) {
                var _x = this.x;
                var _z = this.z;
                cam.drawcircle({x: 110 + _x / 20, y: 110 - _z / 20}, 3, '#ffd', '#aaa');
            }
        });
        $.each(data[INDEX_CARS], function (i, n) {
            var _x = this[INDEX_X];
            var _z = this[INDEX_Z];
            /*var signal = [[
                {x: 0, y: -5, z: 0},
                {x: 4, y: 5, z: 0},
                {x: -4, y: 5, z: 0}
            ]];
            signal[0].color = jcg.color(i == data[INDEX_INDEX] ? '#eee' : '#d55');
            jcg.roll(signal, -this[INDEX_D]);
            jcg.move(signal, 110 + _x / 20, 110 - _z / 20, 0);
            cam.drawpolygon(signal[0]);/
            cam.drawcircle({x: 110 + _x / 20, y: 110 - _z / 20}, 5, jcg.color(i == data[INDEX_INDEX] ? '#eee' : '#d55'));
        });*/
    }
});

})(jQuery, THREE, jschariot_graphics_webgl, jschariot_graphics);