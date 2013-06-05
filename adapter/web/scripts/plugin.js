/*
 * jQuery Alert, Confirm, Waiting, Array Each
 */
(function ($) {
    $.extend({
        array_each: function (array, func) {
            if($.type(array.length) != 'number')
                return;
            for(var i = 0; i < array.length; i++) {
                $.proxy(func, array[i])(i, array[i]);
            }
        },
        confirm: function (options) {
            if(options == null)
                options = {};
            if($.type(options) == "string") {
                options = {
                    tip: options
                };
            }
            options.title = options.title || "";
            options.tip = options.tip || "确定吗？";
            options.modal = options.modal == false ? false : true;
            var dialog = $('<div class="dialog_confirm" title=' + options.title + '>' + options.tip + '</div>').css('overflow', 'visible');
            var buttons = [];
            buttons.push({
                text: "确定",
                click: options.okfunc || function () {
                    $(this).dialog("close");
                }
            });
            buttons.push({
                text: "取消",
                click: options.cancelfunc || function () {
                    $(this).dialog("close");
                }
            });
            dialog.dialog({
                modal: options.modal,
                buttons: buttons
            });
        },
        waiting: function (options) {
            var cmd = "show";
            if(options == null)
                options = {};
            switch($.type(options))
            {
                case "string":
                    cmd = options;
                    break;
                case "object":
                    cmd = options.cmd || cmd;
                    break;
            }
            var waitdialog = null;
            if($.waiting._dialog == null) {
                $.waiting._dialog = $('<div class="waitdialog"><img src="./images/waiting.gif" alt="" title="" /><span></span></div>').css("overflow", "visible");
            }
            waitdialog = $.waiting._dialog;
            if(cmd == "close") {
                waitdialog.dialog("close");
                $.waiting._isOpen = false;
            } else if(cmd == "show") {
                options.tip = options.tip || "请等待...";
                $("span", waitdialog).text(options.tip);
                if(!$.waiting._isOpen) {
                    $.waiting._isOpen = true;
                    waitdialog.dialog({
                        modal: true,
                        closeOnEscape: false,
                        minHeight: false,
                        open: function (event, ui) {
                            $(".ui-dialog-titlebar").hide();
                        }
                    });
                }
            }
        }
    });
})(jQuery);
;/*
 * jQuery Console
 */
