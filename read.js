const mysql = require('mysql')
const pool = mysql.createPool({
    host: '193.112.163.17',
    user: 'root',
    password: 'okok',
    database: 'Exam',
    port: 3306
})

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

var questions = []
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
        a = l.slice(3).replace(/\s+/g, '')
        let q={}
        q.question=line
        q.answer = a
        questions.push(q)
        var tmp = num + '.' + line + ':' + a;
        fWrite.write(tmp + os.EOL); // 下一行
    }
});

objReadline.on('close', () => {
    console.log('答案采集完成');
    pool.query("DROP TABLE `XinShiDaiXiJinPing`;", function (err, r) {
        if (err) throw err
        console.log('删除表完成');
        pool.query("CREATE TABLE `Exam`.`XinShiDaiXiJinPing` (`id` INT NOT NULL AUTO_INCREMENT,`question` NVARCHAR(200) NULL,`answer` NVARCHAR(200) NULL,PRIMARY KEY (`id`));", function (err, r) {
            if (err) throw err
            console.log('重建表完成');
            questions.forEach(q => {
                pool.query("INSERT `Exam`.`XinShiDaiXiJinPing`(`question`,`answer`) VALUES(?,?);",[q.question,q.answer] , function (err, r) {
                    if (err) throw err
                })
            });
            console.log('答案上传完成');
        })
    })
});