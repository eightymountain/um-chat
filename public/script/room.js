var server = location.hostname;
var blankPattern = /^\s+|\s+$/g;

var toolbox;
var userlist;
var messages;
var mi;
var socket;
var nickname;
var roomId
var toolboxTarget = undefined;

$(document).ready(function () {
    socket = io.connect(server);
    nickname = decodeURIComponent(getCookie('nickname'));
    roomId = decodeURIComponent(getCookie('roomId'));
    mi = $('#mi');
    messages = $('#messages');
    userlist = $('#userlist');
    toolbox = $('#toolbox');

    socket.emit('join_room', {roomId: roomId, nickname: nickname});

    socket.on('room_msg', function (data) {
        var msg = '<li class="'
            + (data.nickname === nickname ? 'text-right' : '')
            + '"><span>' + data.nickname
            + '</span><span>' + data.date
            + '</span><br><div>' + data.message
            + '</div>'

        messages.append($(msg));
        messages.scrollTop(messages[0].scrollHeight);
    });

    socket.on('room_action_msg', function (data) {
        var msg = '<h6>' + data.nickname + ' 님이 ' + (data.connection ? '돌아왔다.' : '떠났다...') + '</h6>';
        messages.append($(msg));
        messages.scrollTop(messages[0].scrollHeight);
    });

    socket.on('room_arm', function (data) {
        var msg = '<h4>' + data.nickname + ' 님이 ' + (data.connection ? '돌아왔다.' : '떠났다...') + '</h4>';
        messages.append($(msg));
        messages.scrollTop(messages[0].scrollHeight);
    });

    socket.on('room_userlist', function (list) {
        $('.users').remove();
        $.each(list, function (key, value) {
            userlist.append('<div class="users" id="' + key + '"><span class="nick">' + value + '</span></div>');
        });
    });


    $('#chat_bar').submit(function () {
        var message = mi.val();
        if (!message || message.replace(blankPattern, '') === "") return false;

        sendMsg(message);

        mi.val('');
        mi.focus();

        return false;
    });

    $(document).on('click', "#userlist .users", function () {
        toolbox.detach().appendTo(this);
        toolbox.show();
    });

    $(window).on('beforeunload', function () {
        socket.emit('leave_room', {roomId: roomId, nickname: nickname});
    });

}); //document.ready -- END

function toolboxAction(ele, msg, e) {
    var nm = $('#toolbox').parent().children()[0].innerText
    sendMsg(nickname + '님이 ' + nm + msg, 'action');
}

function closeToolbox(e) {
    e.stopPropagation();
    if (toolbox) {
        toolbox.hide();
    }
    return false;
}

function sendMsg(msg, type = 'msg') {
    socket.emit('chat_msg', {
        roomId: roomId,
        nickname: nickname,
        message: msg,
        type: type
    });
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}
