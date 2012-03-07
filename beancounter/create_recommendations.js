//get the profile and do something with it
//needs decrufting

var c_callback = null;

function get_recommendations(username,callback){
  c_callback = callback;
  var url = n_screen_api_root+"profile?url="+bc_url+"user/profile/"+username+"?apikey="+app_key;
////
console.log(url);
    $.ajax({
      url: url,
      dataType: "json",
      success: function(data){
        recommendations(data,"recs_items");
      },
      error: function(jqXHR, textStatus, errorThrown){
      //console.log("nok "+textStatus);
      }

    });

}

function recommendations(result,el){

   if(result){
          var suggestions = result["suggestions"];
          if(!suggestions){
            suggestions = result["results"];
          }
          var pid_title = result["title"];
          if(suggestions.length==0){
//
          }else{

            //order according to number
            suggestions.sort(sortfunction)
            $("#spinner").empty();

            //print
            var html = [];
            for(var r in suggestions){
                  var id = suggestions[r]["id"];
                  if(!id){
                    id = suggestions[r]["pid"];
                  }

                  html.push(generate_html_for_programme(suggestions[r],false,id).join("\n"));
            }

            $("#"+el).html(html.join("\n"));

          }
    }else{

//console.log("OOPS!");

    }
}


//sorting function - sort by number
function sortfunction(a, b){
  //Compare "a" and "b" in some fashion, and return -1, 0, or 1
  var n1 = a["number"];
  var n2 = b["number"];
  return (n2 - n1);
}


//create html from a programme
function generate_html_for_programme(j,n,id){

      var pid=j["pid"];
      var video = j["video"];
      var title=j["title"];
      if(!title){
         title = j["core_title"];
      }
      var img=j["image"];
      if(!img){
        img=j["depiction"];
      }
      var manifest=j["manifest"];
      var more=j["more"];
      var explanation=j["explanation"];
      var desc=j["description"];
      var classes= j["classes"];
      var is_live = false;
      if(j["live"]==true || j["live"]=="true" || j["is_live"]==true || j["is_live"]=="true"){
        is_live = true;
      }
      var service = j["service"];
//@@not sure about this
      var channel = j["channel"];
      if(channel && is_live){
        img = "channel_images/"+channel.replace(" ","_")+".png";
      }


      var html = [];
      html.push("<div id=\""+id+"\" pid=\""+pid+"\"");
      html.push(" is_live=\""+is_live+"\"");

      if(video){
        html.push("  href=\""+video+"\"");
      }
      if(service){
        html.push("  service=\""+service+"\"");
      }
      if(manifest){
        html.push("  manifest=\""+manifest+"\"");
      }
      if(classes){
        html.push("class=\""+classes+"\">");
      }else{
        html.push("class=\"ui-widget-content button programme open_win\">");
      }
      html.push("<div class='img_container'><img class=\"img\" src=\""+img+"\" />");
      html.push("</div>");
      if(is_live){
       html.push("Live: ");

      }else{
      }
      html.push("<span class=\"p_title p_title_small\"><a href='http://www.bbc.co.uk/programmes/"+pid+"'>"+title+"</a></span>");
      html.push("<br /><div clear=\"both\"></div>");
      if(n){
        html.push("<span class=\"shared_by\">Shared by "+n+"</span>");
      }
      if(desc){
        html.push("<span class=\"description large\">"+desc+"</span>");
      }

      if(explanation){

        //string.charAt(0).toUpperCase() + string.slice(1);
        explanation = explanation.replace(/_/g," ");
        var exp = explanation.replace(/,/g," and ");

        html.push("<br /><span class=\"explain_small\">Matches <i>"+exp+"</i> in your Beancounter profile</span>");

      }
      html.push("</div>");
      return html
}
