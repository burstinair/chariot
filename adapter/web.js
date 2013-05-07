var express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    socket = require('socket.io').Socket;

//For Heroku  
//io.configure(function () { 
//  io.set("transports", ["xhr-polling"]); 
//  io.set("polling duration", 10); 
//});

socket.prototype.__defineGetter__("remoteAddress", function () {
    return this.handshake.address;
});

var adapter_web = {
    on: function (name, func) {
        io.sockets.on(name, func);
    },
    emit: function (name, data) {
        io.sockets.emit(name, data);
    },
    start: function (options) {
        app.listen(options.port);
        app.get('/', function (req, res) {
            console.log('req');
            res.sendfile(__dirname + '/web/default.html');
        });
        app.configure(function () {
            app.use(express.bodyParser());
            app.use(express.methodOverride());
            app.use(express.static(__dirname + '/web'));
        });
    }
};

exports = module.exports = adapter_web;