
//config
var bc_url ="http://moth.notube.tv/notube-platform/rest/";
var app_key = "ecb1e9fc90d14b63a3fe70497cbf1d69";
var n_screen_api_root="http://nscreen.notu.be/iplayer_dev/api/";

//open and close teh settings button


function pulldown(){
 $("#dropdown").toggle();
}

function logout(){
  localStorage.removeItem("creds");
  document.location="signup.html";
}

function go_to_settings(){
  document.location="settings.html";
}

function process_date(d){
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  var months =["January","February","March","April","May","June","July","August","September","October","November","December"];

  var then = new Date(d);
  var now = new Date();

  var a_week_ago = new Date();
  a_week_ago.setDate(a_week_ago.getDate() - 7);

  var date_text = "";

  if(then.getDate()==now.getDate() && then.getMonth()==now.getMonth() && then.getYear()==now.getYear()){
    var hrs = now.getHours() - then.getHours();
    date_text = ""+parseInt(hrs)+" hours ago";
  }else{

    if(then > a_week_ago){
      date_text = "Last "+days[then.getDay()];
    }else{
      var yr = then.getYear()+1900;
      date_text = days[then.getDay()]+", "+then.getDate()+" "+months[then.getMonth()]+" "+yr;
    }
  }
  return date_text;
}


