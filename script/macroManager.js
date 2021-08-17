var btn_getProfile = document.getElementById("btn_getProfile");
var div_pic = document.getElementById("div_pic");

function getProfile(){
    var list=[];
    var ids = document.getElementsByName("td_id");
    ids.forEach(id => {
        list.push(id.innerText);
    });
    callAjax("getProfile",list);
}

//Ajax 함수
function callAjax(op,list) {

    $.ajax({
        url: '/ajax',
        dataType: 'json',
        type: 'POST',
        traditional:true,
        data: { msg : ""
            , op : op
            , list : list
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