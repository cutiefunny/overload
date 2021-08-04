//#region 초반 선언부
const express = require('express');
const port = 8001;
const session = require('express-session')

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
const { response } = require('express');
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

//경쟁 페이지(close)
app.get('/competition', function (req, res) {
    res.render('competition', { title: 'progressive overload'
                        //, list : [1,2,3,4,5]
                    });
  });

//랭킹 페이지
app.get('/ranking', function (req, res) {
  searchData("getRank","ranking").then((msg) => {
    console.log(msg);
    res.render('ranking', { title: 'ranking'
                        , rankData : msg
                        , sessionID : sessionID
                    });
    })    
});

//인덱스 페이지
app.get('/', function (req, res) {
    sessionID = "";
    res.render('index', { title: 'progressive overload'
                        , sessionID : sessionID
                    });
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
    var record = [req.body.squat,req.body.benchpress,req.body.deadlift,req.body.nickName,req.body.sex];
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
});

/* CRUD 함수 시작 */

async function searchData(op,col,userID){

    var database = client.db("overload");
    var collection = database.collection(col);
    var list = [];

    if(op=="I") {
      res = await collection.find({ nickName: {$regex:""} }).toArray();
      res.forEach(element => { list.push(element.nickName); });
    }
    else if(op=="R") {
      console.log(userID);
      res = await collection.findOne({ nickName: userID });
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
    doc = { $set: { instaID : userID, time : getDate(), squat : squat, benchpress : benchpress, deadlift : deadlift, nickName : record[3], sex :record[4] , total : total } };
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