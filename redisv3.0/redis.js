//加载依赖库
var express = require('express');
var exec = require('child_process').exec;
var flow = require('nimble');

var cmdStr3 = 'redis-cli config get save';
//日志监控模块

exec(cmdStr3, function (err, stdout, stderr) {

});





//持久化检查模块
var persistence_button = false;
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
//数据保障模块



//创建express实例
var app = express();
app.get('/',function(req,res) {

});


app.listen(3000,function (req,res) {
    console.log('app is running at 3000');
});