var username;
var user_id;


   var num_progs_total = 0;
   var oldest = null;
   var oldest_text = null;

//top five interests

   var top_five = [];
   var top_five_urls = [];
   var top_five_current = [];

//evolution of top 2 interests

   var count_two_months = 0;
   var top_two_6_months_titles = [];

   var top_two_6_months = [[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0]];


   var thecallback = null;

   function init(username, callback){

//ensure everything is reset
     thecallback = callback;

     num_progs_total = 0;
     oldest = new Date();
     oldest_text = process_date(oldest);

//load in the profile
///notube-platform/rest/jsonp/user/activities/

     var url = bc_url+"user/profile/"+username+"?apikey="+app_key;
     console.log(url);
      $.ajax({
        url:url,
        dataType: "json",
        type: "GET",
        success: function(data){
          process_profile(data);
        },
        error: function(data){
          console.log("not ok 3 "+data["status"]+" "+data["message"]);
          alert("failed");
        }
      });


}



//do soem stuff with the profile

   function process_profile(data){
     var result = [];

console.log("processing profile");
console.log(data);
     user_id = data["object"]["id"];

     visibility = data["object"]["visibility"];
     if(visibility=="private"){
       $("#profile_status").html("<img src=\"images/lock_large.png\" />Your profile is private");
     }else{
       $("#profile_status").html("Your profile is public");
     }


     var genres = data["object"]["interests"];

     var fav_genre = null;
     var fav_genre_num = 0;

     var fav_person = null;
     var fav_person_num = 0;

     var fav_format = null;
     var fav_format_num = 0;

     var fav_place = null;
     var fav_place_num = 0;

     var fav_subject = null;
     var fav_subject_num = 0;

     var top_two = [];

//loop throgh genres distinuisghing the difefrent types
     var n = 0;

     for(var g in genres){
      var a_g = genres[g];
      var g_count = parseFloat(a_g["weight"]);
      var name = a_g["reference"];
      name = name.replace(/.*\//,"");
      name = name.replace(/_/g," ");

      var url = a_g["reference"];
      var obj_type = "genre";

      if(obj_type=="genre" && g_count>fav_genre_num){
        fav_genre = name;
        fav_genre_num = g_count;
      }

//collect top 2 and top 5 of any (they are ordered)

      if(n<2){
        top_two.push(name);
      }
      if(n<5){
        top_five.push(name);
        top_five_urls.push(url);
        top_five_current.push(g_count);
      }
      n = n+1;

    }//end genres

//favourite genre

    if(fav_genre_num>0){
       var pcpg = fav_genre_num*100;
       pcpg = pcpg.toFixed(2);
       result.push({"text":"Is your favourite interest (in "+pcpg+"% of things you've mentioned recently)", "type":"text", "value": fav_genre});
    }

//top 5
    var d1 = [];
    var tf = {};
    for(var c in top_five_current){
       d1.push([0,parseInt(c),top_five_current[c]]);
       tf[top_five[c]]=top_five_current[c]*100;
    }

//     result.push({"text":"Top 5 interests","type":"top_five","value":[d1,null,top_five]});
//alternative - pie

    result.push({"text":"Top "+top_five_current.length+" interests","type":"pie","value":tf});


//here call up slice and getNumberOfActivitiesByVerb and getNumberOfActivitiesByService

    get_activities(data,username,result);

}//end method




function get_activities(profile,username,result){
  var url = bc_url+"user/activities/"+username+"?apikey="+app_key;
      console.log(url);
      $.ajax({
        url:url,
        dataType: "json",
        type: "GET",
        success: function(data){
          render_activities(profile,data,result);
        },
        error: function(data){
          console.log("not ok 5 "+data["status"]+" "+data["message"]);
          alert("failed");
        }
      });
}




function render_activities(data,activities2,result){
console.log("RENDER ACTIVITUES");

  var schedule_hash = {};
  var got_already = []; //keeping track of duplicate activities

  var interests = data["object"]["interests"];


  var activities = {};
  var activities_interests = {};

//loop throug so we can sort them properly
  for(var i in interests){
    var ins = interests[i];
    var term = ins["reference"];
    term = term.replace(/.*\//,"");
    term = term.replace(/_/g," ");
    var acts = ins["activities"];
    for (var a in acts){
       var act = acts[a];
       var act2 = act["object"]["url"];
       var a_t = activities_interests[act2];
       if(a_t){
         a_t.push(term);
       }else{
         a_t = [];
         a_t.push(term);
         activities_interests[act2] = a_t;
       }
    }

  }


//ok reverse the activities2 array and loop through it
//reversing doesn't help if 2 sources
//need to sort by date

  var the_acts = activities2["object"];

  the_acts.sort(function(a, b) {
      a = a["context"]["date"];
      b = b["context"]["date"];

      return a > b ? -1 : (a < b ? 1 : 0);
  });


  var my_count = 0;

  for(var a in the_acts){
    var act = the_acts[a];

    var url = act["object"]["url"];
    var interests = activities_interests[url];
    
    var date = act["context"]["date"];
    var verb = act["verb"];
    var service = act["context"]["service"];
    var dd = act["context"]["date"];
    var text = act["object"]["text"];
    if(!text || text==""){
      text = act["object"]["name"];
    }

    var date = new Date(dd);
    var yr = date.getYear()+1900;
    var just_date = new Date(yr,date.getMonth(),date.getDate());

    var text_time = process_date(date);
 
    var val = schedule_hash[just_date];

          if(val){

            if($.inArray(url, got_already)==-1){
             val.push({"title":text,"link":url,"time":date,"texttime":text_time,"type":verb});
              got_already.push(url);
            }else{

            }
          }else{
//a new day
            var arr = [];
            arr.push({"title":text,"link":url,"time":date,"texttime":text_time,"type":verb});
            schedule_hash[just_date] = arr;
            my_count = my_count+1;
            got_already.push(url);
          }

//end loop thourgh acts

  }//end loop


  if(schedule_hash){
    result.push({"text":"What you've talked about recently","type":"activities_grouped","value":schedule_hash});
  }

console.log("thecallback");
console.log(result);

  thecallback(result);

}


//utility method - prettify the date

function process_date(then){

   var now = new Date();

   var a_week_ago = new Date();
   a_week_ago.setDate(a_week_ago.getDate() - 7);

   var date_text = "";

   if(then.getDate()==now.getDate() && then.getMonth()==now.getMonth() && then.getYear()==now.getYear()){
    var hrs = now.getHours() - then.getHours();

    var int_hrs = parseInt(hrs);
    if(int_hrs==0){
      var mins = now.getMinutes() - then.getMinutes();
      var int_mins = parseInt(mins);
      date_text = ""+parseInt(mins)+" minutes ago";
    }else{
      if(int_hrs ==1){
        date_text = ""+parseInt(hrs)+" hour ago";
      }else{
        date_text = ""+parseInt(hrs)+" hours ago";
      }
    }


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

