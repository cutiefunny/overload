//#region 초반 선언부
const express = require('express');
const requests = require('request');
const port = 8001;
const session = require('express-session')
const fs = require('fs');
const http = require('https'); 
const Insta = require('scraper-instagram');
const InstaClient = new Insta();
const download = require('image-downloader');
const path = require('path');
const moment = require('moment');
const bodyparser= require('body-parser');
const app = express();
const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

app.use(express.static(__dirname + '/public/'))
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
//app.set('view engine', 'ejs');
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.set('trust proxy', 1) // trust first proxy
//app.engine('html', require('ejs').renderFile);

app.use('/script',express.static(__dirname + "/script"));
app.use('/views',express.static(__dirname + "/views"));
app.use('/images',express.static(__dirname + "/images"));
app.use('/apk',express.static(__dirname + "/apk"));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

var sessionID="";
var sessionRival="";

const { MongoClient } = require("mongodb");
const { response, request } = require('express');
const { createConnection } = require('net');
//#endregion

//#region DB연결 및 라우팅
const uri =
  "mongodb+srv://cutiefunny:ghks1015@macrodb.srkli.mongodb.net/macroDB?retryWrites=true&w=majority";
const client = new MongoClient(uri);
client.connect();

//리스닝
app.listen(port, ()=>{
    console.log('8001번 포트에 대기중!');
  //   InstaClient.authBySessionId("31938056985%3AKmomW1cOOM9aQ2%3A26")
	// .then(account => console.log(account.username));
  // insertWooTicket();
  // insertWooh();
  // insertTicketNo1();
})
console.log("server started");

// cron.schedule('* * * * * ', () => {
//   console.log("cron task run at "+moment().format("YYYYMMDDHHmmSS"));
//   insertWooTicket();
// },{
//   scheduled: true,
//   timezone: "Asia/Seoul"
// });

//빅나인 샘플 페이지
app.get('/big9', function (req, res) {

    res.render('big9', { title: '빅나인고고클럽'
                        , userList : ''
                    });
});

//인스타 테스터
app.get('/insta', function (req, res) {

  var filenames = [];
  var cnt=0;

  InstaClient.getProfile("inmaview")
    .then(profile => {
      profile.lastPosts.forEach(post => {
        console.log(post.thumbnail);

        var option = {
          url :  post.thumbnail,
          dest : __dirname +'/images/temp/'
        }

        download.image(option).then(({filename}) => {
          console.log('saved to ', filename);
          filenames[cnt++]="/images/temp/"+filename.split('\\')[6];
        }).then((filename)=>{
                  if(cnt==profile.lastPosts.length) {
                      console.log("filenames = "+filenames);
                      res.render('insta', { title: 'insta tester'
                                        , filenames : filenames
                                        , sessionID : sessionID
                                    });  
                  }
            });
          }
        )
        // .catch((err) => console.error(err))
      });

    //   console.log("filenames = "+filenames);
    //   res.render('insta', { title: 'insta tester'
    //                     , filenames : filenames
    //                     , sessionID : sessionID
    //                 });  
    // });
});

//매크로 매니저
app.get('/macroManager', function (req, res) {

  searchMacroDBData("getUserList","userList").then((msg) => {
    console.log(msg);
    res.render('macroManager', { title: 'macro manager'
                        , userList : msg
                    });
    })    
});

//우현 상품권
app.get('/wooh', function (req, res) {
  axios.get('https://wooh.co.kr/').then(data=>{
  const $ = cheerio.load(data.data);
  //section.idx_hit>div>table>tbody
  //div.sct_txt
  // var items = [];
  // $('div.sct_txt').each((index, item) => { items.push(item.text) });
  //   console.log(items);
  // })
  var text = $('div.tbl_head05>table>tbody').text().replace(" ","").split('\n');
  var cnt = 1;
  var name = [];
   text.forEach(item => {
     if(item.trim()!="") {
       if(cnt==1) name.push(item.trim());
       cnt++;
       if(cnt>3) cnt=1;
     }
   });
  //insertWooh();

  searchWooh("main").then((data) => {
    //console.log(data);
    res.render('wooh', { title: '상품권 가격'
                        , name : name
                        , data : data
                    });
    })
  });
});

