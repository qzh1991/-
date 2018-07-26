var express = require('express');
var FormData = require('form-data');
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const mysql = require('mysql')
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'okok',
    database: 'lxyz',
    port: 3306
})


function query(lineTxt) {
    return new Promise(resolve => {
        pool.query("select answer from question where question like ?", ['%' + lineTxt + '%'], function (err, r) {
            if (err) throw err
            resolve(r.length?r[0].answer:'');
        })
    });
}
async function getData(array) {
    let aa = []
    for (const a of array) {
        let b = await query(a)
        aa.push(b)
    }
    return aa
}
app.post('/', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST");
    let array = JSON.parse(req.body.text)
    getData(array).then(a => {
        res.json(a);
    })
});

var server = app.listen(8081, function () {
    var host = server.address().address;  //地址
    var port = server.address().port;  //端口
    console.log("应用实例，访问地址为 http://%s:%s", host, port);
});