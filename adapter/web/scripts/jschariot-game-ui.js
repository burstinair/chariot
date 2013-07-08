(function($){

var player_info_panels = [];
var gen_player_info_panel = function () {
    var res = $("<div class='player_info'></div>");
    res.update = function (data) {
        
    };
    return res;
};

var map_box = [];
var first_set = true;
var map_car = [];

var last_items = [0, 0, 0, 0];
var last_hp = [0, 0, 0];
var last_cd = 0;
var last_time = null;

var subtitles = [];
var subtitle_panels = [];
var last_time_in_milli = -1;
var busy_y = {};

//UI in Game
window.jschariot_ui = {
    reset: function () {
        $(".tip").hide();
        for(var i = 0, l = player_info_panels.length; i < l; ++i) {
            player_info_panels[i].hide();
        }
        for(var i = 0, l = map_box.length; i < l; ++i) {
            map_box[i].hide();
        }
        for(var i = 0, l = map_car.length; i < l; ++i) {
            map_car[i].hide();
        }
        subtitles = [];
        for(var k in subtitle_panels) {
            subtitle_panels[k].hide();
        }
        first_set = true;
    },
    show_subtitles: true,
    all_colors: true,
    last_all_colors: false,
    refresh: function (type, data, player_infos, boxes_data, car_init_data, start_time, room, _get_car, game_status) {

        //game_status
        if(game_status == STATUS_LOADING) {
            $(".tip").text("载入中...").css("background", "#f8f8f8").addClass("tip_loading").show();
            return;
        }

        //time
        var last = Math.floor((new Date().getTime() - start_time) / 1000);
        var cur_time = Math.floor(last / 60) + ':' + (last % 60 < 10 ? '0' + last % 60 : last % 60);
        if(cur_time != last_time) {
            $(".time").text(cur_time);
            last_time = cur_time;
        }

        //hp
        var self_index = data[INDEX_INDEX];
        var self_team = car_init_data[data[INDEX_CARS][self_index][INDEX_CAR_ID]].team;
        var hp = data[INDEX_HP][self_index];
        var cur_hp = [0, 0, 0];
        for(var i = 3; i > 0; --i) {
            if(hp < i) {
                cur_hp[i - 1] = 0;
            } else {
                cur_hp[i - 1] = 1;
            }
            if(cur_hp[i - 1] != last_hp[i - 1] || this.last_all_colors != this.all_colors) {
                if(hp < i) {
                    $(".hp" + i).css('background', '#f8f8f8');
                } else if(this.all_colors) {
                    $(".hp" + i).css('background', '#' + TEAM_COLORS[self_team].toString(16));
                } else {
                    $(".hp" + i).css('background', '#c66');
                }
            }
        }
        this.last_all_colors = this.all_colors;
        last_hp = cur_hp;

        if(data[INDEX_EVENTS].indexOf(EVENT_GAME_END) != -1) {
            $(".tip").removeClass("tip_loading");
            if(data[INDEX_EVENTS].indexOf(EVENT_DRAW) != -1) {
                $(".tip").text("平局。").css("background", "#fea").show();
                return;
            } else if(last == 300) {
                $(".tip").text("游戏结束").css("background", "#f8f8f8").show();
                return;
            } else if(hp > 0) {
                $(".tip").text("胜利！").css("background", "#fea").show();
                return;
            } else {
                $(".tip").text("失败").css("background", "#ccf").show();
                return;
            }
        } else if(hp == 0) {
            $(".tip").removeClass("tip_loading");
            $(".tip").text("你阵亡了").css("background", "#ccf").show();
            return;
        }
        $(".tip").hide();
        
        //items
        var cur_items = data[INDEX_ITEMS];
        for(var i = 0; i < 4; ++i) {
            if(cur_items[i] != last_items[i]) {
                $(".item" + i).html("<img src='images/styles/" + type + "/items/" + cur_items[i] + ".png' alt='' />");
            }
        }
        last_items = cur_items;
        
        //cd
        var w = data[INDEX_CD] / 20;
        if(w != last_cd) {
            $(".cd").width(w);
            if(w == 0) {
                $(".cd").hide();
            } else {
                $(".cd").show();
            }
        }
        last_cd = w;
        
        //map
        $.sync_cache(boxes_data, map_box, function () {
            return $("<div class='map_box'></div>").appendTo($("#player_status .map"));
        }, function () {
            this.hide();
        }, function (data, cache) {
            if(data.v) {
                if(first_set) {
                    var _x = 95 + data.x / 40;
                    var _z = 95 - data.z / 40;
                    cache.css("left", _x);
                    cache.css("top", _z);
                }
                cache.show();
            } else {
                cache.hide();
            }
        });
        first_set = false;

        $.sync_cache(data[INDEX_CARS], map_car, function () {
            return $("<div class='map_car'></div>").appendTo($("#player_status .map"));
        }, function () {
            this.hide();
        }, $.proxy(function (car_data, cache, index) {
            var _x = 93 + car_data[INDEX_X] / 40;
            var _z = 93 - car_data[INDEX_Z] / 40;
            if(index == data[INDEX_INDEX]) {
                cache.addClass('self');
                cache.css("background", '#eee');
                --_x;
                --_z;
            } else {
                cache.removeClass('self');
                if(this.all_colors) {
                    cache.css("background", '#' + TEAM_COLORS[car_init_data[car_data[INDEX_CAR_ID]].team].toString(16));
                } else {
                    cache.css("background", car_init_data[car_data[INDEX_CAR_ID]].team == self_team ? '#66c' : '#c66');
                }
            }
            cache.css("left", _x);
            cache.css("top", _z);
            cache.show();
        }, this));
        
        //player_infos
        $.sync_cache(player_infos, player_info_panels, gen_player_info_panel, function () {
            this.hide();
        }, function (data, cache) {
            cache.update(data);
        });

        //events
        if(this.show_subtitles) {

            if(last_time_in_milli == -1) {
                last_time_in_milli = start_time;
            }
            var now = new Date().getTime();
            var time = now - last_time_in_milli;
            last_time_in_milli = now;

            var new_subtitles = [];
            for(var i = 0, l = subtitles.length; i < l; ++i) {
                var subtitle = subtitles[i];
                subtitle.x -= subtitle.v * time;
                if(subtitle.x > subtitle.min_x) {
                    new_subtitles.push(subtitle);
                } else {
                    busy_y[subtitle.y] = false;
                }
            }
            var events = data[INDEX_EVENTS];
            for(var k in events) {
                if(events[k] instanceof Array) {
                    var text = null;
                    if(events[k][0] == EVENT_HIT_TRAP) {
                        text = _get_car(car_init_data[data[INDEX_CARS][events[k][2]][INDEX_CAR_ID]].type).trap_msg(
                            room.players[events[k][2]].name, room.players[events[k][1]].name
                        );
                    } else if(events[k][0] == EVENT_HIT_MISSILE) {
                        text = _get_car(car_init_data[data[INDEX_CARS][events[k][2]][INDEX_CAR_ID]].type).missile_msg(
                            room.players[events[k][2]].name, room.players[events[k][1]].name
                        );
                    }
                    if(text) {
                        var y = 0;
                        while(busy_y[y]) {
                            ++y;
                        }
                        busy_y[y] = true;
                        new_subtitles.push({
                            text: text,
                            v: text.length / 160,
                            x: 920,
                            min_x: -text.length * 14,
                            y: y
                        });
                    }
                 }
            }
            subtitles = new_subtitles;

            for(var i = 0, l = subtitles.length - subtitle_panels.length; i < l; ++i) {
                subtitle_panels.push($("<div class='subtitle'></div>").appendTo($("#player_status")));
            }
            for(var i = subtitles.length, l = subtitle_panels.length; i < l; ++i) {
                subtitle_panels[i].hide();
            }
            for(var i = 0, l = subtitles.length; i < l; ++i) {
                subtitle_panels[i]
                    .html(subtitles[i].text)
                    .css("left", Math.round(subtitles[i].x) + "px")
                    .css("top", Math.round(subtitles[i].y * 30 + 75) + "px")
                    .show();
            }
        } else {
            for(var k in subtitle_panels) {
                subtitle_panels[k].hide();
            }
        }
    }
};

})(jQuery);
