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