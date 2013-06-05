(function($, jcg_canvas, jcg_webgl, jcn, jcu){
//Ready
$(function(){

//Initialize
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
            room = data;
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
            room = data;
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
$(".room .addaibutton").click(function () {
    jcn.request(null, "addai", null, $.noop);
});
$(".room .quitbutton").click(function () {
    jcn.request("退出房间", "quit", null, function() {
        room = null;
        $(".room").hide();
        $(".hall").show();
    });
});
jcn.socket.on("refresh_room", function(data) {
    if(data && room && data.id == room.id) {
        room = data;
        $(".playerlist .playerlist_item").remove();
        $.each(room.players, function() {
            if(this != null) {
                var _citem = $("<div></div>");
                var _statusspan = $("<span></span>").addClass("status").text(this.status);
                var _ipspan = $("<span></span>").addClass("ip").text(this.ip.address + ':' + this.ip.port);
                _citem.addClass("playerlist_item").append(_statusspan).append(_ipspan).append(this.name);
                $(".playerlist").append(_citem);
            }
        });
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
    "70": 1,    //f
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
    jcg.draw(data, room, {shadow: _shadow_quality});
    if(alive && data[INDEX_HP][data[INDEX_INDEX]] == 0) {
        alive = false;
        jcn.socket.emit("keystatus", 0);
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