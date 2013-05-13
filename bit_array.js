var EventEmitter = process.EventEmitter;

function BitArray(data)
{
    var new_bit_array = {
        __real_data: data || 0
    };
    new_bit_array.__proto__ = BitArray.prototype;
    return new_bit_array;
}
BitArray.prototype.__defineGetter__("data", function () {
    return this.__real_data;
});
BitArray.prototype.__defineSetter__("data", function (value) {
    if(typeof value == "string") {
        var __value = parseInt(value, 36);
        if(!isNaN(__value)) {
            this.__real_data = Math.floor(__value);
        }
    } else if(typeof value == "number") {
        this.__real_data = Math.floor(value);
    }
});
BitArray.prototype.contains = function (num) {
    return (this.__real_data & num) != 0;
}
BitArray.prototype.set = function (num, value) {
    if(value) {
        this.__real_data = this.__real_data | num;
    } else {
        this.__real_data = this.__real_data & (num - 1);
    }
}
exports = module.exports = BitArray;
