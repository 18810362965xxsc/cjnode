//加载依赖库
var express = require('express');
var exec = require('child_process').exec;
var changeConfig = true;
if(changeConfig) {
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
}

//创建express实例
var app = express();
app.get('/',function(req,res) {

});


app.listen(3000,function (req,res) {
    console.log('app is running at 3000');
});