//명동 상품권
app.get('/ticketno1', function (req, res) {
  axios.get('http://ticketno1.co.kr/popup/popup_2.html?idx=2&type=W&__popupPage=T').then(data=>{
  const $ = cheerio.load(data.data);
  
  var cnt=0;
  var list = [];
  var temp;
  $("td").each(function(key,val){
    //console.log($("td"));
    temp = $(val).text().replace(' ','');
    if(temp.trim() !="" && !temp.includes('*')) {
      if( temp.includes('%') ) temp = temp.split('(')[0];
      list.push(temp);
      cnt++;
    }
    
    if(cnt<6 || temp.includes('투어') || temp=='60,000') list.pop();
    
    //console.log(cnt + " : " + $(val).text());
  });
  //console.log(list);

  var name = [];
  var buy = [];
  var sell = [];
  cnt=1;
   list.forEach(item => {
       if(cnt==1) name.push(item.trim());
       cnt++;
       if(cnt>3) cnt=1;
   });

   searchWooh("ticketno1").then((data) => {
    //console.log(data);
    res.render('wooh', { title: '상품권 가격'
                        , name : name
                        , data : data
                    });
    })

  });
});

//우천 상품권
app.get('/wooticket', function (req, res) {

  var requestOptions = { method: "GET" 
    ,uri: "http://www.wooticket.com/popup_price.php" 
    ,encoding: null 
    };
// request 모듈을 이용하여 html 요청 
  requests(requestOptions, function(error, response, body) { // 전달받은 결과를 EUC-KR로 디코딩하여 출력한다. 
    var strContents = new Buffer(body); 
    var data = iconv.decode(strContents, 'EUC-KR').toString(); 

    const $ = cheerio.load(data);

      var cnt=0;
      var list = [];
      var temp;
      $("font").each(function(key,val){
        //console.log($("td"));
        temp = $(val).text().replace(' ','');
        if(temp.trim() !="") {
          if( temp.includes('%') ) temp = temp.split('(')[0];
          if(cnt>8 && cnt<279) list.push(temp);
          cnt++;
        }
        //console.log(cnt + " : " + $(val).text());
      });
      //console.log(list);
  

  var name = [];
  cnt=1;
   list.forEach(item => {
       if(cnt==1) name.push(item.trim());
       cnt++;
       if(cnt>3) cnt=1;
   });

  // //  console.log(name+buy+sell);

   searchWooh("wooticket").then((data) => {
    //console.log(data);
    res.render('wooh', { title: '상품권 가격'
                        , name : name
                        , data : data
                    });
    })

  });
});

//랭킹 페이지
app.get('/total', function (req, res) {
  searchData("getRank","ranking").then((msg) => {
    console.log(msg);
    res.render('ranking', { title: 'total ranking'
                        , rankData : msg
                        , sessionID : sessionID
                        , rival : sessionRival
                        , mw : req.query.mw
                    });
    })    
});

app.get('/squat', function (req, res) {
  searchData("getSquatRank","ranking").then((msg) => {
    console.log(msg);
    res.render('ranking', { title: 'squat ranking'
                        , rankData : msg
                        , sessionID : sessionID
                        , rival : sessionRival
                        , mw : req.query.mw
                    });
    })    
});

app.get('/bench', function (req, res) {
  searchData("getBenchRank","ranking").then((msg) => {
    console.log(msg);
    res.render('ranking', { title: 'benchpress ranking'
                        , rankData : msg
                        , sessionID : sessionID
                        , rival : sessionRival
                        , mw : req.query.mw
                    });
    })    
});

