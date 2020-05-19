//var server = 'um-chat.tk:3080';
var urlParser = document.createElement('a');
urlParser.href = location.href;
var server = urlParser.hostname;
var blankPattern = /^\s+|\s+$/g;

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}

$(document).ready(function () {
    var socket = io.connect(server);
    var nickname = decodeURIComponent(getCookie('nickname'));
    var roomId = '1818'

    var messages = $('#messages');
    var mi = $('#mi');
    var userlist = $('#userlist');

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

    socket.on('room_arm', function (data) {
        messages.append($('<h4>' + data.nickname + ' 님이 ' + (data.connection ? '돌아왔다.' : '떠났다...')));
        messages.scrollTop(messages[0].scrollHeight);
    });

    socket.on('room_userlist', function (list) {
        $('.users').remove();
        $.each(list, function (key, value) {
            //  console.log('key:'+key+', value:'+value);
            userlist.append('<span class="users" id="' + key + '">' + value + '</span>');
        });
    });


    $('#chat_bar').submit(function () {
        var message = mi.val();

        if (!message || message.replace(blankPattern, '') === "") return false;

        var data = {
            roomId: roomId,
            nickname: nickname,
            message: message
        };
        socket.emit('chat_msg', data);
        mi.val('');
        mi.focus();
        return false;
    });

    $(window).on('beforeunload', function () {
        socket.emit('leave_room', {roomId: roomId, nickname: nickname});
    });

}); //document.ready -- END
