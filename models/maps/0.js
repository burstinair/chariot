exports = module.exports = {
    //前进方向阻力系数
    K: 0.002,
    //漂移方向阻力系数
    _K: 0.01,
    //前进方向小速度
    min_V: 5,
    //漂移方向小速度
    min_v: 10,
    
    width: 8000,
    height: 8000,
    barriers: [
        [{
            x: -this.width / 2, z: this.height / 2
        }, {
            x: this.width / 2, z: this.height / 2
        }, {
            x: this.width / 2, z: -this.height / 2
        }, {
            x: -this.width / 2, z: -this.height / 2
        },{
            x: -this.width / 2, z: this.height / 2
        }]
    ],
    is_clockwise: function (point, line, valid_distance) {
        if(line.p1.x == line.p2.x)
            return (line.p1.y < line.p2.y) == (line.p1.x > point.x);
        else if(line.p1.x == point.x)
            return (line.p1.y < point.y) == (line.p1.x < line.p2.x);
        else
            return ((line.p1.y - line.p2.y) / (line.p1.x - line.p2.x) < (line.p1.y - point.y) / (line.p1.x - point.x)) ^ ((line.p1.x <= line.p2.x) == (line.p1.x > point.x));
    },
    react: function (obj, line) {
        
        /*if(car.x > this.width / 2 && car.xv > 0) {
            car.x = this.width / 2;
            car.xv = -car.xv;
        } else if(car.x < -this.width / 2 && car.xv < 0) {
            car.x = -this.width / 2;
            car.xv = -car.xv;
        }
        if(car.z > this.height / 2 && car.zv > 0) {
            car.z = this.height / 2;
            car.zv = -car.zv;
        } else if(car.z < -this.height / 2 && car.zv < 0) {
            car.z = -this.height / 2;
            car.zv = -car.zv;
        }*/
        if(line.p1.x == line.p2.x) {
            if(p1.y > p2.y)
        } else if(line.p1.y == line.p2.y) {
            
        } else {
            var a = 1;
            var b = (p2.x - p1.x) / (p1.y - p2.y);
            var c = -p1.x - b * p1.y;
            
        }
    },
    adjust: function (obj, distance, obj_model) {
        distance = distance || 0;
        obj_model = obj_model || null;
        var Fx = 0, Fz = 0;
        var res = false;
        for(var i = 0, l = barriers.length; i < l; ++i) {
            for(var j = 0, lb = barriers[i].length - 1; j < lb; ++j) {
                var k = j + 1;
                if(!is_clockwise(obj, {p1: j, p2: k}, distance)) {
                    res = true;
                    if(obj_model) {
                        react(obj, {p1: j, p2: k});
                    } else {
                        return true;
                    }
                }
            }
        }
        return res;
    },
    initialize_cars: function (playercount) {
        var res = [];
        var _c = Math.PI * 2 / playercount;
        for(var i = 0; i < playercount; i++) {
            res.push({
                x: Math.sin(_c * i) * this.width / 20 * 9,
                z: -Math.cos(_c * i) * this.height / 20 * 9,
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
                x: Math.sin(_c * i) * this.width / 20 * 6,
                z: -Math.cos(_c * i) * this.height / 20 * 6
            });
            res.push({
                x: Math.sin(_c * i + Math.PI / 4) * this.width / 20 * 5,
                z: -Math.cos(_c * i + Math.PI / 4) * this.height / 20 * 5
            });
            res.push({
                x: Math.sin(_c * i) * this.width / 20 * 3,
                z: -Math.cos(_c * i) * this.height / 20 * 3
            });
            res.push({
                x: Math.sin(_c * i - Math.PI / 4) * this.width / 20 * 4,
                z: -Math.cos(_c * i - Math.PI / 4) * this.height / 20 * 4
            });
        }
        return res;
    }
}