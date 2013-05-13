(function ($, jcg) {

jcg.set_car_model(0, {
    gen_car: function (data) {    
        var res = new jcg.Geometry();
        var wheel = new jcg.CylinderGeometry(15, 15, 20, 20, 1, false);
        var adjust = new jcg.Matrix4();
        adjust.makeRotationX(Math.PI / 2);
        adjust.setPosition(new jcg.Vector3(-75, -15, 40));
        wheel.applyMatrix(adjust);
        //jcg.da_yaw(wheel, data[INDEX_DA]);
        jcg.GeometryUtils.merge(res, wheel);
        
        wheel = new jcg.CylinderGeometry(15, 15, 20, 20, 1, false);
        adjust = new jcg.Matrix4();
        adjust.makeRotationX(Math.PI / 2);
        adjust.setPosition(new jcg.Vector3(75, -15, 40));
        wheel.applyMatrix(adjust);
        //jcg.da_yaw(wheel, data[INDEX_DA]);
        jcg.GeometryUtils.merge(res, wheel);
        
        wheel = new jcg.CylinderGeometry(15, 15, 20, 20, 1, false);
        adjust = new jcg.Matrix4();
        adjust.makeRotationX(Math.PI / 2);
        adjust.setPosition(new jcg.Vector3(-75, -15, -40));
        wheel.applyMatrix(adjust);
        //jcg.da_yaw(wheel, data[INDEX_DA]);
        jcg.GeometryUtils.merge(res, wheel);
        
        wheel = new jcg.CylinderGeometry(15, 15, 20, 20, 1, false);
        adjust = new jcg.Matrix4();
        adjust.makeRotationX(Math.PI / 2);
        adjust.setPosition(new jcg.Vector3(75, -15, -40));
        wheel.applyMatrix(adjust);
        //jcg.da_yaw(wheel, data[INDEX_DA]);
        jcg.GeometryUtils.merge(res, wheel);
        
        var body = jcg.CubeGeometry(150, 50, 200);
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
        //jcg.move(body, 0, -50, 0);
        adjust = new jcg.Matrix4();
        adjust.setPosition(new jcg.Vector3(0, -50, 0));
        body.applyMatrix(adjust);
        jcg.GeometryUtils.merge(res, body);
        
        var head = jcg.CubeGeometry(100, 50, 100);
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
        //jcg.move(head, 0, -100, -20);
        adjust = new jcg.Matrix4();
        adjust.setPosition(new jcg.Vector3(0, -100, 20));
        head.applyMatrix(adjust);
        jcg.GeometryUtils.merge(res, head);
        
        //jcg.da_yaw(res, data[INDEX_DA], 5);
        //jcg.yaw(res, data[INDEX_D]);
        //jcg.move(res, data[INDEX_X], 0, data[INDEX_Z]);
        adjust = new jcg.Matrix4();
        adjust.makeRotationY(data[INDEX_D] * Math.PI / 180);
        adjust.setPosition(new jcg.Vector3(data[INDEX_X], 0, -data[INDEX_Z]));
        res.applyMatrix(adjust);
        return new Mesh(res, new MeshLambertMaterial({color: 0xdddddd}));
    }
});

})(jQuery, THREE);