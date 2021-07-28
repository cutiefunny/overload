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

const { MongoClient } = require("mongodb");
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
  searchData(req.body.op,"3record").then((msg) => {
                        console.log(msg);
                        res.send({result:"I", msg:msg});
  });
  else if(req.body.op=="login")
  searchData(req.body.op,req.body.col,req.body.userID).then((msg) => {
                        console.log(msg);
                        res.send({result:"signIn", squat:msg[0], deadlift:msg[1], benchpress:msg[2], instaID:msg[3]});
  });

});

/* CRUD 함수 시작 */

async function searchData(op,col,userID){

    var database = client.db("overload");
    var collection = database.collection(col);
    var list = [];

    if(col=="3record" && op=="I") {
      response = await collection.find({ nickName: {$regex:""} }).toArray();
      response.forEach(element => { list.push(element.nickName); });
    }
    else if(col=="3record" && op=="R") {
      response = await collection.findOne({ nickName: {$regex:userID} });
      list[0] = response.squat;
      list[1] = response.deadlift;
      list[2] = response.benchpress;
      list[3] = response.instaID;
    }
    else if(col=="3record" && op=="login") {
      response = await collection.findOne({ instaID: {$regex:userID} });
      list[0] = response.squat;
      list[1] = response.deadlift;
      list[2] = response.benchpress;
      list[3] = response.instaID;
    }

    
    return list;
}

async function insertData(req,col,userID){

  var database = client.db("overload");
  var userList = database.collection(col);
  var filter;
  var doc;
  if(col=="whiteList"){
    filter = {name:req};
    doc = { $set: { name : req, lastDate : "20210727" } };
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

  return req;
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