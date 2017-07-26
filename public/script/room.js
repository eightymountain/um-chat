var server = 'localhost:3080';

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
  var nickname = getCookie('nickname');


  $(function () {
    $('form').submit(function(){
      var message = $('#mi').val();
      socket.emit('chat_msg', {nickname : nickname, message : message});
      $('#mi').val('');
      return false;
    });
    socket.on('chat_msg', function(data){
      $('#messages').append($('<li><span>'
                                + data.nickname
                                + '</span>:<span>'
                                + data.message
                                + '</span>'));
    });
  });

});
