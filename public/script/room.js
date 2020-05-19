//var server = 'um-chat.tk:3080';
var urlParser = document.createElement('a');
urlParser.href = location.href;
var server = urlParser.hostname+':3080';
var blankPattern = /^\s+|\s+$/g;

function getCookie(cname){
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++){
    var c = ca[i].trim();
    if (c.indexOf(name)==0) return c.substring(name.length,c.length);
  }
  return "";
}

$(document).ready(function(){
  var socket = io.connect(server);
  var nickname = decodeURIComponent(getCookie('nickname'));
  var roomId= '1818'

  socket.emit('join_room',{roomId: roomId, nickname: nickname});

  $(window).on('beforeunload', function(){
    socket.emit('leave_room', {roomId: roomId, nickname: nickname});
  });

  socket.on('room_msg', function(data){
    var msg = '';
    if(data.nickname == nickname){
      msg = '<li class="text-right"><span>'+ data.nickname
          + '</span><span>' + data.date
          + '</span><br><div>' + data.message
          + '</div>'
    }else{
      msg = '<li><span>'+ data.nickname
          + '</span><span>' + data.date
          + '</span><br><div>' + data.message
          + '</div>'
    }
    $('#messages').append($(msg));
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
  });

  socket.on('room_arm', function(data){
    if(data.connection){
      statusMsg = ' 님이 입장하셨습니다.</h4>';
    }else{
      statusMsg = ' 님이 퇴장하셨습니다.</h4>';
    }
    $('#messages').append($('<h4>' + data.nickname + statusMsg));
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
  });

  socket.on('room_userlist', function(userlist){
    $('.users').remove();
    $.each(userlist, function(key,value) {
      //  console.log('key:'+key+', value:'+value);
      $('#userlist').append('<span class="users" id="'+key+'">'+ value +'</span>');
    });
  });


  $('#chat_bar').submit(function(){
    var message = $('#mi').val();
    var isBlank = message.replace(blankPattern, '' ) == "" ? true : false;

    if(!message || isBlank) return false;

    var data =   {
      roomId: roomId,
      nickname : nickname,
      message : message
    };
    socket.emit('chat_msg',data);
    $('#mi').val('');
    $('#mi').focus();
    return false;
  });

}); //document.ready -- END
