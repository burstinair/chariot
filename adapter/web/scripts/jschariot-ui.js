(function($, jcg_canvas, jcg_webgl, jcn, jcu){
//Ready
$(function(){

//Initialize
var gen_team_selector = function (enabled) {
    enabled = enabled !== false;
    var res = $("<div class='team_selector'></div>");
    var selector = $("<div class='selector_panel'></div>").appendTo(res);
    var display = $("<div class='display_panel'></div>").appendTo(res).click(function (event) {
        if(enabled) {
            if(selector.is(":visible")) {
                selector.fadeOut('fast');
            } else {
                selector.fadeIn('fast');
                event.stopPropagation();
            }
        }
    });
    $('body').click(function () {
        selector.fadeOut();
    });
    var show = function (team) {
        display.css('background', '#' + TEAM_COLORS[team].toString(16));
    };
    for(var i = 0, l = TEAM_COLORS.length; i < l; ++i) {
        $("<div class='team_color'></div>")
            .attr('rel', i)
            .css('background', '#' + TEAM_COLORS[i].toString(16))
            .appendTo(selector)
            .click($.proxy(function () {
                show(this.team);
                selector.fadeOut('fast');
                res.trigger("change", this.team);
            }, {team: i}));
    }
    $("<div class='clear'></div>").appendTo(selector);
    res.val = function (team, trigger_event) {
        trigger_event = trigger_event || false;
        show(team);
        if(trigger_event) {
            res.trigger("change", team);
        }
        return res;
    };
    return res;
};

$("input:submit, input[type=button]").button()
    .css("font-size", "12px").css("overflow", "hidden").css("padding", "0px 12px").height(24);
$("input:text, input:password, textarea").css("border", "1px solid #ccc").css("cursor", "text");
$("a").css("cursor", "pointer");
$(".nicknameinput").val($.cookie('nickname') || '');
var _use_webgl = $.cookie('use_webgl') != 'false';
if(_use_webgl) {
    $("#use_webgl").attr("checked", "checked");
} else {
    $("#use_webgl").removeAttr("checked");
}
$("#use_webgl").change(function () {
    if(_use_webgl = $("#use_webgl").is(":checked")) {
        _canvas_game_window.hide();
        _webgl_game_window.show();
        _player_status_panel.show();
    } else {
        _webgl_game_window.hide();
        _player_status_panel.hide();
        _canvas_game_window.show();
    }
    $.cookie('use_webgl', _use_webgl.toString().toLowerCase(), {expires: 365});
});

var _game_window_container = $("#gamewindow_container");
var _player_status_panel = $("#player_status");
var _canvas_game_window, _webgl_game_window;

var _shadow_quality = parseInt($.cookie('shadow_quality') || '512');
$("input#shadow" + _shadow_quality).attr("checked", "chekced");
$("input[name=shadow]").change(function () {
    if($(this).is(":checked")) {
        _shadow_quality = parseInt($(this).val());
        $.cookie('shadow_quality', _shadow_quality.toString().toLowerCase(), {expires: 365});
    }
})

jcu.all_colors = $.cookie('all_colors') != 'false';
if(jcu.all_colors) {
    $("#all_colors").attr("checked", "checked");
} else {
    $("#all_colors").removeAttr("checked");
}
$("#all_colors").change(function () {
    jcu.all_colors = $("#all_colors").is(":checked");
    $.cookie('all_colors', jcu.all_colors.toString().toLowerCase(), {expires: 365});
});

jcu.show_subtitles = $.cookie('show_subtitles') != 'false';
if(jcu.show_subtitles) {
    $("#show_subtitles").attr("checked", "checked");
} else {
    $("#show_subtitles").removeAttr("checked");
}
$("#show_subtitles").change(function () {
    jcu.show_subtitles = $("#show_subtitles").is(":checked");
    $.cookie('show_subtitles', jcu.show_subtitles.toString().toLowerCase(), {expires: 365});
});

var jcg = {
    initialize: function (data) {
        data.boxes.reverse();
        _canvas_game_window = $(jcg_canvas.initialize(data));
        _webgl_game_window = $(jcg_webgl.initialize(data));
        
        if(_use_webgl) {
            _canvas_game_window.hide();
            _webgl_game_window.show();
            _player_status_panel.show();
        } else {
            _webgl_game_window.hide();
            _player_status_panel.hide();
            _canvas_game_window.show();
        }
        
        _game_window_container.empty().append(_canvas_game_window).append(_webgl_game_window);
    },
    draw: function (data, room_info, options) {
        if(_use_webgl) {
            jcg_webgl.draw(data, room_info, options);
        } else {
            jcg_canvas.draw(data, room_info, options);
        }
    }
};

//Console
$('body').append($.console({paused: false, hide: false, showtip: false})
    .width(960).css('margin', 'auto').css('text-align', 'left'));

//Hall
var room = null;
var self_player_id = null;
var get_self = function () {
    for(var i = 0, l = room.players.length; i < l; ++i) {
        if(room.players[i].id == self_player_id) {
            return room.players[i];
        }
    }
    return null;
};

var checkNickname = function (notip) {
    if (/^(?!.{20}|\s*$)/g.test($(".nicknameinput").val() || '')) {
        return true;
    } else {
        if(!notip)
            $.confirm("昵称不能为空且长度需小于等于20。");
        return false;
    }
}
var doJoin = function () {
    var selectedroom = $(".roomlist .selected");
    if(selectedroom.length == 0) {
        $.confirm("请先选择房间。");
    } else if (checkNickname()) {
        var id = selectedroom.data("roomid");
        jcn.request("加入房间", "join", {
            id: id,
            name: $(".nicknameinput").val()
        }, function (data) {
            $.cookie('nickname', $(".nicknameinput").val(), {expires: 365});
            room = data.room;
            self_player_id = data.id;
            $(".roomtitle").text([room.title, "(", room.id, ")"].join(''));
            $(".hall").hide();
            $(".room").show();
        });
    }
}
var doCreate = function () {
    if (checkNickname()) {
        jcn.request("创建房间", "create", {
            name: $(".nicknameinput").val()
        }, function (data) {
            $.cookie('nickname', $(".nicknameinput").val(), {expires: 365});
            room = data.room;
            self_player_id = data.id;
            $(".roomtitle").text([room.title, "(", room.id, ")"].join(''));
            $(".hall").hide();
            $(".room").show();
        });
    }
}
$(".joinbutton").click(function () {
    doJoin();
});
$(".createbutton").click(function () {
    doCreate();
});
jcn.socket.on("refresh_hall", function(data) {
    $(".roomlist .roomlist_item").remove();
    $.each(data, function() {
        if(this != null) {
            var _citem = $("<div></div>");
            var _idspan = $("<span></span>").text(this.id);
            _citem.addClass("roomlist_item").append(_idspan).append(this.title).data("roomid", this.id);
            $(".roomlist").append(_citem);
        }
    });
    $(".roomlist .roomlist_item").hover(function () {
        $(this).toggleClass("hover");
    }).click(function () {
        $(".roomlist .roomlist_item").removeClass("selected");
        $(this).addClass("selected");
    }).dblclick(function () {
        doJoin();
    });
});

//Room
$(".room .readybutton").click(function () {
    jcn.request(null, "ready", null, $.noop);
});
$(".room .map_select").change(function () {
    jcn.request(null, "set_map", $(this).val(), $.noop);
});
$(".room .car_select").change(function () {
    jcn.request(null, "set_car", $(this).val(), $.noop);
});
$(".room .addaibutton").click(function () {
    jcn.request(null, "addai", null, $.noop);
});
$('.room .actions').append('队伍：');
var team_selector = gen_team_selector().change(function (event, team) {
    jcn.request(null, "set_team", team, $.noop);
}).appendTo($('.room .actions'));
$(".room .quitbutton").click(function () {
    jcn.request("退出房间", "quit", null, function() {
        room = null;
        $(".room").hide();
        $(".hall").show();
    });
});
var gen_car_select = function (cur_type, car_select) {
    var res = (car_select || $("<select class='car_select'></select>")).empty();
    $.each(room.car_type_list, function() {
        if(this != null) {
            var _citem = $("<option></option>");
            _citem.text(this.name);
            if(this.id == cur_type) {
                _citem.attr('selected', 'selected');
            }
            _citem.val(this.id);
            res.append(_citem);
        }
    });
    return res;
}
jcn.socket.on("refresh_room", function(data) {
    if(data && room && data.id == room.id) {
        room = data;

        $(".map_select option").remove();
        $.each(room.map_type_list, function() {
            if(this != null) {
                var _citem = $("<option></option>");
                _citem.text(this.name);
                _citem.val(this.id);
                $(".map_select").append(_citem);
            }
        });
        $(".map_select :selected").removeAttr("selected");
        $(".map_select option[value=" + room.map_type + "]").attr("selected", "selected");

        gen_car_select(get_self().car_type, $(".actions .car_select"));

        var car_types = {};
        $.each(room.car_type_list, function() {
            if(this != null) {
                car_types[this.id] = this.name;
            }
        });

        $(".playerlist").empty();
        $.each(room.players, function(index) {
            if(this != null) {
                var _citem = $("<div class='playerlist_item'></div>");
                //var car_type_panel = $("<img class='playerlist_car_type' src='images/cars/" + this.car_type + ".jpg' alt='" + car_types[this.car_type] + "'></img>")
                $("<img class='playerlist_car_type' alt='" + car_types[this.car_type] + "'></img>")
                    .appendTo(_citem);
                var info_panel = $("<div class='playerlist_info'></div>").appendTo(_citem);
                $("<div class='playerlist_name'></div>").text(this.name).appendTo(info_panel);
                $("<div class='playerlist_ip'></div>").text(this.ip.address + ':' + this.ip.port).appendTo(info_panel);
                if(this.ai) {
                    gen_team_selector().addClass('team_selector_single_line').change(function (event, team) {
                        jcn.request('', 'set_ai_team', {index: index, team: team}, $.noop);
                    }).val(this.team).appendTo(info_panel);
                    gen_car_select(this.car_type).change(function () {
                        var cur_type = $(this).val();
                        jcn.request('', 'set_ai_car', {index: index, type: cur_type}, $.noop);
                    }).appendTo(info_panel);
                } else {
                    gen_team_selector(false).addClass('team_selector_single_line').val(this.team).appendTo(info_panel);
                    $("<div class='playerlist_car_type'></div>").text(car_types[this.car_type]).appendTo(info_panel);
                }
                $("<div class='playerlist_status'></div>").text(this.status).appendTo(info_panel);
                $(".playerlist").append(_citem);
            }
        });
        $(".playerlist").append("<div class='clear'></div>");

        team_selector.val(get_self().team);
    }
});
//Game
var keyCapture = null;
var keyStatus = null;
var alive = false;
var _keyMap = {
    "38": 128,  //up
    "40": 64,   //down
    "37": 32,   //left
    "39": 16,   //right
    "65": 8,    //a
    "83": 4,    //s
    "68": 2,    //d
    "70": 1    //f
};
jcn.socket.on(GAME_START, function(data) {
    if(data.id == room.id) {
        jcu.reset();
        jcg.initialize(data);
        keyStatus = 0;
        alive = true;
        $('body').keydown(function (e) {
            var sign = _keyMap[e.keyCode];
            if(sign != null) {
                keyStatus |= sign;
                e.stopPropagation();
                e.preventDefault();
                if(keyCapture) {
                    jcn.socket.emit("keystatus", keyStatus.toString(36));
                }
            }
        });
        $('body').keyup(function (e) {
            var sign = _keyMap[e.keyCode];
            if(sign != null) {
                keyStatus &= ~sign;
                e.stopPropagation();
                e.preventDefault();
                if(keyCapture) {
                    jcn.socket.emit("keystatus", keyStatus.toString(36));
                }
            }
        });
        keyCapture = true;
        $(".room").hide();
        $(".game").show();
        $("body").animate({scrollTop: $(".game .actions").offset().top}, 500);
    }
});
jcn.socket.on(GAME_REFRESH, function (data) {
    jcg.draw(data, room, {shadow: _shadow_quality, all_colors: jcu.all_colors});
    if(alive && data[INDEX_HP][data[INDEX_INDEX]] == 0) {
        alive = false;
        keyCapture = null;
        jcn.socket.emit("keystatus", "0");
    }
});
jcn.socket.on(GAME_END, function () {
    keyCapture = null;
    $('body').unbind('keyup').unbind('keydown');
    $(".game").hide();
    $(".room").show();
});
$(".game .quitbutton").click(function() {
    keyCapture = null;
    $('body').unbind('keyup').unbind('keydown');
    jcn.request("退出游戏", "quit", null, function () {
        room = null;
        $(".game").hide();
        $(".hall").show();
    });
});

});
})(jQuery, jschariot_graphics, jschariot_graphics_webgl, jschariot_network, jschariot_ui);