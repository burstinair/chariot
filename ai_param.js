var ModelManager = require('./model_manager');

var defineGetters = function (obj, refer, properties) {
    for(var i in properties) {
        var p = properties[i];
        obj.__defineGetter__(p, function () {
            return refer[p];
        });
    }
};

function AiParam(game, index) {
    
    this.__defineGetter__('index', function () {
        return index;
    });

    function CarGetter(player, car, is_self) {
        defineGetters(this, car, ['x', 'z', 'd', 'xv', 'zv', 'id', 'type']);
        
        function CarModelGetter(car_model) {
            defineGetters(this, car_model, ['pf', 'pb', 'm', 'dv', 'kf', 'kt', 'missile_v', 'power_reduce']);
        }
        this.__defineGetter__('model', function () {
            return new CarModelGetter(ModelManager.get_car(car.type));
        });
        
        defineGetters(this, player, ['hp', 'team']);
        
        this.__defineGetter__('item_pocket_count', function () {
            return player.items.length;
        });
        this.__defineGetter__('items_count', function () {
            var res = 0;
            for(var i = 0, l = player.items.length; i < l; ++i) {
                if(player.items[i] != 0) {
                    ++res;
                }
            }
            return res;
        });
        this.get_item = function (i) {
            if(is_self) {
                return player.items[i];
            }
            return -1;
        };
    }
    this.get_car = function (i) {
        return new CarGetter(game.players[i], game.cars[i], i == index);
    };
    this.__defineGetter__('cars_count', function () {
        game.cars.length;
    });
    
    function BoxGetter(box) {
        defineGetters(this, box, ['x', 'z']);
    }
    this.get_boxes = function (i) {
        return new BoxGetter(game.boxes[i]);
    };
    this.__defineGetter__('boxes_count', function () {
        game.boxes.length;
    });
    
    function MissileGetter(missile) {
        defineGetters(this, missile, ['x', 'z', 'd', 'xv', 'zv', 'type', 'owner']);
    }
    this.get_missiles = function (i) {
        return new MissileGetter(game.missiles[i]);
    };
    this.__defineGetter__('missiles_count', function () {
        game.missiles.length;
    });
    
    function TrapGetter(trap) {
        defineGetters(this, trap, ['x', 'z', 'type', 'owner']);
    }
    this.get_traps = function (i) {
        return new TrapGetter(game.traps[i]);
    };
    this.__defineGetter__('traps_count', function () {
        game.traps.length;
    });
    
    function MapGetter(map_model) {
        defineGetters(this, map_model, ['ks', 'kd', 'min_vf', 'min_vt', 'impulse_reduce', 'width', 'height', 'polygon_barriers', 'circle_barriers']);
    }
    this.__defineGetter__('map', function () {
        return new MapGetter(game.map);
    });
};

exports = module.exports = AiParam;
