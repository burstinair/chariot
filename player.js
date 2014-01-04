var EventEmitter = process.EventEmitter;

var TYPE_PLAYER = 0;
var TYPE_AI_PLAYER = 1;
var TYPE_AI_SERVER = 2;

var player_next_id = 0;

function Player(socket, data)
{
    var newplayer = {
        socket: socket,
        id: player_next_id++,
        car_type: '0',
        name: data.name,
        ip: socket.remoteAddress,
        is_ready: false,
        type: 0,
        room: null,
        team: null
    };
    newplayer.__proto__ = Player.prototype;
    return newplayer;
}
Player.prototype.gen_msg = function () {
    return {
        id: this.id,
        car_type: this.car_type,
        name: this.name,
        ip: this.ip,
        ready: this.is_ready,
        type: this.type,
        team: this.team
    };
}
Player.prototype.quit = function () {
    if(this.room != null) {
        this.room.quit_player(this);
        this.room = null;
    }
}
Player.TYPE_PLAYER = TYPE_PLAYER;
Player.TYPE_AI_PLAYER = TYPE_AI_PLAYER;
Player.TYPE_AI_SERVER = TYPE_AI_SERVER;

exports = module.exports = Player;