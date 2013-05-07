var net = require("net");

var gen_msg = function (name, data) {
    return ['{"name":"', name, '","data":', JSON.stringify(data), '}\u0000'].join('');
}
var parse_msg = function (msg) {
    msg = msg.toString('utf8');
    return JSON.parse(msg.substr(0, msg.length - 1));
}

var Socket = function (socket) {
    this.volatile = this;
    this.data = {};
    this.get = function (key, func) {
        func(null, this.data[key]);
    }
    this.set = function (key, value, func) {
        this.data[key] = value;
        func();
    }
    this._socket = socket;
    this.address = socket.address;
    this.remoteAddress = {
        address: socket.remoteAddress,
        port: socket.remotePort
    };
    var _soc = this;
    socket.on('data', function (data) {
        try {
            var msg = parse_msg(data);
            _soc.$emit(msg.name, msg.data);
        } catch (ex) { console.log(ex, data.toString()); }
    });
    socket.on('close', function (had_error) {
        _soc.$emit('disconnect');
    });
}
Socket.prototype.__proto__ = process.EventEmitter.prototype;
Socket.prototype.$emit = Socket.prototype.emit;
Socket.prototype.emit = function (name, data) {
    if(name == "newListener") {
        this.$emit(name, data);
    } else {
        this._socket.write(gen_msg(name, data));
    }
}

var adapter_socket = {
    socket_list: [],
    options: null,
    start: function (options) {
        var adapter = this;
        this.options = options;
        net.createServer(
            function(_socket)
            {
                var socket = new Socket(_socket);
                adapter.socket_list.push(socket);
                socket.on('disconnect', function () {
                    adapter.socket_list.remove(socket);
                });
                adapter.$emit('connection', socket);
            }
        ).listen(options.port);
    }
};
adapter_socket.__proto__ = process.EventEmitter.prototype;
adapter_socket.$emit = adapter_socket.emit;
adapter_socket.emit = function (name, data) {
    if(name == "newListener") {
        this.$emit(name, data);
    } else {
        for(var i = 0; i < this.socket_list.length; i++) {
            this.socket_list[i]._socket.write(gen_msg(name, data));
        }
    }
}

exports = module.exports = adapter_socket;