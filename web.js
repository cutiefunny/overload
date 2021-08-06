//#region 초반 선언부
const express = require('express');
const port = 8001;
const session = require('express-session')
const fs = require('fs');
//https://newsimg.hankookilbo.com/cms/articlerelease/2019/04/29/201904291390027161_3.jpg

const bodyparser= require('body-parser');
const app = express();

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

const { MongoClient } = require("mongodb");
const { response, request } = require('express');
//#endregion

//#region DB연결 및 라우팅
const uri =
  "mongodb+srv://cutiefunny:ghks1015@macrodb.srkli.mongodb.net/macroDB?retryWrites=true&w=majority";
const client = new MongoClient(uri);
client.connect();

//리스닝
app.listen(port, ()=>{
    console.log('8001번 포트에 대기중!')
})
console.log("server started");

var requestOptions = { method: "GET" ,uri: "https://newsimg.hankookilbo.com/cms/articlerelease/2019/04/29/201904291390027161_3.jpg", encoding: null };

//랭킹 페이지
app.get('/total', function (req, res) {
  searchData("getRank","ranking").then((msg) => {
    console.log(msg);
    res.render('ranking', { title: 'ranking'
                        , rankData : msg
                        , sessionID : sessionID
                    });
    })    
});

app.get('/squat', function (req, res) {
  searchData("getSquatRank","ranking").then((msg) => {
    console.log(msg);
    res.render('ranking', { title: 'ranking'
                        , rankData : msg
                        , sessionID : sessionID
                    });
    })    
});

app.get('/bench', function (req, res) {
  searchData("getBenchRank","ranking").then((msg) => {
    console.log(msg);
    res.render('ranking', { title: 'ranking'
                        , rankData : msg
                        , sessionID : sessionID
                    });
    })    
});

app.get('/dead', function (req, res) {
  searchData("getDeadRank","ranking").then((msg) => {
    console.log(msg);
    res.render('ranking', { title: 'ranking'
                        , rankData : msg
                        , sessionID : sessionID
                    });
    })    
});

//개인기록 페이지
app.get('/record', function (req, res) {
  searchData("getRecord","3record",sessionID).then((msg) => {
    console.log(msg);
    res.render('record', { title: 'your record'
                        , sessionID : sessionID
                        , record : msg
                    });
    })
});

//인덱스 페이지
app.get('/', function (req, res) {
  searchData("getUserList","ranking").then((msg) => {
    console.log(msg);
    sessionID = "";
    res.render('index', { title: 'your strength'
                        , sessionID : sessionID
                        , userList : msg
                    });
    })
});

//파일 다운로드 테스트
app.get('/download', function (req, res) {
    var filename = req.params.id;
    res.download("https://newsimg.hankookilbo.com/cms/articlerelease/2019/04/29/201904291390027161_3.jpg");
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
  searchData(req.body.op,req.body.col,req.body.userID).then((msg) => {
                        console.log(msg);
                        sessionID = req.body.userID;
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
});

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
      res = await collection.find({ instaID: userID }).sort({ time : -1 }).toArray();
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
    return list;
}

async function insertData(op,col,userID,record){
  var database = client.db("overload");
  var userList = database.collection(col);
  var rank = database.collection("ranking");
  var filter;
  var doc;
  var squat = parseInt(record[0]);
  var benchpress = parseInt(record[1]);
  var deadlift = parseInt(record[2]);
  var total = squat+benchpress+deadlift;
  console.log(record);
  if(op=="save"){
    filter = { instaID : userID, time : getDate() };
    filter_rank = { instaID : userID };
    doc = { $set: { instaID : userID, time : getDate(), squat : squat, benchpress : benchpress, deadlift : deadlift, sex :record[3] , total : total } };
  }
  userList.updateOne(filter,doc,{upsert:true});
  rank.updateOne(filter_rank,doc,{upsert:true});
  //userList.insertOne(doc);

  return op;
}

async function delData(op,col,userID){

  var database = client.db("overload");
  var userList = database.collection(col);
  var record = database.collection("3record");
  userList.deleteOne({ instaID : userID });
  record.deleteMany({ instaID : userID });

  return op;
}

/* CRUD 함수 끝 */ 

//#region 편의성 함수

//YYMMDD 가져오기
function getDate(){
  var date = new Date();
  var month;
  var day;
  if(date.getMonth()+1 < 10) month="0"+(date.getMonth()+1).toString();
  if(date.getDate() < 10 ) day="0"+date.getDate().toString();
  else month=(date.getMonth()+1).toString();
  return date.getFullYear().toString() + month + day;
}

//#endregion


//테스트 부분

// url에 있는 파일을 savepath에 다운로드 한다.

// 다운로드 URL을 지정
// var url = "https://wickedmagic.tistory.com/565";

// // 저장할 위치를 지정
// var savepath = "test.html";

// // 사용 모듈 정의
// var http = require('http');    // HTTP 모듈

// // 출력 지정
// var outfile = fs.createWriteStream(savepath);

// // 비동기로 URL의 파일 다운로드
// http.get(url, function(res) {
//     res.pipe(outfile);
//     res.on('end', function() {
//         outfile.close();
//         console.log("ok");
//     });
// });