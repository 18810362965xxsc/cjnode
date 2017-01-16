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

//var persistence_button = true;//默认要检查，可以选择在前端页面中设置成关闭

var messages = [];
var baozhangs = [];
var snaps = [];
var aofs = [];
var persists = [];
var xhreasons = [];
var statusxgs = [];

messages.push('redis改进工具正在运行!');
messages.push('循环拦截模块正在运行!');
baozhangs.push('redis改进工具正在运行!');
baozhangs.push('数据保障模块正在运行!');
xhreasons.push('尚未循环中断');
statusxgs.push('尚未循环中断');
var server = app.listen(3000,function() {
    console.log('app is running at port 3000 !');
    messages.push('app is running at port 3000 !');
    baozhangs.push('app is running at port 3000 !');
});

var io = require('socket.io').listen(server);
io.sockets.on('connection',function (socket) {
    socket.emit('connected');
    console.log('connected');
    socket.broadcast.emit('newClient',new Date());

    socket.on('addpersistence_button',function (persistence_button) {
        snaps.push(snap);
        io.sockets.emit('newsnap',snap);
    });

    socket.on('allsnaps',function(snaps) {
        console.log('allsnaps->snaps:', snaps);
        Snaps = snaps;
        $scope.$apply(function () {
            $scope.snaps = Snaps;
        });
    });

        socket.on('getAllMessages', function () {
            socket.emit('allMessages', messages);
        });
        socket.on('getAllbaozhangs', function () {
            socket.emit('allbaozhangs', baozhangs);
        });
        socket.on('getAllpers', function () {
            socket.emit('allpers', pers);
        });
        socket.on('getAllsnaps', function () {
            socket.emit('allsnaps', snaps);
        });
        socket.on('getAllaofs', function () {
            socket.emit('allaofs', aofs);
        });
        socket.on('getAllpersists', function () {
            socket.emit('allpersists', persists);
        });
        socket.on('getAllxhreasons', function () {
            socket.emit('allxhreasons', xhreasons);
        });
        socket.on('getAllstatusxgs', function () {
            socket.emit('allstatusxgs', statusxgs);
        });

    //eventEmitter.emit('addMessage','111');


    eventEmitter.on('addMessage',function (message) {
        messages.unshift(message);
        io.sockets.emit('newMessage',message);
    });
    eventEmitter.on('addbaozhang',function (baozhang) {
        baozhangs.unshift(baozhang);
        io.sockets.emit('newbaozhang',baozhang);
    });
    eventEmitter.on('addsnap',function (snap) {
        snaps.push(snap);
        io.sockets.emit('newsnap',snap);
    });
    eventEmitter.on('addaof',function (aof) {
        aofs.push(aof);
        io.sockets.emit('newaof',aof);
    });
    eventEmitter.on('addpersist',function (persist) {
        persists.push(persist);
        io.sockets.emit('newpersist',persist);
    });
    eventEmitter.on('addxhreason',function (xhreason) {
        xhreasons.push(xhreason);
        io.sockets.emit('newxhreason',xhreason);
    });
    eventEmitter.on('addstatusxg',function (statusxg) {
        statusxgs.push(statusxg);
        io.sockets.emit('newstatusxg',statusxg);
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
    var pers = [];
    pers.push('开启');
    //console.log('per');
    var cmdStr = 'redis-cli config get save';
    var cmdStr2 = 'redis-cli config get appendonly';
    var snapshotting = true;
    var aof = true;
    var persistence = true;
    var flag = true;
    flow.series([
        function (callback) {
            exec(cmdStr, function (err, stdout, stderr) {
                if (err) {
                    setTimeout(function () {
                        eventEmitter.emit('addbaozhang','config get error0:' + stderr);
                    },2000);
                    console.log('config get error0:' + stderr);
                    // var snaps = [];
                    // snaps.push('redis未开启');
                    setTimeout(function () {
                        eventEmitter.emit('addsnap','redis未开启');
                    },2000);
                    //console.log('snap')
                    flag = false;
                    setTimeout(function () {
                        eventEmitter.emit('addpersist','redis未开启');
                    },2000);
                }
                else {
                    snapshotting = (stdout.toString().charAt(5) != '\n');
                    console.log(stdout.trim());
                    setTimeout(function () {
                        eventEmitter.emit('addbaozhang',stdout.trim());
                    },2000);
                    console.log('the snapshotting is open:' + snapshotting);
                    if(snapshotting){
                        setTimeout(function () {
                            eventEmitter.emit('addsnap','开启');
                        },2000);
                    }
                    else {
                        setTimeout(function () {
                            eventEmitter.emit('addsnap','关闭');
                        },2000);
                    }

                    setTimeout(function () {
                        eventEmitter.emit('addbaozhang','the snapshotting is open:' + snapshotting);
                    },2000);
                }
                callback();
            });
        },
        function (callback) {
            exec(cmdStr2, function (err, stdout, stderr) {
                if (err) {
                    setTimeout(function () {
                        eventEmitter.emit('addbaozhang','config get error2:' + stderr);
                    },2000);
                    console.log('config get error2:'+stderr);
                    setTimeout(function () {
                        eventEmitter.emit('addaof','redis未开启');
                    },2000);
                }
                else {
                    aof = (stdout.toString().substring(11, 13) != "no");
                    console.log(stdout.trim());
                    setTimeout(function () {
                        eventEmitter.emit('addbaozhang',stdout.trim());
                    },2000);
                    console.log('the aof is open:' + aof);
                    if(aof){
                        setTimeout(function () {
                            eventEmitter.emit('addaof','开启');
                        },2000);
                    }
                    else {
                        setTimeout(function () {
                            eventEmitter.emit('addaof','关闭');
                        },2000);
                    }
                    setTimeout(function () {
                        eventEmitter.emit('addbaozhang','the aof is open:' + aof);
                    },2000);
                }
                callback();
            });
        },
        function (callback) {
            if (snapshotting == false && aof == false) {
                persistence = false;
                setTimeout(function () {
                    eventEmitter.emit('addbaozhang','persistence is open:' + persistence);
                },2000);
                setTimeout(function () {
                    eventEmitter.emit('addpersist','关闭');
                },2000);

                console.log("persistence is open:" + persistence);
                eventEmitter.emit('persistnotopen');//如果持久化未打开，发射'persistnotopen'事件
                callback();
            }
            else {
                persistence = true;
                if (flag) {
                    setTimeout(function () {
                        eventEmitter.emit('addbaozhang','persistence is open:' + persistence);
                    },2000);
                    setTimeout(function () {
                        eventEmitter.emit('addpersist','开启');
                    },2000);
                    console.log("persistence is open:" + persistence);
                }
                callback();
            }
        }
    ]);
}
else {
    var pers = [];
    pers.push('关闭');

    setTimeout(function () {
        eventEmitter.emit('addsnap','持久化检查未开启');
    },2000);

    setTimeout(function () {
        eventEmitter.emit('addaof','持久化检查未开启');
    },2000);

    setTimeout(function () {
        eventEmitter.emit('addpersist','持久化检查未开启');
    },2000);
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
        eventEmitter.emit('addbaozhang','持久化未开启，需要监控是否断电重启');
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
                            eventEmitter.emit('addbaozhang','发射close事件'+myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds());
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
                eventEmitter.emit('addbaozhang','persistence:curr.mtime > prev.mtime');
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
                                eventEmitter.emit('addbaozhang','发射opendatapro事件'+myDate.getHours()+':'+myDate.getMinutes()+':'+myDate.getSeconds());
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
var logwatch_button = true;
if(logwatch_button) {
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
                        eventEmitter.emit('addxhreason','Disconnecting timeout');
                    },2000);
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
}



console.log(fileName+ ' 被监听中...');
setTimeout(function () {
    eventEmitter.emit('addMessage',fileName+ ' 被监听中...');
},2000);
setTimeout(function () {
    eventEmitter.emit('addbaozhang',fileName+ ' 被监听中...');
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
                eventEmitter.emit('addbaozhang','停掉主从复制出错:' + stderr);
            },2000);
        }
        else {
            console.log("停掉主从复制成功："+stdout);
            setTimeout(function () {
                eventEmitter.emit('addbaozhang',"停掉主从复制成功："+stdout);
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
                        eventEmitter.emit('addbaozhang','停掉主从复制出错:' + stderr);
                    },2000);
                }
                else {
                    console.log("停掉主从复制成功："+stdout);
                    setTimeout(function () {
                        eventEmitter.emit('addbaozhang',"停掉主从复制成功："+stdout);
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
                        eventEmitter.emit('addbaozhang',"停掉主从复制成功："+stdout);
                    },2000);
                }
                else {
                    console.log("开始数据上载："+stdout);
                    setTimeout(function () {
                        eventEmitter.emit('addbaozhang',"开始数据上载："+stdout);
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
                                        eventEmitter.emit('addbaozhang','关闭数据上载出错:' + stderr);
                                    },2000);
                                }
                                else {
                                    console.log("数据上载完成："+stdout);
                                    setTimeout(function () {
                                        eventEmitter.emit('addbaozhang',"数据上载完成："+stdout);
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
                                        eventEmitter.emit('addbaozhang','恢复主从复制出错:' + stderr);
                                    },2000);
                                }
                                else {
                                    console.log("恢复主从复制："+stdout);
                                    setTimeout(function () {
                                        eventEmitter.emit('addbaozhang',"恢复主从复制："+stdout);
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
                        setTimeout(function () {
                            eventEmitter.emit('addstatusxg','repl-timeout已经被设置为' + replTimeout);
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
                        setTimeout(function () {
                            eventEmitter.emit('addstatusxg','repl-timeout已经被设置为' + replTimeout);
                        },2000);
                    }
                });
            }
        }
    });
});

