var express = require('express');
var FormData = require('form-data');
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var readline = require('readline');
var fs = require('fs');
var os = require('os');


var fReadName = './answer.txt';
var fWriteName = './answer1.txt';
var fRead = fs.createReadStream(fReadName);
var fWrite = fs.createWriteStream(fWriteName);


var objReadline = readline.createInterface({
    input: fRead,
    // 这是另一种复制方式，这样on('line')里就不必再调用fWrite.write(line)，当只是纯粹复制文件时推荐使用
    // 但文件末尾会多算一次index计数   sodino.com
    //  output: fWrite, 
    //  terminal: true
});

var questions = {}
var reg1 = /(\(|\（)(\w+|√|×)(\)|\）)?/g
var reg2 = /\w+$/
var reg3 = /\(\)|\（\）/g
reg1.compile(reg1)
reg2.compile(reg2)
reg3.compile(reg3)
var line = '',
    num = 0
objReadline.on('line', (l) => {
    let a
    var first = l.slice(0, 1)
    if (first != 0 && !isNaN(first)) {
        l = l.replace(/\s+/g, '')
        let left = l.indexOf('、')
        num = l.slice(0, left)
        line = l.slice(left + 1)
    } else if (first == '答') {
        a = l.slice(3)
        questions[line] = a
        var tmp = num + '.' + line + ':' + a;
        fWrite.write(tmp + os.EOL); // 下一行
    }
});

objReadline.on('close', () => {
    console.log('readline close...');
});



function query(i, l) {
    let line = l
    return new Promise(resolve => {
        let left = line.indexOf('：')
        line = line.slice(left + 1)
        let right = line.lastIndexOf('①')
        if (right > 0) {
            line = line.slice(0, right)
        }
        let a = questions[line]
        console.log(Number(i) + 1 + '.' + a)
        if (!a) {
            console.log(Number(i) + 1 + '.' + line)
        }
        resolve(a);
    });
}

async function getData(array) {
    let aa = []
    for (const i in array) {
        let b = await query(i, array[i])
        aa.push(b)
    }
    return aa
}

app.post('/', function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST");
    let array = JSON.parse(req.body.text)
    getData(array).then(a => {
        res.json(a);
    })
});

var server = app.listen(8083, function() {
    var host = server.address().address; //地址
    var port = server.address().port; //端口
    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});