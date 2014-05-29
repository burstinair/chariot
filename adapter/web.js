var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.Server(app),
    io = require('socket.io')(server);

//For Heroku  
//io.configure(function () { 
//  io.set("transports", ["xhr-polling"]); 
//  io.set("polling duration", 10); 
//});

var adapter_web = {
    on: function (name, func) {
        io.sockets.on(name, func);
    },
    emit: function (name, data) {
        io.sockets.emit(name, data);
    },
    start: function (options) {
        server.listen(options.port);
        app.use(express.static(__dirname + '/web'));
        app.get('/', function (req, res) {
            console.log('new web request');
            res.sendfile(__dirname + '/web/default.html');
        });
    }
};

exports = module.exports = adapter_web;
