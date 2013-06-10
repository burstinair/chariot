var Config = require('./config');

Array.prototype.remove = function (item) {
    var i = 0;
    for(i = 0; i < this.length; i++) {
        if(this[i] == item)
            break;
    }
    this.splice(i, 1);
}

var Utils = {
    hit: function (a, b, dis) {
        var _testCount = 30 / Config.fps;
        var dis2 = dis * dis;
        var apx = a.px || a.x;
        var apz = a.pz || a.z;
        var bpx = b.px || b.x;
        var bpz = b.pz || b.z;
        var _pax = (a.x - apx) / _testCount;
        var _paz = (a.z - apz) / _testCount;
        var _pbx = (b.x - bpx) / _testCount;
        var _pbz = (b.z - bpz) / _testCount;
        for(var i = 0; i < _testCount; i++) {
            apx += _pax;
            apz += _paz;
            bpx += _pbx;
            bpz += _pbz;
            if((apx - bpx) * (apx - bpx) + (apz - bpz) * (apz - bpz) <= dis2) {
                return true;
            }
        }
        return false;
    },
    react: function (obj, line, impulse_reduce) {
        var k1, k2;
        if(line.p1.x == line.p2.x) {
            if(line.p1.z >= line.p2.z) {
                k1 = 1;
            } else {
                k1 = -1;
            }
            k2 = 0;
        } else if(line.p1.z == line.p2.z) {
            k1 = 0;
            if(line.p1.x <= line.p2.x) {
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
            if(b > 0) {
                k1 = -k1;
                k2 = -k2;
            }
        }
        var colli_v = obj.xv * k1 + obj.zv * k2;
        if(colli_v > 0) {
            obj.xv -= colli_v * k1 * (2 - impulse_reduce);
            obj.zv -= colli_v * k2 * (2 - impulse_reduce);
        }
    },
    is_clockwise: function (point, line, valid_distance) {
        if(line.p1.x == line.p2.x)
            return (line.p1.z < line.p2.z) == (line.p1.x > point.x);
        else if(line.p1.x == point.x)
            return (line.p1.z < point.z) == (line.p1.x < line.p2.x);
        else
            return ((line.p1.z - line.p2.z) / (line.p1.x - line.p2.x) < (line.p1.z - point.z) / (line.p1.x - point.x)) ^ ((line.p1.x <= line.p2.x) == (line.p1.x > point.x));
    },
    now: function () {
        return new Date().getTime();
    },
    round: function (ori) {
        return Math.round(ori * 10000) / 10000;
    }
};

exports = module.exports = Utils;
