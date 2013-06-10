var _car_cache = {};
var _get_car = function (car_type) {
    if(_car_cache[car_type] == null) {
        _car_cache[car_type] = require('./models/cars/' + car_type);
    }
    return _car_cache[car_type];
};
var _map_cache = {};
var _get_map = function (map_type) {
    if(_map_cache[map_type] == null) {
        _map_cache[map_type] = require('./models/maps/' + map_type);
    }
    return _map_cache[map_type];
};

exports = module.exports = {
    get_car: _get_car,
    get_map: _get_map,

    map_model_list: [
        {name: "方形地图", id: "0"}
    ],
    car_model_list: [
        {name: "木车", id: "0"},
        {name: "农夫山泉", id: "1"},
        {name: "铁皮车", id: "2"}
    ],
    random_map: function () {
        return this.map_model_list[Math.floor(Math.random() * this.map_model_list.length)];
    },
    random_car: function () {
        return this.car_model_list[Math.floor(Math.random() * this.car_model_list.length)];
    }
}