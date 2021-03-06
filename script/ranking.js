//#region 초반 선언부
var btn_men = document.getElementById('btn_men');
var btn_women = document.getElementById('btn_women');
var div_men = document.getElementById('div_men');
var div_women = document.getElementById('div_women');
//#endregion

//페이지 시작 시 수행되는 함수
window.onload = function(){
};

//테이블 열 클릭 시
function tdClick(instaID){ 
    var open=false;
    var tr = document.getElementById('tr_'+instaID);
    if(tr.getAttribute("class")=="hidden2") open=false;
    else open=true;
    var trs = document.getElementsByName('tr_');
    trs.forEach(element => {
        element.setAttribute("class","hidden2");
    });
    //if(tr.getAttribute("class")=="hidden2") tr.setAttribute("class","");
    if(!open) tr.setAttribute("class","");
}

function goInsta(instaID) { location.href="http://www.instagram.com/"+instaID.split('insta_')[1]; }

function goPersonalRecord(instaID) { location.href="/record?instaID="+instaID.split('record_')[1]; }

function findMe(instaID) { document.getElementById(instaID).scrollIntoView();}

//라이벌 버튼 클릭 시
function toggleRival(instaID){
    var btn=document.getElementById('btn_rival_'+instaID);

    // if(btn.className="positive ui button") {
    //     btn.className="ui button";
    //     callAjax("setRival","");
    // }
    // else if(btn.className="ui button"){
        var btns=document.getElementsByName('btn_rival');
        btns.forEach(element => {
            element.setAttribute("class","ui button");
        });
        //if(btn.getAttribute("class")=="ui button") 
        btn.setAttribute("class","positive ui button");
        callAjax("setRival",instaID);
    // }
}

//men 버튼 클릭
function selectMen() { toggleMW(btn_men,div_men); }

//women 버튼 클릭
function selectWomen(){ { toggleMW(btn_women,div_women); } }

//men women toggle
function toggleMW(btn,div){
    if(btn.getAttribute("class")=="positive ui button") {
        btn.setAttribute("class","ui button");
        div.setAttribute("style","display:none");
    }else if(btn.getAttribute("class")=="ui button") {
        btn.setAttribute("class","positive ui button");
        div.setAttribute("style","display:block");
    }
}

function arrange(value){ 
    var mw="";
    if(btn_men.getAttribute("class")=="positive ui button") mw+="m";
    if(btn_women.getAttribute("class")=="positive ui button") mw+="w";
    location.href="/"+value+"?mw="+mw; 
}

//유저 삭제 : 관리자 기능
function delUser(userID){
    if(confirm(userID+" 삭제하시겠습니까?")){
        callAjax("delUser",userID);
    }
}

//Ajax 함수
function callAjax(op,userID) {

    $.ajax({
        url: '/ajax',
        dataType: 'json',
        type: 'POST',
        data: { msg : ""
            , op : op
            , col : "ranking"
            , userID : userID
        },
        success: function(result) {

            if ( result['result'] == "delUser" ) {  //삭제 동작 callback
                alert("삭제되었습니다.");
                window.location.reload();
            }else if ( result['result'] == "getInstaInfo" ) {  //삭제 동작 callback
                //alert( result['info'] );
                var td=document.getElementById('tr_'+userID);
                var data = "<img src=\"/images/temp/" +result['info'][0] + ".jpg\" width=\"50px\">";
                td.innerHTML = data;
            }
            
        } //function끝
    }).done(function(response) {
        //alert("success");
    }).fail(function(response, txt, e) {
        //alert("fail");
    }); // ------      ajax 끝-----------------
}