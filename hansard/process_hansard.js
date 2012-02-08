
   var thedate = window.location.hash;

   function init(callback){
      if(thedate && thedate!=""){
        thedate = thedate.replace("#","");
      }else{
        var dd = new Date();
        var yy = dd.getYear()+1900;
        var mm = dd.getMonth()+1;
        var dd = dd.getDate();
        if(mm<10){
          mm="0"+mm;
        }
        if(dd<10){
          dd="0"+dd;
        }
        thedate = yy+"-"+mm+"-"+dd;
      }

      var url = "../stopList.txt";
      $.ajax({
          type: "GET",
          url: url,
          dataType: "text",
          success: function(data){
            process_stoplist(data,callback);
          },
          error: function(jqXHR, textStatus, errorThrown){
          ////alert(textStatus);//fixme - json is coming out not xml
          }
      });


   }

   var stoplist = {};
//change to process members list
   function process_stoplist(data,callback){

      var arr = data.split("\n");
      console.log(arr.length);
      for(var a in arr){
        var w = arr[a];
        if(w && w!=""){
          w = w.toLowerCase();
          stoplist[w]=w;
        }
      }

      var url = "debates2012-02-06a.xml";
      console.log(url);

      $.ajax({
          type: "GET",
          url: url,
          dataType: "xml",
          success: process_file,
          success: function(data){
            process_file(data,callback);
          },
          error: function(jqXHR, textStatus, errorThrown){
          ////alert(textStatus);//fixme - json is coming out not xml
          }
      });

   }


   function process_file(xml,callback){

      var result = [];
      var people = {};
      var most_talkative = 0;
      var most_talkative_person = null
      var num_lines = 0;
      var links = [];
      var all_hours = null;
      var words = {};
      var words_arr = [];
      var entities = {};
      all_hours = [];

      $(xml).find("speech").each(function(){
         num_lines = num_lines +1;
         var person = $(this).attr("speakername");
         var time = $(this).attr("time");
         var line = $(this).find("p").text();

         var p = people[person];
         if(p){
             people[person] = parseInt(p)+1;
         }else{
             people[person] = 1;
         }

         var parts = time.match(/(\d+)/g);
         time = new Date(parts[0], parts[1], parts[2]); // 
         text_time = process_date(time);
         var hr = ""+parts[0];
         hr = hr.replace(/^0/,"");
         hr = parseInt(hr);
         var num = all_hours[hr];

         if(num){
           num=num+1
         }else{
           num = 1;
         }
         all_hours[hr]=num;


//look for words
         var lc_line = line.toLowerCase();

         var w = lc_line.split(" ");
         words_arr = words_arr.concat(w);

//look for entities

          var splits = line.split(/(([A-Z]+[a-z]*[ |,|.|'|:|"]){2,})/);
          if(splits.length>1){
            var e = splits[1];
            e = e.replace(/ $/,"");
            e = e.replace(/[ |,|.|'|:|"]$/,"");
            if(e && e!=""){
              var ee = entities[e];
              if(ee){
                entities[e] = parseInt(ee)+1;
              }else{
                entities[e] = 1;
              }

//              entities.push(e);
            }
         }

      });


      for(var p in people){
        if(people[p]>most_talkative){
           most_talkative = people[p];
           most_talkative_person = p; 
        }
      }
console.log(people);

      var tuples = [];

      for (var key in people) tuples.push([key, people[key]]);

      tuples.sort(function(a, b) {
       a = a[1];
       b = b[1];

       return a > b ? -1 : (a < b ? 1 : 0);
      });

      var new_people = {};

      for (var i = 0; i < 10; i++) {
        var key = tuples[i][0];
        var value = tuples[i][1];
        if(value>1){
          new_people[key]=value;
        }
      }


//entities

      var tuples = [];

      for (var key in entities) tuples.push([key, entities[key]]);

      tuples.sort(function(a, b) {
       a = a[1];
       b = b[1];

       return a > b ? -1 : (a < b ? 1 : 0);
      });

      var new_entities = [];

      for (var i = 0; i < 20; i++) {
        var key = tuples[i][0];
        var value = tuples[i][1];
        if(value>1){
          new_entities.push(key);
        }
      }

console.log("new_entities");
console.log(new_entities);

//process words
      for(var w in words_arr){
           var word = words_arr[w];
           word = word.replace(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/,"");
           if(word!="" && word.match(/\w+/) && (!word.match(/^http/))){
             var p = words[word];
             var new_word = word.replace(/^</,"");
             new_word = new_word.replace(/>$/,"");
             if(!people[new_word] && (!stoplist[new_word])){           
               if(p){
                 words[word] = parseInt(p)+1;
               }else{
                 words[word] = 1;
               }
             }
           }
      }

      links = links.reverse();

      var tuples = [];
 
      for (var key in words) tuples.push([key, words[key]]);

      tuples.sort(function(a, b) {
       a = a[1];
       b = b[1];

       return a > b ? -1 : (a < b ? 1 : 0);
      });

      var new_words = {};

      for (var i = 0; i < 10; i++) {
        var key = tuples[i][0];
        var value = tuples[i][1];
        if(value>1){
          new_words[key]=value;
        }
      }


      result.push({"text":"Most talkative person: made "+most_talkative+" speeches","type":"text","value":most_talkative_person});
      result.push({"text":"Speeches","type":"number","value":num_lines});
      result.push({"text":"Number of words in total","type":"number","value":words_arr.length});
      result.push({"text":"Who's been talking","type":"pie","value":new_people});
      result.push({"text":"Most mentioned words","type":"pie","value":new_words});
      result.push({"text":"What time the speeches took place","type":"hourly_count","value":{"Speeches":all_hours}});
      result.push({"text":"Things talked about","type":"text_list","value":new_entities});
console.log(result);

      callback(result);
   }


  function process_date(then){
   var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

   var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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
