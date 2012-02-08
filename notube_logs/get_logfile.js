
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

   function process_stoplist(data,callback){
      var arr = data.split("\n");
      console.log(arr.length);
      for(var a in arr){
        var w = arr[a];
        if(w && w!=""){
          stoplist[w]=w;
        }
      }


      var url = "http://dev.notu.be/2011/01/notubot/"+thedate+".txt";
      console.log(url);

      $.ajax({
          type: "GET",
          url: url,
          dataType: "text",
          success: process_file,
          success: function(data){
            process_file(data,callback);
          },
          error: function(jqXHR, textStatus, errorThrown){
          ////alert(textStatus);//fixme - json is coming out not xml
          }
      });


   }


   function process_file(data,callback){
      var arr = data.split("\n");
      console.log(arr.length);

      var result = [];
      var people = {};
      var most_talkative = 0;
      var most_talkative_person = null
      var num_lines = arr.length;
      var links = [];
      var all_hours = null;
      var words = {};
      var words_arr = [];
      var entities = [];
      all_hours = [];

      for(var a in arr){


//look for people
         var line = arr[a]+" ";//extra space to make regexes easier
         var person = "";
         var time;
         var text_time;

         var regex = new RegExp(/<(.*?)>/)
         var match = regex.exec(line);

         if(match){
           person = match[1];
           var p = people[person];
           if(p){
             people[person] = parseInt(p)+1;
           }else{
             people[person] = 1;
           }
         }


//find the date
         var regex2 = new RegExp(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d /);
         var match2 = regex2.exec(line);

         if(match2){
           var tt = match2[0];
           var parts = tt.match(/(\d+)/g);
           time = new Date(parts[0], parts[1]-1, parts[2],parts[3],parts[4],parts[5]); // months are 0-b$
           text_time = process_date(time);
           var hr = ""+parts[3];
           hr = hr.replace(/^0/,"");
           hr = parseInt(hr);
           var num = all_hours[hr];


           if(num){
             num=num+1
           }else{
             num = 1;
           }
           all_hours[hr]=num;

         }

//look for links
         var regex3 = new RegExp(/ (https?:\/\/.*?)[\n| |$]/)
         var match3 = regex3.exec(line);
         if(match3){
           var link = match3[1];
           var title = line.replace(link,"");
           title = title.replace(/.*>/,"");
           title = title.replace(/ $/,"");
           if(title=="" || title==" "){
             title = "Link from "+person; 
           }else{
             var match4 = regex3.exec(title);//sometimes the text itself can contain links, which muck up teh formatting
             if(match4 && match4.length>1){
              title = title.replace(match4[1],"http://... ");
             }
             title = person+":"+title; 

           }
           links.push({"link":link,"title":title,"time":time,"texttime":text_time});
         }

//look for words

         var w = line.split(" ");
         words_arr = words_arr.concat(w);

//look for entities

          var splits = line.split(/(([A-Z]+[a-z]*[ |,|.|'|:|"]){2,})/);
          if(splits.length>1){
            var e = splits[1];
            e = e.replace(/ $/,"");
            e = e.replace(/[ |,|.|'|:|"]$/,"");
            if(e && e!=""){
              entities.push(e);
            }
          }
      }
      for(var p in people){
        if(people[p]>most_talkative){
           most_talkative = people[p];
           most_talkative_person = p; 
        }
      }

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



//console.log(new_words);

      result.push({"text":"Most talkative person: wrote "+most_talkative+" lines of text","type":"text","value":most_talkative_person});
      result.push({"text":"Lines of text were written","type":"number","value":num_lines});
      result.push({"text":"Number of links","type":"number","value":links.length});
      result.push({"text":"Number of words in total","type":"number","value":words_arr.length});
      result.push({"text":"Who's been talking","type":"pie","value":people});
      result.push({"text":"Most mentioned words","type":"pie","value":new_words});
      result.push({"text":"Today's links","type":"activities_list","value":links});
      result.push({"text":"When you talk","type":"hourly_count","value":{"Lines of text":all_hours}});
      result.push({"text":"Things you talked about","type":"text_list","value":entities});

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
