//#region 초반 선언부
const express = require('express');
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
//#endregion

//#region DB연결 및 라우팅
const uri =
  "mongodb+srv://cutiefunny:ghks1015@macrodb.srkli.mongodb.net/macroDB?retryWrites=true&w=majority";
const client = new MongoClient(uri);
client.connect();

//리스닝
app.listen(port, ()=>{
    console.log('8001번 포트에 대기중!');
    InstaClient.authBySessionId("48763774309%3AbKPkXcNXea8TBe%3A0")
	.then(account => console.log(account.username));
  
})
console.log("server started");

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
    res.render('index', { title: 'your strength'
                        , sessionID : sessionID
                        , userList : msg
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
  }else if(op=="setRival"){
    filter_rank = { instaID : sessionID };
    doc = { $set: { rival : userID } };
    sessionRival = userID;
  }
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
