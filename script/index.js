var btn_competition = document.getElementById('btn_competition');
var ib_instaID = document.getElementById('ib_instaID');
var btn_confirm = document.getElementById('btn_confirm');

//버튼 클릭
function gotoCompetition(){ location.href="/competition"; }

function confirm(){
    callAjax( "login" );
}

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
        },
        success: function(result) {

            if ( result['result'] == "signIn" ) {
                alert( result['squat']+","+result['deadlift']+","+result['benchpress'] );
            }else if ( result['result'] == "signUp" ) {
                alert( "가입해주세요!" );
            }
            
        } //function끝
    }).done(function(response) {
        //alert("success");
    }).fail(function(response, txt, e) {
        alert("fail");
    }); // ------      ajax 끝-----------------
}