app.get('/dead', function (req, res) {
  searchData("getDeadRank","ranking").then((msg) => {
    console.log(msg);
    res.render('ranking', { title: 'deadlift ranking'
                        , rankData : msg
                        , sessionID : sessionID
                        , rival : sessionRival
                        , mw : req.query.mw
                    });
    })    
});

//개인기록 페이지
app.get('/record', function (req, res) {
  searchData("getRecord","3record",req.query.instaID).then((msg) => {
    console.log(msg);
    res.render('record', { title: 'your record'
                        , sessionID : sessionID
                        , record : msg
                        , instaID : req.query.instaID
                    });
    })
});

//인덱스 페이지
app.get('/', function (req, res) {
  searchData("getUserList","ranking").then((msg) => {
    console.log(msg);
    sessionID = "";
      searchData("getMission","mission","master").then((msg2) => {
        console.log(msg2);
        res.render('index', { title: 'your strength'
                        , sessionID : sessionID
                        , userList : msg
                        , mission : msg2
                    });
      });
    })
});
//#endregion

//ajax 컨트롤러
app.post('/ajax', function(req, res, next) {

  if(req.body.op=="R")
  searchData(req.body.op,req.body.col,req.body.userID).then((msg) => {
                        console.log(msg);
                        res.send({result:"R", squat:msg[0], deadlift:msg[1], benchpress:msg[2], instaID:msg[3]});
                      });
  else if(req.body.op=="C")
  insertData(req.body.msg,req.body.col,req.body.userID).then((msg) => {
                        console.log(msg);
                        res.send({result:"C", msg:msg});
  });
  else if(req.body.op=="D")
  delData(req.body.msg,req.body.col,req.body.userID).then((msg) => {
                        console.log(msg);
                        res.send({result:"D", msg:msg});
  });
  else if(req.body.op=="I")
  searchData(req.body.op,req.body.col).then((msg) => {
                        console.log(msg);
                        res.send({result:"I", msg:msg});
  });
  else if(req.body.op=="login")
  searchData(req.body.op,"ranking",req.body.userID).then((msg) => {
                        console.log(msg);
                        sessionID = req.body.userID;
                        sessionRival = msg.rival;
                        if(msg=="signUp") res.send({result:msg});
                        else res.send({result:"signIn", personalData : msg });
  });
  else if(req.body.op=="save"){
    var record = [req.body.squat,req.body.benchpress,req.body.deadlift,req.body.sex];
    insertData(req.body.op,req.body.col,req.body.userID,record).then((msg) => {
                          console.log(msg);
                          if(msg=="save") res.send({result:msg});
    });
  }
  else if(req.body.op=="delUser")
  delData(req.body.op,req.body.col,req.body.userID).then((msg) => {
                          console.log(msg);
                          res.send({result:msg});
    
    });
  else if(req.body.op=="getAllData")
  searchData("getAllData","3record").then((msg) => {
                          console.log(msg);
                          res.send({result:"getAllData", allData:msg});
    });
  else if(req.body.op=="getRank")
  searchData("getRank","ranking").then((msg) => {
                          console.log(msg);
                          res.send({result:"getRank", rankData:msg});
    });
  else if(req.body.op=="getRecord")
  searchData("getRecord","3record",req.body.userID).then((msg) => {
                          console.log(msg);
                          res.send({result:"getRecord", record:msg});
    });
  else if(req.body.op=="imgDownload"){
    InstaClient.getProfile(req.body.userID)
    .then(profile => imgDownload(profile.pic,req.body.userID));
  }
  else if(req.body.op=="setRival"){
    insertData(req.body.op,req.body.col,req.body.userID).then((msg) => {
      console.log(msg);
      if(msg=="setRival") res.send({result:msg});
    });
  }
  else if(req.body.op=="getRivalTotal"){
    searchData(req.body.op,"ranking",req.body.userID).then((msg) => {
      console.log(msg);
      res.send({result:"getRivalTotal",total:msg});
    });
  }
  else if(req.body.op=="setMission"){
    var mission = [req.body.move,req.body.weight,req.body.reps,req.body.set];
    insertData(req.body.op,"mission","master",mission).then((msg) => {
      console.log(msg);
      if(msg=="setMission") res.send({result:msg});
    });
  }
  else if(req.body.op=="missionComplete"){
    var mission = [req.body.move, (parseInt(req.body.weight)/100)*parseInt(req.body.squat) ,req.body.reps,req.body.set];
    insertData("setMission","mission",req.body.userID,mission).then((msg) => {
      console.log(msg);
      if(msg=="missionComplete") res.send({result:msg});
    });
  }
  else if(req.body.op=="getMission"){
    searchData(req.body.op,"mission",req.body.userID).then((msg) => {
      var result=false;
      console.log(msg);
      if(msg.length>0) result=true;
      else result=false;
      res.send({result : "getMission", yn : result });
    });
  }
  else if(req.body.op=="getProfile"){
      console.log(req.body.list);

        InstaClient.getProfile(req.body.list[1])
        .then(profile => {

            var option = {
              url :  profile.pic,
              dest : __dirname +"/images/temp/"+req.body.list[1]+".jpg"
            }
    
            download.image(option).then(({filename}) => {
              console.log('saved to ', filename);
            })
            
          }).catch();

      // var cnt=0;
      // req.body.list.forEach(id => {
      //   InstaClient.getProfile(id)
      //   .then(profile => {

      //       var option = {
      //         url :  profile.pic,
      //         dest : __dirname +'/images/temp/'+id+".jpg"
      //       }
    
      //       download.image(option).then(({filename}) => {
      //         console.log('saved to ', filename);
      //       })
      //     })
      // });
  }
});

