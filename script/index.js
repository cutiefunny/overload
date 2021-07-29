//#region 초반 선언부
var btn_competition = document.getElementById('btn_competition');
var ib_instaID = document.getElementById('ib_instaID');
var btn_confirm = document.getElementById('btn_confirm');
var div_signup = document.getElementById('div_signup');
var div_signin = document.getElementById('div_signin');
var ib_squat = document.getElementById('ib_squat');
var ib_benchpress = document.getElementById('ib_benchpress');
var ib_deadlift = document.getElementById('ib_deadlift');
var span_name = document.getElementById('span_name');
var img_profile = document.getElementById('img_profile');
var btn_save = document.getElementById('btn_save');
//#endregion

//비교 페이지로 이동
function gotoCompetition(){ location.href="/competition"; }

//로그인 버튼 클릭
function confirm(){ callAjax( "login" ); }

//저장 버튼 클릭
function save(){ callAjax( "save" ); }

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
            , squat : ib_squat.value
            , benchpress : ib_benchpress.value
            , deadlift : ib_deadlift.value
        },
        success: function(result) {

            if ( result['result'] == "signIn" ) {
                div_signin.setAttribute("style","display:block"); 
                div_signup.setAttribute("style","display:none"); 
                ib_squat.value=result['squat'];
                ib_benchpress.value=result['benchpress'];
                ib_deadlift.value=result['deadlift'];
                span_name.innerText=result['nickName'];
                img_profile.setAttribute("src","/images/profile/"+ib_instaID.value+".jpg");
                //alert( result['squat']+","+result['deadlift']+","+result['benchpress'] );
            }else if ( result['result'] == "signUp" ) {
                div_signin.setAttribute("style","display:none"); 
                div_signup.setAttribute("style","display:block"); 
                ib_squat.value="";
                ib_benchpress.value="";
                ib_deadlift.value="";
            }else if ( result['result'] == "test" ) {
                alert(result["msg"]);
            }else if ( result['result'] == "save" ) {
                alert("저장되었습니다.");
            }
            
        } //function끝
    }).done(function(response) {
        //alert("success");
    }).fail(function(response, txt, e) {
        //alert("fail");
    }); // ------      ajax 끝-----------------
}
