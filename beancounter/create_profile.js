//get the profile and do something with it
//needs decrufting


function check_for_profile(){

//first check if profiled

  var url = bc_url+"user/profile/status/"+username+"?apikey="+app_key;
  console.log(url);
      $.ajax({
        url:url,
        dataType: "json",
        type: "GET",
        success: function(data){
           check_if_profiled(data);
        },
        error: function(data){
          console.log(data);
          alert("failed");

        }
      });

}


function check_if_profiled(data){
  console.log("checking if profiled "+username);
  console.log(data);
  var msg = data["message"];
  if(msg.match("not profiled")){//either the crawler didn;t complete or teh profiler didn;t start

//so try it now
    console.log("!!!! crawling or profileing failed for some reason");
    go_crawl();

  }else{

    if(msg && msg.match("profiled")){
      console.log("ok - profiled");
      get_profile();    
    }else{
      console.log("not profiled yet...checking again in 10 secs");
      setTimeout("check_for_profile()",10000);
    } 
  }
}


function go_crawl(){
  //when this completes, go profiler
    var url = bc_url+"user/activities/update/"+username+"?apikey="+app_key;

      $.ajax({
        url:url,
        dataType: "json",
        type: "GET",
        success: function(data){
          console.log("triggering profiling");
          go_profiler();
        },
        error: function(data){

          console.log("****not ok 10 "+data["status"]+" "+data["message"]);
          console.log(data);
//          alert("failed[5]");
        }
      });

}


function go_profiler(){
  //when this completes, go profiler
    var url = bc_url+"user/profile/update/"+username+"?apikey="+app_key;

      $.ajax({
        url:url,
        dataType: "json",
        type: "GET",
        success: function(data){
           console.log("profiling triggered");
           setTimeout("check_for_profile()",10000);
        },
        error: function(data){
          console.log("not ok 11 "+data["status"]+" "+data["message"]);
          alert("failed[6]");
        }
      });

}




function get_profile(){

//then get the profile

  var url = bc_url+"user/profile/"+username+"?apikey="+app_key;
console.log(url);
      $.ajax({
        url:url,
        dataType: "json",
        type: "GET",
        success: function(data){
           process_activities(data);
        },
        error: function(data){
          console.log(data);
          alert("failed");

        }
      });

}

var max_weight = 1;
var min_weight = 1;
var interests = null;
var total_activities = 0;
var oldest_action_date=new Date();
var visibility = "";

function process_activities(data){
console.log(data);
  if(data["object"]){
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
  }
//  c_callback();
  process_interests();
}

