(function($){

var player_info_panels = [];
var gen_player_info_panel = function () {
    var res = $("<div class='player_info'></div>");
    res.update = function (data) {
        
    };
    player_info_panels.push(res);
    return res;
};

var map_box = [];
var first_set = true;
var map_car = [];

var last_items = [0, 0, 0, 0];
var last_hp = [1, 1, 1];
var last_cd = 0;
var last_time = null;

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
        first_set = true;
    },
    refresh: function (type, data, player_infos, boxes_data, start_time, game_status) {
        
        //time
        var last = Math.floor((new Date().getTime() - start_time) / 1000);
        var cur_time = Math.floor(last / 60) + ':' + (last % 60 < 10 ? '0' + last % 60 : last % 60);
        if(cur_time != last_time) {
            $(".time").text(cur_time);
            last_time = cur_time;
        }
        
        //hp
        var hp = data[INDEX_HP][data[INDEX_INDEX]];
        var cur_hp = [0, 0, 0];
        for(var i = 3; i > 0; --i) {
            if(hp < i) {
                cur_hp[i - 1] = 0;
            } else {
                cur_hp[i - 1] = 1;
            }
            if(cur_hp[i - 1] != last_hp[i - 1]) {
                if(hp < i) {
                    $(".hp" + i).addClass("hurt");
                } else {
                    $(".hp" + i).removeClass("hurt");
                }
            }
        }
        last_hp = cur_hp;
        
        //game_status
        if(game_status == STATUS_LOADING)
        {
            $(".tip").text("载入中...").css("background", "#f8f8f8").show();
            return;
        } else if(data[INDEX_EVENTS].indexOf(EVENT_GAME_END) != -1) {
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
        for(var i = 0, l = boxes_data.length - map_box.length; i < l; ++i) {
            map_box.push($("<div class='map_box'></div>").appendTo($("#player_status .map")));
        }
        for(var i = 0, l = map_box.length - boxes_data.length; i < l; ++i) {
            map_box[i].hide();
        }
        $.each(boxes_data, function (i, data) {
            if(data.v) {
                if(first_set) {
                    var _x = 95 + data.x / 40;
                    var _z = 95 - data.z / 40;
                    map_box[i].css("left", _x);
                    map_box[i].css("top", _z);
                }
                map_box[i].show();
            } else {
                map_box[i].hide();
            }
        });
        first_set = false;
        for(var i = 0, l = data[INDEX_CARS].length - map_car.length; i < l; ++i) {
            map_car.push($("<div class='map_car'></div>").appendTo($("#player_status .map")));
        }
        for(var i = 0, l = map_car.length - data[INDEX_CARS].length; i < l; ++i) {
            map_car[i].hide();
        }
        $.each(data[INDEX_CARS], function (i, car_data) {
            var _x = 94 + car_data[INDEX_X] / 40;
            var _z = 94 - car_data[INDEX_Z] / 40;
            map_car[i].css("background", i == data[INDEX_INDEX] ? '#eee' : '#d55');
            map_car[i].css("left", _x);
            map_car[i].css("top", _z);
            map_car[i].show();
        });
        
        //player_infos
        for(var i = 0, l = player_infos.length - player_info_panels.length; i < l; ++i) {
            gen_player_info_panel();
        }
        for(var i = 0, l = player_info_panels.length - player_infos.length; i < l; ++i) {
            player_info_panels[i].hide();
        }
        for(var i = 0, l = player_infos.length; i < l; ++i) {
            player_info_panels[i].update(player_infos[i]);
        }
        
    }
};

})(jQuery);
