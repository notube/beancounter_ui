==Getting started==

* open "notube_logs/analytics.html#2012-02-04" in a modern 
browser from the desktop e.g. 
file:///Users/libby/notube_logs/analytics.html#2012-02-04

* you should see some pretty graphs showing what we've been doing on irc lately


==Background==

It's designed to show you some basic graphs and data summarising some sort 
of activity. It was designed to be used with social networking activity 
but here we've applied it to some other ideas. The design is by 
http://fabrique.nl from a brief by vicky.buser@bbc.co.uk

Because it has applications with various datasets I've created several 
abstractions over the graphs. The raw data (from logs, or hansard or 
wherever) is processed in a separate customised javascript file. The 
result of that is passed to the html file 'analytics.html' which is 
basically reuseable for lots of different situations.

Some of these abstractions are less abstract than others. I had trouble 
characteristing piecharts and the top two and top five types.


==Types of analytic==

* number -> a number
* text -> a piece of text
* text_list -> several words 
* actvities_list -> titles and links attached to datetime
* actvities_grouped -> titles and links grouped by datetime
* hourly_count -> number of something per hour
* pie -> pie chart
* top_two -> line graph for most frequent items now, plotted over last 5 months
* top_five -> horizontal stacked bar chart for most frequent items now and a month ago

Examples:

* number

  result.push({"text":"Televison minutes in the last two weeks", 
"type":"numeric", "value": 24});

* text

  result.push({"text":"Is your favourite genre (in 10% of all programmes 
you watched)", "type":"single_text", "value": "Soaps"});

* text_list

  result.push({"text":"Things you talked 
about","type":"text_list","value":["Pater Gabriel", "RAI Team", "Franz 
Ferdinand"]})

* activities_list

  result.push({"text":"What you've watched or listened to 
recently","type":"activities_list",
    "value":{
      "link": "http://www.bbc.co.uk/programmes/b007jnd9",
      "texttime": "Friday, 27 January 2012",
      "time": Fri Jan 27 2012 15:58:27 GMT+0000 (GMT),
      "title": "Charles Dickens - Barnaby Rudge"
     },{},{}]...
   });


* actvities_grouped

  result.push({"text":"What you've watched or listened to 
recently","type":"activities_grouped",
    "value":{Fri Jan 27 2012 00:00:00 GMT+0000 (GMT):
     [
      "link": "http://www.bbc.co.uk/programmes/b007jnd9",
      "texttime": "Friday, 27 January 2012",
      "time": Fri Jan 27 2012 15:58:27 GMT+0000 (GMT),
      "title": "Charles Dickens - Barnaby Rudge"
     ],
     []...
   }});


* hourly_count (array index represents the hour)

    result.push({"text":"When you watch and 
listen","type":"hourly_count","value":
     [5: 1,6: 1, 7: 2, 8: 2, 9: 3,10: 1,12: 2,13: 5,14: 2,15: 1]
    });

* pie

  result.push({"text":"Favourite Programmes","type":"pie","value":{
     "Ambridge Extra": 44,"Ballylenon": 28,"Book of the Week": 26,
   }
  });


* top_two (optimised for the graph display, so perhaps a bit confusing)

  result.push({"text":""Top 2 interests this 
month","type":"top_two","value":[[],[],[],[]]});

 * four arrays, the first two are the data for the  two interests, third is a list of the names for the data, and fourth is a list of the month names
   for the data arrays:
    0: y (maps to name)
    1: x (maps to month name)


* top_five (optimised for the graph display, so perhaps a bit confusing)
  The idea is to comare the frequency of an item over 5 months
 
  result.push({"text":""Top 5 interests this 
month","type":"top_five","value":[[],[],[]]});

 * three arrays - the first two represent the data, respectively the 
current month and the last month, the third is list of names of the items.
   * the data arrays are themsleves arays of 3 items each: 
    0: the y coordinate (mapped to names array)
    1: the x-starting coordinate
    y: the x-ending coordinate

