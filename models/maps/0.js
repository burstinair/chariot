exports = module.exports = {
    //前进方向阻力系数
    K: 0.002,
    //漂移方向阻力系数
    _K: 0.01,
    //前进方向小速度
    min_V: 5,
    //漂移方向小速度
    min_v: 10,
    adjust: function (car) {
        if(car.x > 2000 && car.xv > 0) {
            car.x = 2000;
            car.xv = -car.xv;
        } else if(car.x < -2000 && car.xv < 0) {
            car.x = -2000;
            car.xv = -car.xv;
        }
        if(car.z > 2000 && car.zv > 0) {
            car.z = 2000;
            car.zv = -car.zv;
        } else if(car.z < -2000 && car.zv < 0) {
            car.z = -2000;
            car.zv = -car.zv;
        }
    },
    check: function (missile) {
        return missile.x <= -2150 || missile.x >= 2150 || missile.z <= -2150 || missile.z >= 2150;
    },
    initialize_cars: function (playercount) {
        var res = [];
        var _c = Math.PI * 2 / playercount;
        for(var i = 0; i < playercount; i++) {
            res.push({
                x: Math.sin(_c * i) * 1800,
                z: -Math.cos(_c * i) * 1800,
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
                x: Math.sin(_c * i) * 1200,
                z: -Math.cos(_c * i) * 1200,
                d: _c * i
            });
            res.push({
                x: Math.sin(_c * i) * 600,
                z: -Math.cos(_c * i) * 600,
                d: _c * i
            });
        }
        return res;
    }
}