var express = require('express');
var app = express();
var events = require('events');
var eventEmitter = new events.EventEmitter();
//设置静态文件路径
app.use(express.static(__dirname + '/client'));
app.use(function(req,res) {
    res.sendFile(__dirname + '/client/index.html');
});
var messages = [];
messages.push('欢迎你来到myChat!');
var server = app.listen(3000,function() {
    console.log('app is running at port 3000 !');
    messages.push('app is running at port 3000 !');
});

var io = require('socket.io').listen(server);



io.sockets.on('connection',function (socket) {
    socket.emit('connected');
    console.log('connected');
    socket.broadcast.emit('newClient',new Date());

    socket.on('getAllMessages',function () {
        socket.emit('allMessages',messages);
    });


    for(var i = 0;i < 10;i++) {
        setTimeout(function () {
            eventEmitter.emit('addMessage','aaa');
            console.log(i);
        },100);
    }

    eventEmitter.on('addMessage',function (message) {
        messages.push(message);
        io.sockets.emit('newMessage',message);
    });
});
