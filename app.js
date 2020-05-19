var express = require('express');
var app = express();
var redis = require('redis');
var cookie = require('cookie-parser')
var bodyParser = require('body-parser');
var path = require('path');
var http = require('http');
var date = require('date-utils');
var httpServer = http.createServer(app).listen(3080, function(req,res){
  console.log('Socket IO server has been started');
});
var io = require('socket.io').listen(httpServer);
var secretKey = 'aka.willshine_deV_um_@33aa~@#5';
var redisClient = redis.createClient();

// var userList = {};
// var redisKey = 'userlist';
app.listen(3000, function(){
  var txt = '';
  if( process.env.NODE_ENV == 'production' ) {
    txt = 'Prod Mod';
  } else if( process.env.NODE_ENV == 'development' ) {
    txt = 'Dev Mod';
    app.locals.pretty=true;
  }
  else{
    txt = 'env undefine.. need command "export NODE_ENV=development"';
  }
});

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookie(secretKey));

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

function refreshUserList(roomId, user, push){
  // console.log(roomId + ' / '+user.nickname + ' / '+user.socketId+' / '+ push);
  if(push){
    redisClient.hset(roomId, user.socketId, user.nickname, redis.print);
  }else{
    redisClient.hdel(roomId, user.socketId, redis.print);
  }

  redisClient.hgetall(roomId, function (err, userlist) {
    // console.log(userlist);
    if(userlist != undefined && userlist != null){
      io.sockets.in(roomId).emit('room_userlist', userlist);
    }
  });

}

app.get('/', function(req, res){
  res.render('login');
});

app.post('/room', function(req, res){
  var nickname = req.body.nickname;
  res.cookie('nickname', nickname);
  res.render('room', {nickname: nickname});
});


//status 001 - connect, 002 - disconnect
io.on('connection', function(socket){
  socket.on('join_room', function(data){
    socket.join(data.roomId);
    console.log(data.nickname+'['+socket.id+'] is join room :'+data.roomId);
    var nickname = data.nickname;
    var socketId = socket.id;
    var datas = {
      connection: true,
      nickname: nickname
    };
    socket.username = nickname;
    io.sockets.in(data.roomId).emit('room_arm', datas);
    refreshUserList(data.roomId, {socketId: socketId, nickname: nickname}, true );
  });

  socket.on('leave_room', function(data){
    socket.leave(data.roomId);
    console.log(data.nickname+'['+socket.id+'] is leave room :'+data.roomId);
    var nickname = data.nickname;
    var socketId = socket.id;
    var datas = {
      connection: false,
      nickname: nickname
    };
    io.sockets.in(data.roomId).emit('room_arm', datas);
    refreshUserList(data.roomId, {socketId: socketId, nickname: nickname}, false);
  });

  socket.on('chat_msg', function(data){
    var datetime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
    var datas = {
      nickname: data.nickname,
      message: data.message,
      date: datetime
    };
    // socket.emit('chat_msg', datas);
    io.sockets.in(data.roomId).emit('room_msg', datas);
    // console.log('room:'+data.roomId
    //             +' / chat:'+data.nickname+':'+data.message);
  });
});
