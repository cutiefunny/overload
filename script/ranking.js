//#region 초반 선언부
var btn_men = document.getElementById('btn_men');
var btn_women = document.getElementById('btn_women');
var div_men = document.getElementById('div_men');
var div_women = document.getElementById('div_women');
//#endregion

//men 버튼 클릭
function selectMen(){
    div_men.setAttribute("style","display:block"); 
    div_women.setAttribute("style","display:none"); 
}
//women 버튼 클릭
function selectWomen(){
    div_men.setAttribute("style","display:none"); 
    div_women.setAttribute("style","display:block"); 
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
            }
            
        } //function끝
    }).done(function(response) {
        //alert("success");
    }).fail(function(response, txt, e) {
        //alert("fail");
    }); // ------      ajax 끝-----------------
}