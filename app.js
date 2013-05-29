require('./utils');

var Network = require('./network'),
    Game = require('./game'),
    Room = require('./room'),
    Player = require('./player'),
    AI = require('./ai'),
    Config = require('./config');

Network.on('connection', function (socket) {
    Room.refresh();
    socket.on('create', function (data) {
        socket.get('playerinfo', function (err, player) {
            if(player == null) {
                var player = new Player(socket, data);
            }
            socket.set('playerinfo', player, function () {
                player.status = "未准备";
                var room = new Room(player.name + '的房间');
                socket.emit("reply_create", {suc: true, data: room.gen_msg()});
                room.add_player(player);
            });
        });
    });
    socket.on('join', function (data) {
        socket.get('playerinfo', function (err, player) {
            if(player == null) {
                var player = new Player(socket, data);
            }
            socket.set('playerinfo', player, function () {
                var room = Room.find(data.id);
                if(room == null) {
                    socket.emit("reply_join", {suc: false, data: '房间不存在。'});
                } else if(room.is_in_game) {
                    socket.emit("reply_join", {suc: false, data: '房间正在游戏中。'});
                } else {
                    player.status = "未准备";
                    socket.emit("reply_join", {suc: true, data: room.gen_msg()});
                    player.room = room;
                    room.add_player(player);
                }
            });
        });
    });
    socket.on('ready', function () {
        socket.get('playerinfo', function (err, player) {
            if(player != null) {
                socket.emit("reply_ready", {suc: true});
                player.status = "已准备";
                player.room.refresh();
                player.room.check_start_game();
            }
        });
    });
    socket.on('addai', function () {
        socket.get('playerinfo', function (err, player) {
            if(player != null) {
                socket.emit("reply_addai", {suc: true});
                player.room.add_player(new AI());
                player.room.check_start_game();
            }
        });
    });
    socket.on('keystatus', function (data) {
        socket.get('playerinfo', function (err, player) {
            if(player != null) {
                if(player.room != null) {
                    if(player.room.game != null) {
                        player.room.game.refresh_key_status(player, data);
                    }
                }
            }
        });
    });
    socket.on('quit', function () {
        socket.get('playerinfo', function (err, player) {
            if(player != null) {
                socket.emit("reply_quit", {suc: true});
                player.quit();
            }
        });
    })
    socket.on('disconnect', function () {
        socket.get('playerinfo', function (err, player) {
            if(player != null) {
                player.quit();
            }
        });
    });
});