(function ($, window, document) {
    var console_list = [];
    $.extend({
        console: function (options) {
            options = options || {};
            var status = {
                name: options.name,
                showtip: options.showtip == false ? false : true,
                paused: options.paused || false,
                outputwindow: $('<div></div>')
                    .height(300).css('overflow', 'auto').css('padding', '5px'),
                tip_panel: $('<div></div>')
                    .css('background', '#fff')
                    .css('border', '1px solid #ddd')
                    .css('position', 'absolute')
                    .css('padding', '10px')
                    .width(500)
            };
            console_list.push(status);
            var tip_panel = $('<div></div>')
                .width(60).css('text-align', 'center')
                .css('background', '#fff').css('border', 'solid 1px #ddd')
                .css('padding', '10px').css('border-radius', '10px').hide();
            var console = $('<div></div>')
                .css('background', '#fff').css('border', 'solid 1px #ddd')
                .css('padding', '10px').css('border-radius', '10px')
                .append($('<input type="button" />').val(status.paused ? 'Start' : 'Pause').click(function() {
                    status.paused = !status.paused;
                    $(this).val(status.paused ? 'Start' : 'Pause');
                }))
                .append($('<input value="Snapshot" type="button" />').click(function() {
                    status.paused = !status.paused;
                    setTimeout(function () {
                        status.paused = !status.paused;
                    }, 100);
                }))
                .append($('<input value="Select All" type="button" />').click(function() {
                    var obj = status.outputwindow.get(0);
                    if ($.browser.msie) {
                        var range = document.body.createTextRange();
                        range.moveToElementText(obj);
                        range.select();
                    } else if ($.browser.mozilla || $.browser.opera) {
                        var selection = window.getSelection();
                        var range = document.createRange();
                        range.selectNodeContents(obj);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else if ($.browser.safari) {
                        var selection = window.getSelection();
                        var range = document.createRange();
                        range.selectNodeContents(obj);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        //selection.setBaseAndExtent(obj, 0, obj, 1);
                    }
                }))
                .append($('<input value="Clear" type="button" />').click(function() {
                    status.outputwindow.html('');
                }))
                .append($('<input type="button" />').val(status.showtip ? 'Hide Tip' : 'Show Tip').click(function() {
                    status.showtip = !status.showtip;
                    $(this).val(status.showtip ? 'Hide Tip' : 'Show Tip');
                }))
                .append($('<input value="Hide" type="button" />').click(function() {
                    console.hide();
                    tip_panel.show();
                }))
                .append(status.outputwindow)
                .append(status.tip_panel.hide());
            tip_panel.append($('<input value="Show" type="button" />').click(function () {
                tip_panel.hide();
                console.show();
            }));
            if(options.hide) {
                console.hide();
                tip_panel.show();
            }
            return $('<div></div>').css('cursor', 'default').append(console).append(tip_panel);
        }
    });
    var appendMessage = function (status, msg) {
        var callstack = [];
        var isCallstackPopulated = false;
        try {
            i.dont.exist += 0; //doesn't exist- that's the point
        } catch(e) {
            if (e.stack) { //Firefox
                var lines = e.stack.split('\n');
                for (var i = 0, len = lines.length; i < len; i++) {
                    if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+/)) {
                        callstack.push(lines[i]);
                    }
                }
                //Remove call to printStackTrace()
                callstack.shift();
                isCallstackPopulated = true;
            } else if ($.browser.opera && e.message) { //Opera
                var lines = e.message.split('\n');
                for (var i=0, len=lines.length; i < len; i++) {
                    if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                        var entry = lines[i];
                        //Append next line also since it has the file info
                        if (lines[i+1]) {
                            entry += ' at ' + lines[i + 1];
                            i++;
                        }
                        callstack.push(entry);
                    }
                }
                //Remove call to printStackTrace()
                callstack.shift();
                isCallstackPopulated = true;
            }
        }
        if (!isCallstackPopulated) { //IE and Safari
            var currentFunction = arguments.callee.caller;
            while (currentFunction) {
                var fn = currentFunction.toString();
                var fname = fn.substring(fn.indexOf('function') + 8, fn.indexOf('')) || 'anonymous';
                callstack.push(fname);
                currentFunction = currentFunction.caller;
            }
        }
        callstack = callstack.slice(2, callstack.length);
        var _res = $('<div></div>');
        for(var i = 0; i < callstack.length; i++) {
            _res.append($('<div></div>').text(callstack[i]));
        }
        var _m = $('<div></div>')
            .css('line-height', '1.5em')
            .data('stacktrace', _res.html())
            .hover(function () {
                $(this).css('background', '#eee');
                $('span', $(this)).css('background', '#ddd');
                if(status.showtip) {
                    status.tip_panel.html($(this).data('stacktrace')).stop(true, true).fadeIn();
                }
            }, function () {
                $(this).css('background', '#fff');
                $('span', $(this)).css('background', '#eee');
                //tip_panel.stop(true, true).fadeOut();
                status.tip_panel.hide();
            })
            .mousemove(function (e) {
                if(status.showtip) {
                    offset = {
                        left: e.pageX + 3,
                        top: e.pageY + 3
                    };
                    if(offset.left + status.tip_panel.outerWidth() > $('body').width()) {
                        offset.left -= status.tip_panel.outerWidth() + 6;
                    }
                    if(offset.top + status.tip_panel.outerHeight() > $('body').height()) {
                        offset.top -= status.tip_panel.outerHeight() + 6;
                    }
                    status.tip_panel.offset(offset);
                }
            })
            .css('padding', '2px 5px').css('margin', '4px 0');
        for(var i = 0; i < msg.length; i++) {
            var _item = $('<span></span>')
                .text(msg[i]).css('border-radius', '2px')
                .css('background', '#eee').css('padding', '3px 8px').css('margin', '0 4px');
            _m.append(_item);
        }
        status.outputwindow.append(_m);
        status.outputwindow.scrollTop(status.outputwindow.get(0).scrollHeight);
    }
    $.extend({
        log: function() {
            var msg = null;
            for(var i = 0; i < console_list.length; i++) {
                if(!console_list[i].paused) {
                    if(msg == null) {
                        msg = [];
                        for(var k = 0; k < arguments.length; k++) {
                            var _m = arguments[k];
                            if(typeof _m == 'undefined') {
                                _m = 'undefined';
                            } else if(typeof JSON != 'undefined') {
                                try {
                                    _m = JSON.stringify(_m);
                                } catch (e) {
                                    if(_m instanceof $) {
                                        var res = [];
                                        res.push('[');
                                        $.each(_m, function (i, n) {
                                            res.push(n.toString());
                                            res.push(', ');
                                        });
                                        if(res.length > 1) {
                                            res[res.length - 1] = ']';
                                        } else {
                                            res.push(']');
                                        }
                                        _m = res.join('');
                                    } else {
                                        _m = _m.toString();
                                    }
                                }
                            }
                            msg.push(_m);
                        }
                    }
                    appendMessage(console_list[i], msg);
                }
            }
        },
        logTo: function (name) {
            var msg = null;
            for(var i = 0; i < console_list.length; i++) {
                if(!console_list[i].paused && console_list[i].name == name) {
                    if(msg == null) {
                        msg = [];
                        for(var k = 1; k < arguments.length; k++) {
                            var _m = arguments[k];
                            if(typeof _m == 'undefined') {
                                _m = 'undefined';
                            } else if(typeof JSON != 'undefined') {
                                _m = JSON.stringify(_m);
                            }
                            msg.push(_m);
                        }
                    }
                    appendMessage(console_list[i], msg);
                }
            }
        }
    });
})(jQuery, window, document);