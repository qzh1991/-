/**
 * Created by 12 on 2017/7/4.
 */
const fs = require('fs')
const path = require('path')
const http = require('http')
const querystring = require('querystring')
const cheerio = require('cheerio')
const mysql = require('mysql')
const eventproxy = require('eventproxy')
const express = require('express')
const app = express()
const superagent = require('superagent')
require('superagent-charset')(superagent)
const async = require('async');
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'okok',
  database: 'lxyz',
  port: 3306
})

let num = 1  //第几本书开始，失败后根据提示更改此处即可

let url = 'http://ks.xzdj.cn:90/monikaoshi.aspx'  //url地址
let table = num  //表名
let total = 0 //总章节数
let id = 0 //计数器
const chapters = 10 //爬取多少章

function trim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, '').replace(/&nbsp;/g, '')
}

function query(lineTxt) {
  return new Promise(resolve => {
    pool.query("select answer from question where question like ?", ['%' + lineTxt + '%'], function (err, r,lineTxt) {
      if (err) throw err
      resolve(r);
    })
  });
}

async function fetchUrl(res){
  let results=[]
  //res.text为获取的网页内容，通过cheerio的load方法处理后，之后就是jQuery的语法了
  const $ = cheerio.load(res.text);
  const main = $('div.main')
  const questions = main.find('td[class="hs11"][valign="top"]')
  console.log(`共${questions.length}题`)
  const options = main.find('.lanse11')
  console.log(`共${options.length}选项`)
  for (let i = 0; i < questions.length; i++) {
    const v = questions[i];
    let lineTxt = $(v).text().trim()
    const r = await query(lineTxt)
    const an = r.length?r[0].answer:""
    console.log(i+1+":"+an+":"+lineTxt)
    results[i]=an
  }
}
async function fetchHtml(html){
  let results=[]
  //res.text为获取的网页内容，通过cheerio的load方法处理后，之后就是jQuery的语法了
  const $ = cheerio.load(html);
  const main = $('div.main')
  const questions = main.find('td[class="hs11"][valign="top"]')
  console.log(`共${questions.length}题`)
  const options = main.find('.lanse11')
  console.log(`共${options.length}选项`)
  for (let i = 0; i < questions.length; i++) {
    const v = questions[i];
    let lineTxt = $(v).text().trim()
    lineTxt=lineTxt.replace(/\s+/g, '')
     
    const r = await query(lineTxt)
    const an = r.length?r[0].answer:""
    results[i]=an
  }
  let textAll="["
  let text=""
  results.forEach((v,i)=>{
    text="'"+v+"',"
    textAll+=text
  })
  textAll=textAll.slice(0,textAll.length-1)+"]"
  let out = "\nvar ans="+textAll+";var qs = $('.lanse11');for(let i = 0;i < qs.length;i++){const q = qs[i];const os = $(q).find('input');const ots = $(q).find('label');for(let j = 0;j < ots.length;j++){const v=$(ots[j]).text();if((ans[i]).indexOf(v.slice(0,1))>= 0 ||(ans[i]).indexOf(v.slice(v.length-1,v.length))>= 0){$(os[j]).attr('checked','true');$(os[j])[0].checked=true}}};\n"
  console.log(out)

  // fs模块写文件    
  var filePath = path.normalize('d://DoExam/do.js');
  fs.writeFileSync(filePath, out);

  // textAll=""
  // text=""
  // results.forEach((v,i)=>{
  //   if(v=='') v=" "
  //   text+=v+','
  //   if((i+1)%5==0){
  //     console.log(text)
  //     if(i<80)
  //       textAll+=text
  //     text=""
  //   }
  // })

  var option = {
    'method':'get',
    'hostname':"tts.baidu.com",
    'path':'/text2audio?lan=zh&ie=UTF-8&spd=3&text='+ textAll
  }
  var req = http.request(option,function(res){
    var chunks=[];
     res.on('data',function(chunk){
         chunks.push(chunk);
     });
     res.on('end',function(){
          var mybuffer=Buffer.concat(chunks);
    var filePath = path.normalize('d://voice.mp3');
    // fs模块写文件    
    fs.writeFileSync(filePath, mybuffer);
     })
  })
  req.end();
}
function main() {
  const html = fs.readFileSync("d://徐州市“两学一做”学习教育考学平台.html","utf-8");
  fetchHtml(html)
}
main()

