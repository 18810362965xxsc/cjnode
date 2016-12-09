//加载依赖库
var express = require('express');
var exec = require('child_process').exec;
var cmdStr = 'redis-cli config get save';
var cmdStr2 = 'redis-cli config get appendonly';
var data = '';
exec(cmdStr,function(err,stdout,stderr) {
    if(err) {
        console.log('config get error:'+stderr);
    }
    else {
        var aa = (stdout.toString().charAt(5) == '\n');
        console.log(stdout.trim());
        console.log('the rdb is not open:' + aa);
    }
});

exec(cmdStr2,function(err,stdout,stderr) {
    if(err) {
        console.log('config get error:'+stderr);
    }
    else {
        var bb = (stdout.toString().substring(11,13) == "no")
        console.log(stdout.trim());
        console.log('the aof is not open:' + bb);
    }
});

//创建express实例
var app = express();
app.get('/',function(req,res) {

});


app.listen(3000,function (req,res) {
    console.log('app is running at 3000');
});