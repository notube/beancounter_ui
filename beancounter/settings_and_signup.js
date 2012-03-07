
function send_to_login_signup(){
  document.location="signup.html";
}


function send_to_analytics(){
  document.location="analytics.html";
}

function send_to_interests(){
  document.location="interests.html";
}


///add services


function send_to_service(service){


 if(!username){
  alert("no username");
 }else{

   if(service=="twitter"){
     var url =bc_url+"user/oauth/token/twitter/"+username+"?redirect=http://"+return_part+"settings.html";
     document.location=url;
   }else if(service=="facebook"){
     var url =bc_url+"user/oauth/token/facebook/"+username+"?redirect=http://"+return_part+"settings.html";
     document.location=url;
   }else if(service=="lastfm"){
     var url ="http://www.last.fm/api/auth/?api_key=9f57b916d7ab90a7bf562b9e6f2385f0&cb="+bc_url+"user/auth/callback/lastfm/"+username+"/"+encodeURIComponent(encodeURIComponent(return_part+"settings.html"));
     document.location=url;

   }else{
     alert("not implemented yet "+service);
   }

 }


}


function write_data_sources(data){
  console.log(data);

  var all_services = ["facebook","twitter","lastfm","gomiso"];
  var services = data["object"]["services"];


  for (var s in all_services){
     var ss = all_services[s];
console.log("ss");
console.log(ss);
console.log(services[ss]);

     if(services[ss]){

       $("#"+ss).find(".grey").html("Added");
       $("#"+ss).find(".grey").show();
       $("#"+ss).find(".blue").html("Remove");
       $("#"+ss).unbind('click');
       $("#"+ss).click(function() {
        var pid = $(this).attr("id");
        remove_service(pid);
        return false;
       })
     }else{
       $("#"+ss).unbind('click');
       $("#"+ss).click(function() {
        var pid = $(this).attr("id");
        send_to_service(pid);
        return false;
       })

     }

  }


}






function really_remove_service(service_id){

    close_lightbox()
    var url = bc_url+"user/source/"+username+"/"+service_id+"?apikey="+app_key;
    console.log(url);

      $.ajax({
        url:url,
        dataType: "json",
        type: "DELETE",
        success: function(data){
           service_removal_result(data,service_id);
        },
        error: function(data){
          console.log("not ok delete "+data["status"]+" "+data["responseText"]);
          alert("failed");
        }
      });

}

function service_removal_result(data,service_id){
  console.log(data);
  console.log(service_id);
  if(data["status"]=="OK"){
       $("#"+service_id).find(".grey").html("Removed");
       $("#"+service_id).find(".grey").show();
       $("#"+service_id).find(".blue").html("Add again");
       $("#"+service_id).unbind('click');
       $("#"+service_id).click(function() {
        var pid = $(this).attr("id");
        send_to_service(pid);
        return false;
       });
  }
}



function logout(){
  localStorage.removeItem("creds");
  document.location="signup.html";
}

function export_data(){
  alert("export here");
}

function delete_data(){
  show_lightbox();
}


function really_delete(){

    var url = bc_url+"user/"+username+"?apikey="+app_key;
    console.log(url);

      $.ajax({
        url:url,
        dataType: "json",
        type: "DELETE",
        success: function(data){
          console.log(data);
          alert("deleted");
        },
        error: function(data){

          console.log("problems with browsers say its failed but in most cases it hasn't checking...");

          if(data["responseText"]["status"]=="OK"){
            console.log("logging out");
            logout();
          }else{
            console.log("NOT OK");
            console.log(data["responseText"]);
            console.log(Object.prototype.toString.call(data["responseText"]));
//yuck. seems to be sending back a String
//hack - see if we can fix later
            var res = data["responseText"];
            if(res.match("OK") && (!res.match("NOK"))){
               logout();
            } 

          }

        }
      });

}



function remove_service(serv){
  show_delservicebox(serv);
}



//show the lightbox popup

function show_delservicebox(serv){
console.log("showing del service box "+serv);
  ////here
  //todel deltext
  $("#todel").click(function(){
    really_remove_service(serv);
  });
  $("#deltext").html("Are you sure you really want to delete "+serv+" from your account?");
  $("#delservice").show();
  $("#bg").show();

}


function show_lightbox(){
console.log("showing lightbox");
  $("#lightbox").show();
  $("#bg").show();

}

function close_lightbox(){
  $(".lightbox").hide();
  $("#bg").hide();
}

function show_step1(){
  $("#step1").addClass("selected");
  $("#step2").removeClass("selected");
  $("#step3").removeClass("selected");
  $("#data_sources").show();
  $("#privacy").hide();
  $("#export").hide();

}
function show_step2(){
  $("#step1").removeClass("selected");
  $("#step2").addClass("selected");
  $("#step3").removeClass("selected");
  $("#data_sources").hide();
  $("#privacy").show();
  $("#export").hide();

}
function show_step3(){
  $("#step1").removeClass("selected");
  $("#step2").removeClass("selected");
  $("#step3").addClass("selected");
  $("#data_sources").hide();
  $("#privacy").hide();
  $("#export").show();
}
