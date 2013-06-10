var EventEmitter = process.EventEmitter;

var player_next_id = 0;

function Player(socket, data)
{
    var newplayer = {
        socket: socket,
        id: player_next_id++,
        car_type: '0',
        name: data.name,
        ip: socket.remoteAddress,
        status: '未准备',
        isAI: false,
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
        status: this.status,
        ai: this.isAI,
        team: this.team
    };
}
Player.prototype.quit = function () {
    if(this.room != null) {
        this.room.quit_player(this);
        this.room = null;
    }
}

exports = module.exports = Player;