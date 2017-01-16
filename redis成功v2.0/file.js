//加载依赖库
var express = require('express');

var fs = require('fs');// 引入fs 模块
var fileName = '/home/chenjing/redis-master/cjlog';
var exec = require('child_process').exec;
var lostNum = 0;
fs.watchFile(fileName,function(curr, prev){
    console.log('the current mtime is: ' + curr.mtime);
    console.log('the previous mtime was: ' + prev.mtime);
    if(curr.mtime>prev.mtime){
        //文件内容有变化，那么通知相应的进程可以执行相关操作。例如读物文件写入数据库等
        //continueReadData();
        console.log('curr.mtime > prev.mtime');
        var cmdStr3 = 'grep -n lost /home/chenjing/redis-master/cjlog';
//日志监控模块
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
                    }

                }
                // else {
                //     console.log("1111111111111111");
                // }
            }
        });

    }else{
        console.log('curr.mtime <= prev.mtime');
    }
});

console.log(fileName+ ' 被监听中...');


//创建express实例
var app = express();
app.get('/',function(req,res) {

});


app.listen(3000,function (req,res) {
    console.log('app is running at 3000');
});