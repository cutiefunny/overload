//#region 초반 선언부
var btn_competition = document.getElementById('btn_competition');
var ib_instaID = document.getElementById('ib_instaID');
var btn_confirm = document.getElementById('btn_confirm');
var div_signupYN = document.getElementById('div_signupYN');
var div_signup = document.getElementById('div_signup');
var div_signin = document.getElementById('div_signin');
var div_inputRecord = document.getElementById('div_inputRecord');
var ib_nickname = document.getElementById('ib_nickname');
var ib_squat = document.getElementById('ib_squat');
var ib_benchpress = document.getElementById('ib_benchpress');
var ib_deadlift = document.getElementById('ib_deadlift');
var span_name = document.getElementById('span_name');
var img_profile = document.getElementById('img_profile');
var btn_save = document.getElementById('btn_save');
var tb_record = document.getElementById('tb_record');
//#endregion

//페이지 시작 시 수행되는 함수
window.onload = function(){
    //document.getElementById('testValue').innerHTML="<script>var list=[1,2,3]</script>";
};

//비교 페이지로 이동
function gotoCompetition(){ location.href="/competition"; }

//로그인 버튼 클릭
function confirm(){ callAjax( "login" ); }

//저장 버튼 클릭
function save(){ callAjax( "save" ); }

//등록하시겠습니까? 예/아니오
function signupY(){
    div_signin.setAttribute("style","display:none"); 
    div_signupYN.setAttribute("style","display:none"); 
    div_signup.setAttribute("style","display:block"); 
    div_inputRecord.setAttribute("style","display:block"); 
}
function signupN(){
    div_signin.setAttribute("style","display:none"); 
    div_signupYN.setAttribute("style","display:none"); 
    div_signup.setAttribute("style","display:none"); 
    div_inputRecord.setAttribute("style","display:none"); 
}

function test() { list = [1,2,3,4,5]; }

//Ajax 함수
function callAjax(op) {

    $.ajax({
        url: '/ajax',
        dataType: 'json',
        type: 'POST',
        data: { msg : ""
            , op : op
            , col : "3record"
            , userID : ib_instaID.value
            , nickName : ib_nickname.value
            , squat : ib_squat.value
            , benchpress : ib_benchpress.value
            , deadlift : ib_deadlift.value
        },
        success: function(result) {

            if ( result['result'] == "signIn" ) {  //기존 회원의 로그인 동작
                div_signin.setAttribute("style","display:block"); 
                div_signup.setAttribute("style","display:none"); 
                div_inputRecord.setAttribute("style","display:block"); 
                //최근값을 인풋박스에
                ib_squat.value = result['personalData'][0].squat;
                ib_benchpress.value = result['personalData'][0].benchpress;
                ib_deadlift.value = result['personalData'][0].deadlift;
                var data;
                data += "<tr><th>날짜</th><th>S</th><th>B</th><th>D</th><th>Total</th></tr>";
                var cnt=0;
                var diff_s=0;
                var diff_b=0;
                var diff_d=0;
                var fontColor_s = "black";
                var fontColor_b = "black";
                var fontColor_d = "black";
                var fontColor_total = "black";
                //표에 기록을 뿌려줌
                result['personalData'].forEach(item => {
                    if(cnt<result['personalData'].length-1) {
                        diff_s=(result['personalData'][cnt].squat-result['personalData'][cnt+1].squat);
                        diff_b=(result['personalData'][cnt].benchpress-result['personalData'][cnt+1].benchpress);
                        diff_d=(result['personalData'][cnt].deadlift-result['personalData'][cnt+1].deadlift);
                        fontColor_s = getFontColor(diff_s);
                        fontColor_b = getFontColor(diff_b);
                        fontColor_d = getFontColor(diff_d);
                        fontColor_total = getFontColor(parseInt(diff_s+diff_b+diff_d));
                    }else{
                        diff_s=0;
                        diff_b=0;
                        diff_d=0;
                        fontColor_s = "black";
                        fontColor_b = "black";
                        fontColor_d = "black";
                        fontColor_total = "black";
                    }
                    data += "<tr>"
                    + "<td>"+item.time+"</td>"
                    + "<td>"+item.squat+"<font size=1 color="+fontColor_s+">("+ diff_s +")</font>"+"</td>"
                    + "<td>"+item.benchpress+"<font size=1 color="+fontColor_b+">("+ diff_b +")</font>"+"</td>"
                    + "<td>"+item.deadlift+"<font size=1 color="+fontColor_d+">("+ diff_d +")</font>"+"</td>"
                    + "<td>"+(item.squat+item.benchpress+item.deadlift)+"<font size=1 color="+fontColor_total+">("+ (diff_s+diff_b+diff_d) +")</font>"+"</td>"
                    + "</tr>";
                    cnt++;
                });
                tb_record.innerHTML = data;
                span_name.innerText=result['personalData'][0].nickName;
                ib_nickname.value=result['personalData'][0].nickName;
                img_profile.setAttribute("src","/images/profile/"+ib_instaID.value+".jpg");
                //alert( result['squat']+","+result['deadlift']+","+result['benchpress'] );
            }else if ( result['result'] == "signUp" ) { //첫 방문자일 경우
                div_signin.setAttribute("style","display:none"); 
                div_signupYN.setAttribute("style","display:block"); 
                ib_nickname.value=""
                ib_squat.value="";
                ib_benchpress.value="";
                ib_deadlift.value="";
            }else if ( result['result'] == "test" ) {
                alert(result["msg"]);
            }else if ( result['result'] == "save" ) {  //기록 저장
                alert("저장되었습니다.");
                callAjax( "login" );
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
    if(value<0) color = "red";
    else if(value>0) color = "blue";
    else if(value==0) color = "black";
    return color;
}
