//加载依赖库
var express = require('express');
var flow = require('nimble');
var exec = require('child_process').exec;
var dataProtected = true;
var success = true;
if(dataProtected) {
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
}

//创建express实例
var app = express();
app.get('/',function(req,res) {

});


app.listen(3000,function (req,res) {
    console.log('app is running at 3000');
});