//#region CRUD
/* CRUD 함수 시작 */

async function searchData(op,col,userID){

    var database = client.db("overload");
    var collection = database.collection(col);
    var list = [];

    if(op=="I") {
    }
    else if(op=="R") {
      console.log(userID);
      res = await collection.findOne({ instaID: userID });
      list[0] = res.squat;
      list[1] = res.deadlift;
      list[2] = res.benchpress;
      list[3] = res.instaID;
    }
    else if(op=="login") {
      res = await collection.findOne({ instaID: userID });
      if(res == null || res == "" ) return "signUp";
      else{
        console.log(res);
        list=res;
      }
    }
    else if(op=="getUserList") {
      userList = await collection.distinct("instaID");
      list=userList;
    }
    else if(op=="getAllData") {
      list = await collection.find({ instaID: {$regex:""} }).toArray()
    }
    else if(op=="getRank") {
      list = await collection.find({ instaID: {$regex:""} }).sort({ total : -1 }) .toArray();
    }
    else if(op=="getSquatRank") {
      list = await collection.find({ instaID: {$regex:""} }).sort({ squat : -1 }) .toArray();
    }
    else if(op=="getBenchRank") {
      list = await collection.find({ instaID: {$regex:""} }).sort({ benchpress : -1 }) .toArray();
    }
    else if(op=="getDeadRank") {
      list = await collection.find({ instaID: {$regex:""} }).sort({ deadlift : -1 }) .toArray();
    }
    else if(op=="getRecord") {
      list = await collection.find({ instaID: userID }).sort({ time : -1 }) .toArray();
    }
    else if(op=="getRivalTotal") {
      list = await collection.findOne({ instaID: userID });
    }
    else if(op=="getMission") {
      console.log(userID + " , " + moment().format("YYYYMMDD") );
      if(userID=="master") list = await collection.findOne({ instaID: userID });
      else list = await collection.find({ instaID: userID }).toArray(); //time: moment().format("YYYYMMDD")
    }
    return list;
}

