var Utils = require('./utils');

exports = module.exports = {
    adjust: function (obj, distance, do_react) {
        distance = distance || 0;
        do_react = do_react || false;
        var Fx = 0, Fz = 0;
        var res = false;
        for(var i = 0, l = this.polygon_barriers.length; i < l; ++i) {
            for(var j = 0, lb = this.polygon_barriers[i].length - 1; j < lb; ++j) {
                var line = {p1: this.polygon_barriers[i][j], p2: this.polygon_barriers[i][j + 1]};
                if(Utils.is_clockwise(obj, line, distance)) {
                    res = true;
                    if(do_react) {
                        Utils.react(obj, line, this.impulse_reduce);
                    } else {
                        return true;
                    }
                }
            }
        }
        for(var i = 0, l = this.circle_barriers.length; i < l; ++i) {
            //TODO: Deal circle barriers collision.
        }
        return res;
    }
}