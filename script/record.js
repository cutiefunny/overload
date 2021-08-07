var div_squat = document.getElementById('div_squat');
var tb_record = document.getElementById('tb_record');

//페이지 시작 시 수행되는 함수
window.onload = function(){
    callAjax("getRecord");
};

//Ajax 함수
function callAjax(op) {

    //    if(!validation()) op="fail";
    
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
    
                if ( result['result'] == "getRecord" ) {  
                    var data = "<thead><tr><th width='100'>Date</th><th>Squat</th><th>Bench</th><th>Dead</th><th>Total</th></tr></thead><tbody>";
                    var cnt=0;
                    var diff_s=0;
                    var diff_b=0;
                    var diff_d=0;
                    var fontColor_s = "black";
                    var fontColor_b = "black";
                    var fontColor_d = "black";
                    var fontColor_total = "black";
                    //표에 기록을 뿌려줌
                    result['record'].forEach(item => {
                        if(cnt<result['record'].length-1) {
                            diff_s=(result['record'][cnt].squat-result['record'][cnt+1].squat);
                            diff_b=(result['record'][cnt].benchpress-result['record'][cnt+1].benchpress);
                            diff_d=(result['record'][cnt].deadlift-result['record'][cnt+1].deadlift);
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
                        + "<td data-label=\"날짜\">"+item.time+"</td>"
                        + "<td data-label=\"S\">"+item.squat+"<font size=1 color="+fontColor_s+">("+ diff_s +")</font>"+"</td>"
                        + "<td data-label=\"B\">"+item.benchpress+"<font size=1 color="+fontColor_b+">("+ diff_b +")</font>"+"</td>"
                        + "<td data-label=\"D\">"+item.deadlift+"<font size=1 color="+fontColor_d+">("+ diff_d +")</font>"+"</td>"
                        + "<td data-label=\"Total\">"+(item.squat+item.benchpress+item.deadlift)+"<font size=1 color="+fontColor_total+">("+ (diff_s+diff_b+diff_d) +")</font>"+"</td>"
                        + "</tr>";
                        cnt++;
                    });
                    data += "</tbody>";
                    tb_record.innerHTML = data;
                }
                
            } //function끝
        }).done(function(response) {
            //alert("success");
        }).fail(function(response, txt, e) {
            //alert("fail");
        }); // ------      ajax 끝-----------------
        
    }

function getFontColor(value){ //+-에 따른 폰트 색 지정
    var color;
    if(value<0) color = "blue";
    else if(value>0) color = "red";
    else if(value==0) color = "black";
    return color;
}