async function insertData(op,col,userID,record){
  var database = client.db("overload");
  var userList = database.collection(col);
  var rank = database.collection("ranking");
  var filter;
  var doc;
  //console.log(record);
  if(op=="save"){
    var squat = parseInt(record[0]);
    var benchpress = parseInt(record[1]);
    var deadlift = parseInt(record[2]);
    var total = squat+benchpress+deadlift;
    filter = { instaID : userID, time : moment().format("YYYYMMDD") };
    filter_rank = { instaID : userID };
    doc = { $set: { instaID : userID, time : moment().format("YYYYMMDD"), squat : squat, benchpress : benchpress, deadlift : deadlift, sex :record[3] , total : total } };    
    userList.updateOne(filter,doc,{upsert:true});
    rank.updateOne(filter_rank,doc,{upsert:true});
  }else if(op=="setRival"){
    filter_rank = { instaID : sessionID };
    doc = { $set: { rival : userID } };
    sessionRival = userID;
    rank.updateOne(filter_rank,doc,{upsert:true});
  }else if(op=="setMission"){
    var move = record[0];
    var weight = parseInt(record[1]);
    var reps = parseInt(record[2]);
    var set = parseInt(record[3]);
    filter = { instaID : userID };
    if(userID=="master") doc = { $set: { move : move, weight : weight , reps : reps, set : set, instaID : userID } };
    else {
      doc = { $set: { move : move, weight : weight , reps : reps, set : set, instaID : userID, time : moment().format("YYYYMMDD") } };
      console.log("missionComplete : "+doc)
      op = "missionComplete";
    }
    userList.updateOne(filter,doc,{upsert:true});
  }
  //rank.updateOne(filter_rank,doc,{upsert:true});
  //userList.insertOne(doc);

  return op;
}

async function delData(op,col,userID){

  var database = client.db("overload");
  var userList = database.collection(col);
  var record = database.collection("3record");
  userList.deleteOne({ instaID : userID });
  record.deleteMany({ instaID : userID });
  var filePath = "./images/profile/"+userID+".jpg";
  console.log(filePath);
  fs.unlink(filePath, (err) => err ? console.log(err) : console.log(filePath+"파일이 삭제됨"));

  return op;
}

async function searchMacroDBData(op,col){
  var database = client.db("macroDB");
  var collection = database.collection(col);
  var list = [];

  if(op=="getUserList") {
    userList = await collection.distinct("user");
    list=userList;
  }

  return list;
}

async function searchWooh(col){
  var database = client.db("wooh");
  var collection = database.collection(col);
  return await collection.find().sort({time:-1}).toArray();
}

async function insertWooh(){
  axios.get('https://wooh.co.kr/').then(data=>{
    const $ = cheerio.load(data.data);
    var text = $('div.tbl_head05>table>tbody').text().replace(" ","").split('\n');
    var cnt = 1;
    var name = [];
    var buy = [];
    var sell = [];
     text.forEach(item => {
       if(item.trim()!="") {
         if(cnt==1) name.push(item.trim());
         else if(cnt==2) buy.push(item.trim().split('원')[0]);
         else if(cnt==3) sell.push(item.trim().split('원')[0]);
         cnt++;
         if(cnt>3) cnt=1;
       }
     });

   var database = client.db("wooh");
   var collection = database.collection("main");
   var filter = { time : (parseInt(moment().format("YYYYMMDD"))-1).toString(), buy : buy, sell : sell }
   var doc = { $set: { 
                      time : moment().format("YYYYMMDD"),
                      buy : buy,
                      sell : sell
                  }};    
    
  collection.updateOne(filter,doc,{upsert:true});
  });
  console.log("save wooh "+moment().format("YYYYMMDD"));
}

