//get actvities

var c_callback = null;

function get_activities(username,callback){
  c_callback = callback;
  var url = bc_url+"user/profile/"+username+"?apikey="+app_key;
//  $("#activities").attr("src",url);
      $.ajax({
        url:url,
        dataType: "json",
        type: "GET",
        success: function(data){
          render_activities(data);
        },
        error: function(data){
          console.log("not ok 3 "+data["status"]+" "+data["message"]);
          alert("failed");
        }
      });


}
