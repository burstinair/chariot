var Network = require('./network'),
    Game = require('./game'),
    ModelManager = require('./model_manager'),
    EventEmitter = process.EventEmitter;

var room_next_id = 1000;
var room_list = [];

function Room(title)
{
    var newroom = {
        id: room_next_id++,
        is_in_game: false,
        players: [],
        map_type: '0',
        title: title,
        game: null
    };
    room_list.push(newroom);
    newroom.__proto__ = Room.prototype;
    return newroom;
};
Room.prototype.gen_msg = function () {
    var _players = [];
    for(var i = 0; i < this.players.length; i++)
        _players.push(this.players[i].gen_msg());
    return {
        title: this.title,
        id: this.id,
        map_type: this.map_type,
        map_type_list: ModelManager.map_model_list,
        car_type_list: ModelManager.car_model_list,
        players: _players
    };
};
Room.prototype.add_player = function (player) {
    player.room = this;
    player.team = this.next_team();
    if(player.isAI) {
        player.status = "已准备";
    } else {
        player.status = "未准备";
    }
    this.players.push(player);
    this.refresh();
    Room.refresh();
};
Room.prototype.quit_player = function (player) {
    if(this.game != null) {
        this.game.quit_player(player);
    }
    this.players.remove(player);
    this.refresh();
    var remain = 0;
    for(var i = 0; i < this.players.length; i++) {
        if(!this.players[i].isAI) {
            remain++;
        }
    }
    if(remain == 0) {
        room_list.remove(this);
        if(this.game != null)
            this.game.end();
        Room.refresh();
    } else if(this.game == null) {
        this.check_start_game();
    }
};
Room.prototype.check_start_game = function () {
    var teams = {};
    var i = 0, team_count = 0;
    for(i = 0; i < this.players.length; i++) {
        if(this.players[i].status == "未准备")
            break;
        if(!teams[this.players[i].team]) {
            teams[this.players[i].team] = true;
            ++team_count;
        }
    }
    if(i == this.players.length && team_count > 1) {
        this.game = new Game(this);
        this.is_in_game = true;
        this.game.start();
        Room.refresh();
    }
};
var TEAM_MAX_COUNT = Room.TEAM_MAX_COUNT = 8;
Room.prototype.next_team = function () {
    var team_player_count = {};
    var min = 999999999;
    var min_k = -1;
    for(var i = 0; i < TEAM_MAX_COUNT; ++i) {
        for(var j = 0, l = this.players.length; j < l; ++j) {
            if(this.players[j].team == i) {
                if(team_player_count[i]) {
                    ++team_player_count[i];
                } else {
                    team_player_count[i] = 1;
                }
            }
        }
        if(team_player_count[i] < min) {
            min = team_player_count[i];
            min_k = i;
        }
        if (!team_player_count[i] || team_player_count[i] == 0) {
            return i;
        }
    }
    return min_k;
};
Room.prototype.refresh = function () {
    Network.emit("refresh_room", this.gen_msg());
};
Room.refresh = function () {
    Network.emit("refresh_hall", this.gen_msg());
};
Room.gen_msg = function () {
    var res = [];
    for(var i = 0; i < room_list.length; i++) {
        if(!(room_list[i].is_in_game)) {
            res.push(room_list[i].gen_msg());
        }
    }
    return res;
};
Room.find = function (id) {
    for(var i = 0; i < room_list.length; i++) {
        if(room_list[i].id == id)
            return room_list[i];
    }
    return null;
};

exports = module.exports = Room;
