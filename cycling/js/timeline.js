//=========================================================================================
//		createTimeline ( events )
//		Concatenate all events data into one HTML string
//=========================================================================================
function createTimeline ( events ) {
	var events_html_content = '';

 	console.log("EVENTS BELOW");
 	console.log(events);
	
	//var events = JSON.parse(eventsArray);
	var prev_year = "";
	
	var timeline = document.getElementById("cycling-timeline");
	
	for(var j = 0; j < events.length; j++) {
		var year 	= events[j]['year'];
	  var file 	= events[j]['file'];
	  var title = events[j]['title'];
	  var desc 	= events[j]['desc'];
	  var li_class = "event";
	  
	  if (prev_year != year) {		// set first item to be the Active one
	  	events_html_content += '<li class="year">'+year+'</li>';
	  	li_class = "event offset-first";
	  }	
	 
 		events_html_content += '<li class="'+li_class+'"><h3>'+title+'</h3>';
 		
 		if (file != "") 
 			events_html_content += '<img src="images/'+file+'">';
 			
 		events_html_content += '<p>'+desc+'</p></li>';
 		prev_year = year;
	}   

	timeline.innerHTML = events_html_content;   
}
