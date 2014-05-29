require('./utils');

var Network = require('./network'),
    Game = require('./game'),
    Room = require('./room'),
    Player = require('./player'),
    AI = require('./ai'),
    Config = require('./config'),
    VM = require('vm');

var socket_data_map = { };
var _data = function (socket, data) {
    if(data != null) {
        socket_data_map[socket.id] = data;
    } else {
        return socket_data_map[socket.id];
    }
};

Network.on('connection', function (socket) {
    console.log('new conn');
    Room.refresh();
    socket.on('create', function (data) {
        var player = _data(socket);
        if(player == null) {
            var player = new Player(socket, data);
        } else {
            player.name = data.name;
        }
        
        _data(socket, player);
        var room = new Room(player.name + '的房间');
        socket.emit("reply_create", {suc: true, data: {room: room.gen_msg(), id: player.id}});
        room.add_player(player);
    });
    socket.on('join', function (data) {
        var player = _data(socket);
        if(player == null) {
            var player = new Player(socket, data);
        } else {
            player.name = data.name;
        }
        
        _data(socket, player);
        var room = Room.find(data.id);
        if(room == null) {
            socket.emit("reply_join", {suc: false, data: '房间不存在。'});
        } else if(room.is_in_game) {
            socket.emit("reply_join", {suc: false, data: '房间正在游戏中。'});
        } else {
            socket.emit("reply_join", {suc: true, data: {room: room.gen_msg(), id: player.id}});
            room.add_player(player);
        }
    });
    socket.on('ready', function () {
        var player = _data(socket);
        if(player != null) {
            socket.emit("reply_ready", {suc: true});
            player.is_ready = true;
            player.room.refresh();
            player.room.check_start_game();
        }
    });
    socket.on('addai', function () {
        var player = _data(socket);
        if(player != null) {
            socket.emit("reply_addai", {suc: true});
            player.room.add_player(new AI());
            player.room.check_start_game();
        }
    });
    socket.on('set_map', function (data) {
        var player = _data(socket);
        if(player != null) {
            socket.emit("reply_set_map", {suc: true});
            player.room.map_type = data;
            player.room.refresh();
        }
    });
    socket.on('set_car', function (data) {
        var player = _data(socket);
        if(player != null) {
            socket.emit("reply_set_car", {suc: true});
            player.car_type = data;
            player.room.refresh();
        }
    });
    socket.on('set_team', function (data) {
        var player = _data(socket);
        if(player != null) {
            socket.emit("reply_set_team", {suc: true});
            player.team = data;
            player.room.refresh();
            player.room.check_start_game();
        }
    });
    //ai对战
    socket.on('use_ai_code', function (data) {
        var player = _data(socket);
        if(player != null) {
            if(data.set_ai) {
                player.ai_code = data.code;
                player.ai_sandbox = {};
                VM.runInNewContext(player.ai_code, player.ai_sandbox);
                player.type = Player.TYPE_AI_PLAYER;
                player.__bak_name = player.name;
                player.__bak_car_type = player.car_type;
                if(player.ai_sandbox.name != null) {
                    player.name = player.ai_sandbox.name;
                }
                if(player.ai_sandbox.car_type != null) {
                    player.car_type = player.ai_sandbox.car_type;
                }
            } else {
                player.ai_code = null;
                player.type = Player.TYPE_PLAYER;
                if(player.__bak_name != null) {
                    player.name = player.__bak_name;
                }
                if(player.__bak_car_type != null) {
                    player.car_type = player.__bak_car_type;
                }
                player.run = null;
            }
            player.room.refresh();
            player.room.check_start_game();
        }
    });
    socket.on('set_ai_car', function (data) {
        var player = _data(socket);
        if(player != null) {
            var ai = player.room.players[data.index];
            if(ai && ai.type == Player.TYPE_AI_SERVER) {
                socket.emit("reply_set_ai_car", {suc: true});
                ai.car_type = data.type;
                player.room.refresh();
            }
        }
    });
    socket.on('set_ai_team', function (data) {
        var player = _data(socket);
        if(player != null) {
            var ai = player.room.players[data.index];
            if(ai && ai.type == Player.TYPE_AI_SERVER) {
                socket.emit("reply_set_ai_team", {suc: true});
                ai.team = data.team;
                player.room.refresh();
                player.room.check_start_game();
            }
        }
    });
    socket.on('keystatus', function (data) {
        var player = _data(socket);
        if(player != null) {
            if(player.room != null) {
                if(player.room.game != null) {
                    player.room.game.refresh_key_status(player, data);
                }
            }
        }
    });
    socket.on('quit', function () {
        var player = _data(socket);
        if(player != null) {
            socket.emit("reply_quit", {suc: true});
            player.quit();
        }
    })
    socket.on('disconnect', function () {
        var player = _data(socket);
        if(player != null) {
            player.quit();
        }
    });
});