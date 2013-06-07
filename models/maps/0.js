var WIDTH = 8000,
    HEIGHT = 8000;

exports = module.exports = {
    //静阻力系数
    ks: 9,
    //动阻力系数
    kd: 7,
    //前进方向小速度
    min_vf: 3,
    //漂移方向小速度
    min_vt: 5,
    
    width: WIDTH,
    height: HEIGHT,
    barriers: [
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
    is_clockwise: function (point, line, valid_distance) {
        if(line.p1.x == line.p2.x)
            return (line.p1.z < line.p2.z) == (line.p1.x > point.x);
        else if(line.p1.x == point.x)
            return (line.p1.z < point.z) == (line.p1.x < line.p2.x);
        else
            return ((line.p1.z - line.p2.z) / (line.p1.x - line.p2.x) < (line.p1.z - point.z) / (line.p1.x - point.x)) ^ ((line.p1.x <= line.p2.x) == (line.p1.x > point.x));
    },
    react: function (obj, line) {
        var k1, k2;
        if(line.p1.x == line.p2.x) {
            if(line.p1.x > obj.x) {
                k1 = 1;
            } else {
                k1 = -1;
            }
            k2 = 0;
        } else if(line.p1.z == line.p2.z) {
            k1 = 0;
            if(line.p1.z > obj.z) {
                k2 = 1;
            } else {
                k2 = -1;
            }
        } else {
            var a = 1;
            var b = (p2.x - p1.x) / (p1.z - p2.z);
            var c = -p1.x - b * p1.z;
            var lx = -b * obj.z - c;
            var lz = -(obj.x + c) / b;
            var ll = Math.sqrt(lx * lx + lz * lz);
            k1 = lz / ll;
            k2 = lx / ll;
        }
        var colli_v = obj.xv * k1 + obj.zv * k2;
        obj.xv -= colli_v * k1 * 2;
        obj.zv -= colli_v * k2 * 2;
    },
    adjust: function (obj, distance, do_react) {
        distance = distance || 0;
        do_react = do_react || false;
        var Fx = 0, Fz = 0;
        var res = false;
        for(var i = 0, l = this.barriers.length; i < l; ++i) {
            for(var j = 0, lb = this.barriers[i].length - 1; j < lb; ++j) {
                var line = {p1: this.barriers[i][j], p2: this.barriers[i][j + 1]};
                if(this.is_clockwise(obj, line, distance)) {
                    res = true;
                    if(do_react) {
                        this.react(obj, line);
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