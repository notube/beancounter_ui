//get the profile and do something with it
//needs decrufting

var c_callback = null;

function get_profile(username,callback){
  c_callback = callback;
  var url = bc_url+"jsonp/user/profile/"+username+"?apikey=ecb1e9fc90d14b63a3fe70497cbf1d69&callback=process_activities";
  $("#newstuff").attr("src",url);
}

var max_weight = 1;
var min_weight = 1;
var interests = null;
var total_activities = 0;
var oldest_action_date=new Date();
var visibility = "";

function process_activities(data){
console.log(data);
  interests = data["object"]["interests"];
  for(var i in interests){
     var weight = ["weight"];
     if(max_weight<weight){
        max_weight = weight;
     }
     if(min_weight>weight){
        min_weight = weight;
     }
  }

  visibility = data["object"]["visibility"];
  if(visibility=="private"){
    $("#profile_status").html("<img src=\"images/lock_large.png\" />Your profile is private");
  }else{
    $("#profile_status").html("Your profile is public");
  }

  c_callback();
}

