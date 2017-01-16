//加载依赖库
var express = require('express');
var exec = require('child_process').exec;
var flow = require('nimble');
var fs = require('fs');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var path = require('path');
var io = require('socket.io').listen(server);

//创建express实例
var app = express();

//设置静态文件路径
app.use(express.static(path.join(__dirname,'/static')));
app.use(function (req,res) {
    res.sendFile(path.join(__dirname,'./static/index.html'))
});

var server = app.listen(3000,function () {
    var str = 'app is running at 3000';
    console.log('app is running at 3000');
    eventEmitter.emit('createMessage',str);
});
var messages = [];
io.sockets.on('connection',function (socket) {
   socket.emit('connected');
   socket.emit('getAllMessages');
   console.log("connected");
   socket.on('getAllMessages',function () {
       socket.emit('allMessages',messages);
   });
    eventEmitter.on('createMessage',function (message) {   //监听新日志的产生
        messages.push(message);
        io.sockets.emit('messageAdded',message);
   });
});
// var messages = [];
// messages.push()


//××××××××××××××××××××××××××××持久化检查模块××××××××××××××××××××××××××××××××××××××××
//持久化检查模块
var persistence_button = true;//默认要检查，可以选择在前端页面中设置成关闭
if(persistence_button == true) {
    var cmdStr = 'redis-cli config get save';
    var cmdStr2 = 'redis-cli config get appendonly';
    var snapshotting = true;
    var aof = true;
    var persistence = true;
    flow.series([
        function (callback) {
            exec(cmdStr, function (err, stdout, stderr) {
                if (err) {
                    console.log('config get error:' + stderr);
                }
                else {
                    snapshotting = (stdout.toString().charAt(5) != '\n');
                    console.log(stdout.trim());
                    console.log('the snapshotting is open:' + snapshotting);
                }
                callback();
            });
        },
        function (callback) {
            exec(cmdStr2, function (err, stdout, stderr) {
                if (err) {
                    console.log('config get error:' + stderr);
                }
                else {
                    aof = (stdout.toString().substring(11, 13) != "no")
                    console.log(stdout.trim());
                    console.log('the aof is open:' + aof);
                }
                callback();
            });
        },
        function (callback) {
            if (snapshotting == false && aof == false) {
                persistence = false;
                console.log("persistence is open:" + persistence);
                eventEmitter.emit('persistnotopen');//如果持久化未打开，发射'persistnotopen'事件
                callback();
            }
            else {
                persistence = true;
                console.log("persistence is open:" + persistence);
                callback();
            }
        }
    ]);
}

//×××××××××××××××××××××××××××××××日志监控模块,监控是否断电×××××××××××××××××××××××××××××××××××××××××××
//日志监控模块
var fileName = '/home/chenjing/redis-master/cjlog';
var lostNum = 0;
var restartNum = 0;
var closeNum = 0;
eventEmitter.on('persistnotopen',function () {
    console.log('持久化未开启，需要监控是否断电重启');
    //*****************关闭主从复制************************
    fs.watchFile(fileName,function(curr, prev){
        if(curr.mtime>prev.mtime){
            console.log('close:curr.mtime > prev.mtime');
            var cmdStr11 = "grep -n exit /home/chenjing/redis-master/cjlog";
            //日志监控模块,监控是否断电重启
            exec(cmdStr11, function (err, stdout, stderr) {
                var closeId = stdout.toString().match(/\d*:\d*:M/g);
                //console.log("restartId:"+restartId[restartId.length - 1]);
                // console.log("restartNum="+restartNum);
                if(closeId[closeId.length - 1]!= closeNum) {
                    var closeNumsave = closeNum;
                    closeNum = closeId[closeId.length - 1];
                    // console.log("restartNum变成了："+restartNum);
                    // console.log("restartNumsave="+restartNumsave);
                    if((closeNumsave != 0)&&(closeId[closeId.length - 1] != closeNumsave)) {
                        //console.log("未持久化情况下断电重启,编号："+restartNum);
                        eventEmitter.emit('redisclose');
                        var myDate = new Date();
                        console.log('发射close事件'+myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds());
                    }

                }
                // }
            });

        }else{
            console.log('curr.mtime <= prev.mtime');
        }
    });
    //***************************************************
    //***********************日志监控模块,监控是否断电重启****************************
    fs.watchFile(fileName,function(curr, prev){
        // console.log('persistence:the current mtime is: ' + curr.mtime);
        // console.log('persistence:the previous mtime was: ' + prev.mtime);
        if(curr.mtime>prev.mtime){
            //文件内容有变化，那么通知相应的进程可以执行相关操作。例如读物文件写入数据库等
            //continueReadData();
            console.log('persistence:curr.mtime > prev.mtime');
            var cmdStr10 = "grep -n 'Increased maximum number of open files to' /home/chenjing/redis-master/cjlog";
            //日志监控模块,监控是否断电重启
            exec(cmdStr10, function (err, stdout, stderr) {
                // if (err) {
                //     console.log('config get error:' + stderr);
                // }
                // else {
                    //console.log(stdout);
                    var restartId = stdout.toString().match(/\d*:\d*:M/g);
                    //console.log("restartId:"+restartId[restartId.length - 1]);
                   // console.log("restartNum="+restartNum);
                    if(restartId[restartId.length - 1]!= restartNum) {
                        var restartNumsave = restartNum;
                        restartNum = restartId[restartId.length - 1];
                        // console.log("restartNum变成了："+restartNum);
                        // console.log("restartNumsave="+restartNumsave);
                        if((restartNumsave != 0)&&(restartId[restartId.length - 1] != restartNumsave)) {
                            //console.log("未持久化情况下断电重启,编号："+restartNum);
                            eventEmitter.emit('openDataProtect');
                            var myDate = new Date();
                            console.log('发射opendatapro事件'+myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds());
                        }

                    }
                // }
            });

        }else{
            console.log('curr.mtime <= prev.mtime');
        }
    });
    //***************************************************
});

