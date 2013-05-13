var BitArray = require('./bit_array');

var EventEmitter = process.EventEmitter;

function KeyStatus()
{
    var new_key_status = {
        __real_data: 0
    };
    new_key_status.__proto__ = KeyStatus.prototype;
    return new_key_status;
}
KeyStatus.prototype.__proto__ = BitArray.prototype;
KeyStatus.prototype.__defineGetter__("up", function () {
    return this.contains(128);
});
KeyStatus.prototype.__defineGetter__("onlyup", function () {
    return this.contains(128) && !this.contains(64);
});
KeyStatus.prototype.__defineSetter__("up", function (value) {
    this.set(128, value);
});
KeyStatus.prototype.__defineGetter__("down", function () {
    return this.contains(64);
});
KeyStatus.prototype.__defineGetter__("onlydown", function () {
    return this.contains(64) && !this.contains(128);
});
KeyStatus.prototype.__defineSetter__("down", function (value) {
    this.set(64, value);
});
KeyStatus.prototype.__defineGetter__("left", function () {
    return this.contains(32);
});
KeyStatus.prototype.__defineGetter__("onlyleft", function () {
    return this.contains(32) && !this.contains(16);
});
KeyStatus.prototype.__defineSetter__("left", function (value) {
    this.set(32, value);
});
KeyStatus.prototype.__defineGetter__("right", function () {
    return this.contains(16);
});
KeyStatus.prototype.__defineGetter__("onlyright", function () {
    return this.contains(16) && !this.contains(32);
});
KeyStatus.prototype.__defineSetter__("right", function (value) {
    this.set(16, value);
});
KeyStatus.prototype.item = function (index, value) {
    if(value != null) {
        this.set([8, 4, 2, 1][index], value);
    } else {
        return this.contains([8, 4, 2, 1][index]);
    }
}

exports = module.exports = KeyStatus;
