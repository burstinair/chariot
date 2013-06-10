var BaseMap = require('../../base_map');

var WIDTH = 8000,
    HEIGHT = 8000;

var map_0 = {
    //静阻力系数
    ks: 9,
    //动阻力系数
    kd: 7,
    //前进方向小速度
    min_vf: 3,
    //漂移方向小速度
    min_vt: 5,

    //冲量衰减
    impulse_reduce: 0.2,
    
    width: WIDTH,
    height: HEIGHT,
    polygon_barriers: [
        [{
            x: -WIDTH / 2, z: HEIGHT / 2
        }, {
            x: WIDTH / 2, z: HEIGHT / 2
        }, {
            x: WIDTH / 2, z: -HEIGHT / 2
        }, {
            x: -WIDTH / 2, z: -HEIGHT / 2
        },{
            x: -WIDTH / 2, z: HEIGHT / 2
        }]
    ],
    circle_barriers: [
        //{x: , y: , r: , type: "in" or "out"}
    ],
    initialize_cars: function (playercount) {
        var res = [];
        var _c = Math.PI * 2 / playercount;
        for(var i = 0; i < playercount; i++) {
            res.push({
                x: Math.sin(_c * i) * WIDTH / 20 * 9,
                z: -Math.cos(_c * i) * HEIGHT / 20 * 9,
                d: _c * i
            });
        }
        return res;
    },
    initialize_boxes: function (playercount) {
        var res = [];
        var _c = Math.PI * 2 / playercount;
        for(var i = 0; i < playercount; i++) {
            res.push({
                x: Math.sin(_c * i) * WIDTH / 20 * 6,
                z: -Math.cos(_c * i) * HEIGHT / 20 * 6
            });
            res.push({
                x: Math.sin(_c * i + Math.PI / 4) * WIDTH / 20 * 5,
                z: -Math.cos(_c * i + Math.PI / 4) * HEIGHT / 20 * 5
            });
            res.push({
                x: Math.sin(_c * i) * WIDTH / 20 * 3,
                z: -Math.cos(_c * i) * HEIGHT / 20 * 3
            });
            res.push({
                x: Math.sin(_c * i - Math.PI / 4) * WIDTH / 20 * 4,
                z: -Math.cos(_c * i - Math.PI / 4) * HEIGHT / 20 * 4
            });
        }
        return res;
    }
}

map_0.__proto__ = BaseMap;

exports = module.exports = map_0;