async function insertTicketNo1(){
  axios.get('http://www.ticketno1.co.kr/popup/popup_2.html?idx=2&type=W&__popupPage=T').then(data=>{
      const $ = cheerio.load(data.data);
      
      var cnt=0;
      var list = [];
      var temp;
      $("td").each(function(key,val){
        //console.log($("td"));
        temp = $(val).text().replace(' ','');
        if(temp.trim() !="" && !temp.includes('*')) {
          if( temp.includes('%') ) temp = temp.split('(')[0];
          list.push(temp);
          cnt++;
        }
        
        if(cnt<6 || temp.includes('투어') || temp=='60,000') list.pop();
        
        //console.log(cnt + " : " + $(val).text());
      });
      console.log(list);

      var name = [];
      var buy = [];
      var sell = [];
      cnt=1;
      list.forEach(item => {
          if(cnt==1) name.push(item.trim());
          else if(cnt==2) buy.push(item.trim());
          else if(cnt==3) sell.push(item.trim());
          cnt++;
          if(cnt>3) cnt=1;
      });

   var database = client.db("wooh");
   var collection = database.collection("ticketno1");
   var filter = { time : (parseInt(moment().format("YYYYMMDD"))-1).toString(), buy : buy, sell : sell }
   var doc = { $set: { 
                      time : moment().format("YYYYMMDD"),
                      buy : buy,
                      sell : sell
                  }};    
    
  collection.updateOne(filter,doc,{upsert:true});
  });
  console.log("save ticketno1 "+moment().format("YYYYMMDD"));
}

async function insertWooTicket(){
  
  var requestOptions = { method: "GET" 
    ,uri: "http://www.wooticket.com/popup_price.php" 
    ,encoding: null 
    };
// request 모듈을 이용하여 html 요청 
  requests(requestOptions, function(error, response, body) { // 전달받은 결과를 EUC-KR로 디코딩하여 출력한다. 
    var strContents = new Buffer(body); 
    var data = iconv.decode(strContents, 'EUC-KR').toString(); 

    const $ = cheerio.load(data);

      var cnt=0;
      var list = [];
      var temp;
      $("font").each(function(key,val){
        //console.log($("td"));
        temp = $(val).text().replace(' ','');
        if(temp.trim() !="") {
          if( temp.includes('%') ) temp = temp.split('(')[0];
          if(cnt>8 && cnt<279) list.push(temp);
          cnt++;
        }
        //console.log(cnt + " : " + $(val).text());
      });
      console.log(list);
  

  var name = [];
  var buy = [];
  var sell = [];
  cnt=1;
   list.forEach(item => {
       if(cnt==1) name.push(item.trim());
       else if(cnt==2) buy.push(item.trim());
       else if(cnt==3) sell.push(item.trim());
       cnt++;
       if(cnt>3) cnt=1;
   });

   var database = client.db("wooh");
   var collection = database.collection("wooticket");
   var filter = { time : (parseInt(moment().format("YYYYMMDD"))-1).toString(), buy : buy, sell : sell }
   var doc = { $set: { 
                      time : moment().format("YYYYMMDD"),
                      buy : buy,
                      sell : sell
                  }};    
    
  collection.updateOne(filter,doc,{upsert:true});
  });

  console.log("save wooticket "+moment().format("YYYYMMDD"));
}

/* CRUD 함수 끝 */ 
//#endregion

//#region 편의성 함수

//YYMMDD 가져오기 폐기 예정
function getDate(){
  var date = new Date();
  var month;
  var day;
  if(date.getMonth()+1 < 10) month="0"+(date.getMonth()+1).toString();
  if(date.getDate() < 10 ) day="0"+date.getDate().toString();
  else month=(date.getMonth()+1).toString();
  return date.getFullYear().toString() + month + day;
}


// 파일 다운로드 함수
function imgDownload(url,instaID){
  console.log(url);
  console.log(instaID);
  // 저장할 위치를 지정
  var dir = "/images/profile/";
  var savepath = __dirname + dir +instaID + ".jpg" ;

  // 출력 지정
  var outfile = fs.createWriteStream(savepath);

  // 비동기로 URL의 파일 다운로드
  http.get(url, function(res) {
      res.pipe(outfile);
      res.on('end', function() {
          outfile.close();
          console.log("download to "+savepath);
      });
  });
}


//#endregion


//테스트 부분
function getFileList(folder){
  var list = [];
    fs.readdir(folder, (err, filelist) => { 

      filelist.forEach(file => {
          list.push(file.split('.jpg')[0]);
          //console.log(file);
        })
        //console.log(list);
    })

    return list;
}