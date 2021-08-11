//#region 초반 선언부
var btn_competition = document.getElementById('btn_competition');
var ib_instaID = document.getElementById('ib_instaID');
var btn_confirm = document.getElementById('btn_confirm');
var div_signupYN = document.getElementById('div_signupYN');
var div_signup = document.getElementById('div_signup');
var div_signin = document.getElementById('div_signin');
var div_inputRecord = document.getElementById('div_inputRecord');
var div_rival = document.getElementById('div_rival');
var span_rivalImg = document.getElementById('span_rivalImg');
var span_rivalName = document.getElementById('span_rivalName');
var span_rivalTotal = document.getElementById('span_rivalTotal');
var span_total = document.getElementById('span_total');
var ib_squat = document.getElementById('ib_squat');
var ib_benchpress = document.getElementById('ib_benchpress');
var ib_deadlift = document.getElementById('ib_deadlift');
var span_name = document.getElementById('span_name');
var img_profile = document.getElementById('img_profile');
var btn_save = document.getElementById('btn_save');
var tb_record = document.getElementById('tb_record');
var rb_sex = document.getElementsByName('radioButton');
var btn_getRecord = document.getElementById('btn_getRecord'); 
var selectID = document.getElementById('selectID'); 
var img_post = document.getElementById('img_post'); 
//#endregion

$(document).ready(function () { 
    $('.dropdown').dropdown({
        allowAdditions: true,
        clearable : true,
        placeholder : 'enter your instagram ID'
      })
});

//페이지 시작 시 수행되는 함수
window.onload = function(){
    // btn_getRecord.hidden();
};

//테스트
function test(){
    callAjax(location.href="/insta");
}

function changeTotal(){
    span_total.innerText = parseInt(ib_squat.value) + parseInt(ib_benchpress.value) + parseInt(ib_deadlift.value);
}

//비교 페이지로 이동
function gotoCompetition(){ location.href="/competition"; }

//로그인 버튼 클릭
function confirm(){ callAjax( "login",ib_instaID.textContent); }

//저장 버튼 클릭
function save(){ callAjax( "save",ib_instaID.textContent); }

//랭크 버튼 클릭
function getRank(){ location.href="/total?mw=mw"; }

//개인기록 버튼 클릭
function getRecord(){ location.href="/record?instaID="+ib_instaID.textContent; }

//등록하시겠습니까? 예/아니오
function signupY(){
    div_signin.setAttribute("style","display:none"); 
    div_signupYN.setAttribute("style","display:none"); 
    div_signup.setAttribute("style","display:block"); 
    div_inputRecord.setAttribute("style","display:block"); 
    div_table.setAttribute("style","display:none"); 
    callAjax("imgDownload");
}
function signupN(){
    div_signin.setAttribute("style","display:none"); 
    div_signupYN.setAttribute("style","display:none"); 
    div_signup.setAttribute("style","display:none"); 
    div_inputRecord.setAttribute("style","display:none"); 
    div_table.setAttribute("style","display:none"); 
}

//Ajax 함수
function callAjax(op,userID) {

//    if(!validation()) op="fail";

    $.ajax({
        url: '/ajax',
        dataType: 'json',
        type: 'POST',
        data: { msg : ""
            , op : op
            , col : "3record"
            , userID : userID
            , sex : getGender()
            , squat : ib_squat.value
            , benchpress : ib_benchpress.value
            , deadlift : ib_deadlift.value
        },
        success: function(result) {

            if ( result['result'] == "signIn" ) {  //기존 회원의 로그인 동작
                div_signin.setAttribute("style","display:block"); 
                div_signup.setAttribute("style","display:none"); 
                div_inputRecord.setAttribute("style","display:block"); 
                span_name.innerText=result['personalData'].instaID;
                btn_getRecord.setAttribute("style","visibility:show"); 
                callAjax("imgDownload");
                //최근값을 인풋박스에
                ib_squat.value = result['personalData'].squat;
                ib_benchpress.value = result['personalData'].benchpress;
                ib_deadlift.value = result['personalData'].deadlift;
                span_total.innerText = parseInt(ib_squat.value) + parseInt(ib_benchpress.value) + parseInt(ib_deadlift.value);
                img_profile.setAttribute("src","/images/profile/"+ib_instaID.textContent+".jpg");
                setGender(result['personalData'].sex);
                img_profile.setAttribute("width","150px");
                img_profile.setAttribute("height","150px");
                if(result['personalData'].rival!=null) {
                    div_rival.setAttribute("style","display:block"); 
                    span_rivalName.textContent = result['personalData'].rival;
                    span_rivalImg.innerHTML = "<img width=\"50px\" src=\"/images/profile/"+result['personalData'].rival+".jpg\">";
                    callAjax("getRivalTotal",result['personalData'].rival);
                }
            }else if ( result['result'] == "signUp" ) { //첫 방문자일 경우
                div_signin.setAttribute("style","display:none"); 
                div_signupYN.setAttribute("style","display:block"); 
                div_signup.setAttribute("style","display:none"); 
                div_inputRecord.setAttribute("style","display:none"); 
                div_table.setAttribute("style","display:none"); 
                ib_squat.value="";
                ib_benchpress.value="";
                ib_deadlift.value="";
            }else if ( result['result'] == "test" ) {
                alert(result["msg"]);
            }else if ( result['result'] == "save" ) {  //기록 저장
                alert("저장되었습니다.");
                callAjax( "login" );
            }else if ( result['result'] == "getAllData" ) {  //모든 데이터 획득
                alert(result['allData']);
            }else if ( result['result'] == "getPost" ) {  //게시물 획득
                var data;
                alert(result['posts']);
                result['posts'].forEach( item => {
                    data+="<img src=\""+item+".jpg\">";
                })
                img_post.innerHTML = data;
            }else if ( result['result'] == "getRivalTotal" ) {  //라이벌의 토탈 획득
                span_rivalTotal.innerText = "Total " + result['total'].total;
            }
        } //function끝
    }).done(function(response) {
        //alert("success");
    }).fail(function(response, txt, e) {
        //alert("fail");
    }); // ------      ajax 끝-----------------
    
}

//편의성 함수

function getFontColor(value){ //+-에 따른 폰트 색 지정
    var color;
    if(value<0) color = "blue";
    else if(value>0) color = "red";
    else if(value==0) color = "black";
    return color;
}

function getGender() { //라디오버튼에서 성별 선택
    var gender=""
    rb_sex.forEach((node)=>{
        if(node.checked) gender=node.value;
    });
    return gender;
  }

function setGender(value) {
        rb_sex.forEach((node)=>{
            if(node.value==value) node.checked=true;
        });
}

function validation() {
    if(ib_instaID.value.length < 2 ) {
        alert("인스타 아이디를 두 글자 이상 입력하세요.");
        return false;
    }
    return true;
}