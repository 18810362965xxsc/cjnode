var express = require('express');
var app = express();

//设置静态文件路径
app.use(express.static(__dirname + '/client'));
app.use(function(req,res) {
    res.sendFile(__dirname + '/client/index.html');
});

var server = app.listen(3000,function() {
    console.log('app is running at port 3000 !');
});

var io = require('socket.io').listen(server);

var messages = [];
messages.push('欢迎你来到myChat!');

io.sockets.on('connection',function (socket) {
    socket.emit('connected');
    console.log('connected');
    socket.broadcast.emit('newClient',new Date());

    socket.on('getAllMessages',function () {
        socket.emit('allMessages',messages);
    });

    socket.on('addMessage',function (message) {
        messages.push(message);
        io.sockets.emit('newMessage',message);
    });
});