//*************************日志监控模块,监控是否复制中断*******************************
 fs.watchFile(fileName,function(curr, prev){
        console.log('interrupt:the current mtime is: ' + curr.mtime);
        console.log('interrupt:the previous mtime was: ' + prev.mtime);
        if(curr.mtime>prev.mtime){
            //文件内容有变化，那么通知相应的进程可以执行相关操作。例如读物文件写入数据库等
            //continueReadData();
            console.log('interrupt:curr.mtime > prev.mtime');
            var cmdStr3 = "grep -n 'Disconnecting timeout slave' /home/chenjing/redis-master/cjlog";
            //日志监控模块,监控是否复制中断
            exec(cmdStr3, function (err, stdout, stderr) {
                if (err) {
                    console.log('config get error:' + stderr);
                }
                else {
                    console.log(stdout);
                    var lostId = stdout.toString().match(/\d*:\d*:M/g);
                    console.log("lostId:"+lostId[lostId.length - 1]);
                    console.log("lostNum="+lostNum);
                    if(lostId[lostId.length - 1]!= lostNum) {
                        var lostNumsave = lostNum;
                        lostNum = lostId[lostId.length - 1];
                        console.log("lostNum变成了："+lostNum);
                        console.log("lostNumsave="+lostNumsave);
                        if((lostNumsave != 0)&&(lostId[lostId.length - 1] != lostNumsave)) {
                            console.log("主从复制中断,编号："+lostNum);
                            eventEmitter.emit('redisinterrupt');
                        }

                    }
                }
            });

        }else{
            console.log('curr.mtime <= prev.mtime');
        }
    });


console.log(fileName+ ' 被监听中...');

//××××××××××××××××××××××××××××××数据保障模块×××××××××××××××××××××××××××××××××××××××
//数据保障模块
// var dataProtected = true;
var success = true;
// if(dataProtected) {
eventEmitter.on('redisclose',function () {
    var cmdStr8 = "redis-cli -p 6380 SLAVEOF no one";
    exec(cmdStr8, function (err, stdout, stderr) {
        if (err) {
            console.log('停掉主从复制出错:' + stderr);
        }
        else {
            console.log("停掉主从复制成功："+stdout);
        }
    });
});
eventEmitter.on('openDataProtect',function () {
    flow.series([
        function (callback) {
            //停掉主从复制
            var cmdStr8 = "redis-cli -p 6380 SLAVEOF no one";
            exec(cmdStr8, function (err, stdout, stderr) {
                if (err) {
                    console.log('停掉主从复制出错:' + stderr);
                }
                else {
                    console.log("停掉主从复制成功："+stdout);
                }
                callback();
            });
        },
        function (callback) {
            //数据上载
            var cmdStr9 = "redis-cli SLAVEOF 127.0.0.1 6380";
            exec(cmdStr9, function (err, stdout, stderr) {
                if (err) {
                    console.log('数据上载出错:' + stderr);
                }
                else {
                    console.log("开始数据上载："+stdout);
                }
                callback();
            });
        },
        function (callback) {
            setTimeout(function () {
                if(success) {
                    flow.series([
                        function (callback) {
                            var cmdStr10 = "redis-cli SLAVEOF no one";
                            exec(cmdStr10, function (err, stdout, stderr) {
                                if (err) {
                                    console.log('关闭数据上载出错:' + stderr);
                                }
                                else {
                                    console.log("数据上载完成："+stdout);
                                }
                                callback();
                            });
                        },
                        function (callback) {
                            var cmdStr11 = "redis-cli -p 6380 SLAVEOF 127.0.0.1 6379";
                            exec(cmdStr11, function (err, stdout, stderr) {
                                if (err) {
                                    console.log('恢复主从复制出错:' + stderr);
                                }
                                else {
                                    console.log("恢复主从复制："+stdout);
                                }
                                callback();
                            });
                        }
                    ]);
                }
            },10000);
        }
    ]);
});

//}
//×××××××××××××××××××××××××热配置模块××××××××××××××××××××××××××××××××××××××××
//var changeConfig = true;
//if(changeConfig) {
eventEmitter.on('redisinterrupt',function () {
    //热配置超时时间
    var cmdStr5 = "redis-cli config get repl-timeout";
//日志监控模块
    exec(cmdStr5, function (err, stdout, stderr) {
        if (err) {
            console.log('config get error:' + stderr);
        }
        else {
            console.log(stdout);
            console.log(stdout.toString().split('\n'));
            var res = stdout.toString().split('\n');
            var replTimeout = res[1];
            console.log(replTimeout);
            if(replTimeout < 60) {
                replTimeout = 60;
                var cmdStr6 = "redis-cli config set repl-timeout " + replTimeout;
                exec(cmdStr6,function (err, stdout, stderr) {
                    if (err) {
                        console.log('config set error:' + stderr);
                    }
                    else {
                        console.log(stdout+'repl-timeout已经被设置为' + replTimeout);
                    }
                });
            }
            else {
                replTimeout = replTimeout * 2;
                var cmdStr7 = "redis-cli config set repl-timeout " + replTimeout;
                exec(cmdStr7,function (err, stdout, stderr) {
                    if (err) {
                        console.log('config set error:' + stderr);
                    }
                    else {
                        console.log(stdout+'repl-timeout已经被设置为' + replTimeout);
                    }
                });
            }
        }
    });
});

