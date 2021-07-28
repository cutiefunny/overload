var sbx_userID = document.getElementById('sbx_userID');
var hib_selectedUserID = document.getElementById('hib_selectedUserID');
var ib_squat = document.getElementById('ib_squat');
var ib_deadlift = document.getElementById('ib_deadlift');
var ib_benchpress = document.getElementById('ib_benchpress');

window.onload = function(){
    callAjax("I");
};

//리스트 더블 클릭
function selectUserList(){ window.open("http://instagram.com/"+hib_selectedUserID.value); }

//CRUD
function search(){ callAjax("R") }
//function insert(){ callAjax("C") }
//function del(){ callAjax("D") }

//Ajax 함수
function callAjax(op) {

    $.ajax({
        url: '/ajax',
        dataType: 'json',
        type: 'POST',
        data: { msg : ""
            , op : op
            , col : "3record"
            , userID : $("#sbx_userID option:selected").text() 
        },
        success: function(result) {

            if ( result['result'] == "R" ) {
                ib_squat.value = result['squat'];
                ib_deadlift.value = result['deadlift'];
                ib_benchpress.value = result['benchpress'];
                hib_selectedUserID.value = result['instaID'];
            }else if( result['result'] == "C" ){
                lbx_whiteList.setAttribute("size",lbx_whiteList.options.length+1);
                lbx_whiteList.options[lbx_whiteList.options.length] = new Option(ib_search.value,"");
            }else if( result['result'] == "D" ){
                ib_search.value = ib_search_backup.value;
                callAjax("R");
            }else if( result['result'] == "I" ){
                sbx_userID.setAttribute("size",result['msg'].length);
                result['msg'].forEach(element => {
                    sbx_userID.options[sbx_userID.options.length] = new Option(element,"");
                });
            }
            
        } //function끝
    }).done(function(response) {
        //alert("success");
    }).fail(function(response, txt, e) {
        alert("fail");
    }); // ------      ajax 끝-----------------
}

