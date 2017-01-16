//加载依赖库
var express = require('express');
var exec = require('child_process').exec;
var flow = require('nimble');
var fs = require('fs');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var path = require('path');

//创建express实例
var app = express();

//设置静态文件路径
app.use(express.static(path.join(__dirname,'/static')));
app.use(function (req,res) {
    res.sendFile(path.join(__dirname,'./static/index.html'))
});

var messages = [];
messages.push('redis改进工具正在运行!');
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

    //eventEmitter.emit('addMessage','111');


    eventEmitter.on('addMessage',function (message) {
        messages.push(message);
        io.sockets.emit('newMessage',message);
    });
    // setTimeout(function () {
    //     eventEmitter.emit('addMessage','222');
    //     console.log('222');
    // },100);
    // setTimeout(function () {
    //     eventEmitter.emit('addMessage','333');
    //     console.log('333');
    // },5000);
    // setTimeout(function () {
    //     eventEmitter.emit('addMessage','333');
    //     console.log('333');
    // },10000);
});




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
                    setTimeout(function () {
                        eventEmitter.emit('addMessage','config get error0:' + stderr);
                    },2000);
                    console.log('config get error0:' + stderr);
                }
                else {
                    snapshotting = (stdout.toString().charAt(5) != '\n');
                    console.log(stdout.trim());
                    setTimeout(function () {
                        eventEmitter.emit('addMessage',stdout.trim());
                    },2000);
                    console.log('the snapshotting is open:' + snapshotting);
                    setTimeout(function () {
                        eventEmitter.emit('addMessage','the snapshotting is open:' + snapshotting);
                    },2000);
                }
                callback();
            });
        },
        function (callback) {
            exec(cmdStr2, function (err, stdout, stderr) {
                if (err) {
                    setTimeout(function () {
                        eventEmitter.emit('addMessage','config get error2:' + stderr);
                    },2000);
                    console.log('config get error2:'+stderr);
                }
                else {
                    aof = (stdout.toString().substring(11, 13) != "no")
                    console.log(stdout.trim());
                    setTimeout(function () {
                        eventEmitter.emit('addMessage',stdout.trim());
                    },2000);
                    console.log('the aof is open:' + aof);
                    setTimeout(function () {
                        eventEmitter.emit('addMessage','the aof is open:' + aof);
                    },2000);
                }
                callback();
            });
        },
        function (callback) {
            if (snapshotting == false && aof == false) {
                persistence = false;
                setTimeout(function () {
                    eventEmitter.emit('addMessage','persistence is open:' + persistence);
                },2000);
                console.log("persistence is open:" + persistence);
                eventEmitter.emit('persistnotopen');//如果持久化未打开，发射'persistnotopen'事件
                callback();
            }
            else {
                persistence = true;
                setTimeout(function () {
                    eventEmitter.emit('addMessage','persistence is open:' + persistence);
                },2000);
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
    setTimeout(function () {
        eventEmitter.emit('addMessage','持久化未开启，需要监控是否断电重启');
    },2000);
    //*****************关闭主从复制************************
    fs.watchFile(fileName,function(curr, prev){
        if(curr.mtime>prev.mtime){
            console.log('close:curr.mtime > prev.mtime');
            setTimeout(function () {
                eventEmitter.emit('addMessage','close:curr.mtime > prev.mtime');
            },2000);
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
                        setTimeout(function () {
                            eventEmitter.emit('addMessage','发射close事件'+myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds());
                        },2000);
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
            setTimeout(function () {
                eventEmitter.emit('addMessage','persistence:curr.mtime > prev.mtime');
            },2000);
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
                            setTimeout(function () {
                                eventEmitter.emit('addMessage','发射opendatapro事件'+myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds());
                            },2000);
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
     setTimeout(function () {
         eventEmitter.emit('addMessage','interrupt:the current mtime is: ' + curr.mtime);
     },2000);
     setTimeout(function () {
         eventEmitter.emit('addMessage','interrupt:the previous mtime was: ' + prev.mtime);
     },2000);
        if(curr.mtime>prev.mtime){
            //文件内容有变化，那么通知相应的进程可以执行相关操作。例如读物文件写入数据库等
            //continueReadData();
            console.log('interrupt:curr.mtime > prev.mtime');
            setTimeout(function () {
                eventEmitter.emit('addMessage','interrupt:the previous mtime was: ' + prev.mtime);
            },2000);
            var cmdStr3 = "grep -n 'Disconnecting timeout slave' /home/chenjing/redis-master/cjlog";
            //日志监控模块,监控是否复制中断
            exec(cmdStr3, function (err, stdout, stderr) {
                if (err) {
                    console.log('config get error3' + stderr);
                    setTimeout(function () {
                        eventEmitter.emit('addMessage','config get error3' + stderr);
                    },2000);
                }
                else {
                    console.log(stdout);
                    setTimeout(function () {
                        eventEmitter.emit('addMessage',stdout);
                    },2000);
                    var lostId = stdout.toString().match(/\d*:\d*:M/g);
                    console.log("lostId:"+lostId[lostId.length - 1]);
                    setTimeout(function () {
                        eventEmitter.emit('addMessage',"lostId:"+lostId[lostId.length - 1]);
                    },2000);
                    console.log("lostNum="+lostNum);
                    setTimeout(function () {
                        eventEmitter.emit('addMessage',"lostNum="+lostNum);
                    },2000);
                    if(lostId[lostId.length - 1]!= lostNum) {
                        var lostNumsave = lostNum;
                        lostNum = lostId[lostId.length - 1];
                        console.log("lostNum变成了："+lostNum);
                        console.log("lostNumsave="+lostNumsave);
                        setTimeout(function () {
                            eventEmitter.emit('addMessage',"lostNum变成了："+lostNum);
                        },2000);
                        setTimeout(function () {
                            eventEmitter.emit('addMessage',"lostNumsave="+lostNumsave);
                        },2000);
                        if((lostNumsave != 0)&&(lostId[lostId.length - 1] != lostNumsave)) {
                            eventEmitter.emit('redisinterrupt');
                            console.log("主从复制中断,编号："+lostNum);
                            setTimeout(function () {
                                eventEmitter.emit('addMessage',"主从复制中断,编号："+lostNum);
                            },2000);
                        }

                    }
                }
            });

        }else{
            console.log('curr.mtime <= prev.mtime');
        }
    });


console.log(fileName+ ' 被监听中...');
setTimeout(function () {
    eventEmitter.emit('addMessage',fileName+ ' 被监听中...');
},2000);

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
            setTimeout(function () {
                eventEmitter.emit('addMessage','停掉主从复制出错:' + stderr);
            },2000);
        }
        else {
            console.log("停掉主从复制成功："+stdout);
            setTimeout(function () {
                eventEmitter.emit('addMessage',"停掉主从复制成功："+stdout);
            },2000);
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
                    setTimeout(function () {
                        eventEmitter.emit('addMessage','停掉主从复制出错:' + stderr);
                    },2000);
                }
                else {
                    console.log("停掉主从复制成功："+stdout);
                    setTimeout(function () {
                        eventEmitter.emit('addMessage',"停掉主从复制成功："+stdout);
                    },2000);
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
                    setTimeout(function () {
                        eventEmitter.emit('addMessage',"停掉主从复制成功："+stdout);
                    },2000);
                }
                else {
                    console.log("开始数据上载："+stdout);
                    setTimeout(function () {
                        eventEmitter.emit('addMessage',"开始数据上载："+stdout);
                    },2000);
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
                                    setTimeout(function () {
                                        eventEmitter.emit('addMessage','关闭数据上载出错:' + stderr);
                                    },2000);
                                }
                                else {
                                    console.log("数据上载完成："+stdout);
                                    setTimeout(function () {
                                        eventEmitter.emit('addMessage',"数据上载完成："+stdout);
                                    },2000);
                                }
                                callback();
                            });
                        },
                        function (callback) {
                            var cmdStr11 = "redis-cli -p 6380 SLAVEOF 127.0.0.1 6379";
                            exec(cmdStr11, function (err, stdout, stderr) {
                                if (err) {
                                    console.log('恢复主从复制出错:' + stderr);
                                    setTimeout(function () {
                                        eventEmitter.emit('addMessage','恢复主从复制出错:' + stderr);
                                    },2000);
                                }
                                else {
                                    console.log("恢复主从复制："+stdout);
                                    setTimeout(function () {
                                        eventEmitter.emit('addMessage',"恢复主从复制："+stdout);
                                    },2000);
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
            console.log('config get error5:' + stderr);
            setTimeout(function () {
                eventEmitter.emit('addMessage','config get error5:' + stderr);
            },2000);
        }
        else {
            console.log(stdout);
            console.log(stdout.toString().split('\n'));
            setTimeout(function () {
                eventEmitter.emit('addMessage',stdout);
            },2000);
            setTimeout(function () {
                eventEmitter.emit('addMessage',stdout.toString().split('\n'));
            },2000);
            var res = stdout.toString().split('\n');
            var replTimeout = res[1];
            console.log(replTimeout);
            setTimeout(function () {
                eventEmitter.emit('addMessage',replTimeout);
            },2000);
            if(replTimeout < 60) {
                replTimeout = 60;
                var cmdStr6 = "redis-cli config set repl-timeout " + replTimeout;
                exec(cmdStr6,function (err, stdout, stderr) {
                    if (err) {
                        console.log('config set error:' + stderr);
                        setTimeout(function () {
                            eventEmitter.emit('addMessage','config set error:' + stderr);
                        },2000);

                    }
                    else {
                        console.log(stdout+'repl-timeout已经被设置为' + replTimeout);
                        setTimeout(function () {
                            eventEmitter.emit('addMessage','repl-timeout已经被设置为' + replTimeout);
                        },2000);
                    }
                });
            }
            else {
                replTimeout = replTimeout * 2;
                var cmdStr7 = "redis-cli config set repl-timeout " + replTimeout;
                exec(cmdStr7,function (err, stdout, stderr) {
                    if (err) {
                        console.log('config set error:' + stderr);
                        setTimeout(function () {
                            eventEmitter.emit('addMessage','config set error:' + stderr);
                        },2000);
                    }
                    else {
                        console.log(stdout+'repl-timeout已经被设置为' + replTimeout);
                        setTimeout(function () {
                            eventEmitter.emit('addMessage','repl-timeout已经被设置为' + replTimeout);
                        },2000);
                    }
                });
            }
        }
    });
});

