//#region 초반 선언부
const express = require('express');
const port = 8001;
const log = console.log;

const bodyparser= require('body-parser');
const app = express();

app.use(express.static(__dirname + '/public/'))
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
//app.set('view engine', 'ejs');
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
//app.engine('html', require('ejs').renderFile);

app.use('/script',express.static(__dirname + "/script"));
app.use('/views',express.static(__dirname + "/views"));
app.use('/images',express.static(__dirname + "/images"));

const { MongoClient } = require("mongodb");
const { response } = require('express');
//#endregion

//#region DB연결 및 라우팅
const uri =
  "mongodb+srv://cutiefunny:ghks1015@macrodb.srkli.mongodb.net/macroDB?retryWrites=true&w=majority";
const client = new MongoClient(uri);
client.connect();

app.listen(port, ()=>{
    console.log('8001번 포트에 대기중!')
})
console.log("server started");

app.get('/competition', function (req, res) {
    res.render('competition', { title: 'progressive overload'
                        , message: 'Hello there!'
                        , message2: 'test'
                    });
  });

  app.get('/', function (req, res) {
    res.render('index', { title: 'progressive overload'
                        , message: 'Hello there!'
                        , message2: 'test'
                    });
  });
//#endregion

//ajax 인터페이스
app.get('/getajax', function(req, res, next) { res.render("/ajax"); });

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
                        if(msg=="signUp") res.send({result:msg});
                        //else res.send({result:"signIn", squat:msg[0], deadlift:msg[1], benchpress:msg[2], instaID:msg[3], nickName:msg[4]});
                        else res.send({result:"signIn", testArray : msg });
  });
  else if(req.body.op=="save"){
    var record = [req.body.squat,req.body.benchpress,req.body.deadlift,req.body.nickName];
    insertData(req.body.op,req.body.col,req.body.userID,record).then((msg) => {
                          console.log(msg);
                          if(msg=="save") res.send({result:msg});
    
    });
  }
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
      res = await collection.findOne({ nickName: userID });
      list[0] = res.squat;
      list[1] = res.deadlift;
      list[2] = res.benchpress;
      list[3] = res.instaID;
    }
    else if(op=="login") {
      res = await collection.find({ instaID: userID }).toArray();
      if(res == null || res == "" ) return "signUp";
      else{
        console.log(res);
        // list[0] = res.squat;
        // list[1] = res.deadlift;
        // list[2] = res.benchpress;
        // list[3] = res.instaID;
        // list[4] = res.nickName;
        list=res;
      }
    }

    
    return list;
}

async function insertData(op,col,userID,record){
  var database = client.db("overload");
  var userList = database.collection(col);
  var filter;
  var doc;
  console.log(record);
  if(op=="save"){
    filter = { instaID : userID, time : getDate() };
    doc = { $set: { instaID : userID, time : getDate(), squat : parseInt(record[0]), benchpress : parseInt(record[1]), deadlift : parseInt(record[2]), nickName : record[3] } };
  }else if(col=="userList"){
    filter = {user:req};
    doc = { $set: { user : req } };
  }else if(col=="tags"){
    var seq = await userList.find({ tag: {$regex:""}, user : userID}).sort({seq:-1}).toArray();
    console.log(seq[0].seq);
    filter = { tag : req, user : userID };
    doc = { $set: { seq : seq[0].seq+1, tag : req, user : userID } };
  }else if(col=="filterWord"){
    filter = {filterWord:req};
    doc = { $set: { filterWord : req } };
  }
  userList.updateOne(filter,doc,{upsert:true});
  //userList.insertOne(doc);

  return op;
}

async function delData(req,col,userID){

  var database = client.db("overload");
  var userList = database.collection(col);
  var doc;
  if(col=="whiteList") doc = { name : req };
  else if(col=="userList") doc = { user : req };
  else if(col=="tags") doc = { tag : req, user : userID };
  else if(col=="filterWord") doc = { filterWord : req };
  userList.deleteOne(doc);

  return req;
}

/* CRUD 함수 끝 */ 

//#region 편의성 함수

//YYMMDD 가져오기
function getDate(){
  var date = new Date();
  var month;
  if(date.getMonth()+1 < 10) month="0"+(date.getMonth()+1).toString();
  else month=(date.getMonth()+1).toString();
  return date.getFullYear().toString() + month + date.getDate().toString();
}

//#endregion