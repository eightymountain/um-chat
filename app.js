var express = require('express');
var app = express();
var cookie = require('cookie-parser')
var bodyParser = require('body-parser');
var path = require('path');
var http = require('http');
var httpServer = http.createServer(app).listen(3080, function(req,res){
  console.log('Socket IO server has been started');
});
var io = require('socket.io').listen(httpServer);
var cookieKey = 'aka.willshine_deV_um_@33aa~@#5';

app.listen(3000, function(){
  var txt = '';
  if( process.env.NODE_ENV == 'production' ) {
    txt = 'Prod Mod';
  } else if( process.env.NODE_ENV == 'development' ) {
    txt = 'Dev Mod';
    app.locals.pretty=true;
  }
  else{
    txt = 'env undefine.. need set "export NODE_ENV=development"';
  }
  console.log('Connected 3000 port - ' + txt);
});

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookie(cookieKey));
app.set('view engine', 'jade');
app.set('views', './views');

app.get('/', function(req, res){
  res.render('login');
});

app.post('/room', function(req, res){
  var nickname = req.body.nickname;
  console.log(nickname);
  res.cookie('nickname', nickname);

  res.render('room', {nickname: nickname});
});

io.on('connection', function(socket){
  socket.on('chat_msg', function(data){
    console.log('chat:'+data.nickname+':'+data.message);
    io.emit('chat_msg', data);
  });
});
