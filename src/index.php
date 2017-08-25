<?php
require_once("includes/php/functions.php");
?>

<HTML>
<HEAD>
<TITLE>Mihai Peteu</TITLE>
<meta http-equiv=Content-Type content="text/html;  charset=ISO-8859-1">

<link href='http://fonts.googleapis.com/css?family=Roboto:100,400,300,700' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Oxygen+Mono' rel='stylesheet' type='text/css'>

<link type="text/css" rel="stylesheet" href="includes/css/bootstrap.min.css" />
<link type="text/css" rel="stylesheet" href="includes/css/style.css" >
<link type="text/css" rel="stylesheet" href="includes/css/carousel.css" >
<link type="text/css" rel="stylesheet" href="includes/css/timeline.css" >

<script type="text/javascript" src="includes/js/jquery-1.11.0.min.js" /></script>
<script type="text/javascript" src="includes/js/jquery.mobile.custom.js" /></script>
<script type="text/javascript" src="includes/js/bootstrap.js" /></script>
<script type="text/javascript" src="includes/js/functions.js" /></script>
<!-- <script type="text/javascript" src="includes/js/timeline.js" /></script> -->

</HEAD>
<BODY>

<!-- NAVIGATION -->
<div class="navbar navbar-inverse navbar-fixed-top" >
  <div class="container">       
    <!-- COLLAPSIBLE NAVBAR   -->
    <div class="navbar" id="navbar">
          
      <ul class="nav navbar-nav navbar-left" id="navigation-options">
      <li><a href="http://mihaipet.eu">Home</a> 
        <li><a href="#projects" onclick='loadSection("projects");'>Projects</a>
        <li><a href="#photostream" onclick='loadSection("photostream");'>Photo Stream</a>    
        <li><a href="#talks" onclick='loadSection("talks");'>Talks & Slides</a>  
        <!-- <li><a href="#cycling" onclick='loadSection("cycling");'>Cycling</a>  -->  
        <li><a href="#notes" onclick='loadSection("notes");'>Notes</a> 
        <!-- OUTDOORS LIST =========================================================================== -->   	
        <li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown">Outdoors <span class="glyphicon glyphicon-chevron-down"></span></a>          
          <ul class="dropdown-menu" role="menu" id="outdoors-list">
    
            <script type="text/javascript"> 
              //  Populate Outdoors Photosets
              var outdoorsList = [ 
                { 'folder':'hikingdeathvalley', 'display':'Death Valley' },
                { 'folder':'runpdx', 'display':'Run PDX' },
                { 'folder':'oahu2014', 'display':'Hiking Oahu' }
                
                // { 'folder':'hikeoahu', 'display':'' }
              ];
              
              // menuList.foreach(printArray);
              
              for(var j = 0; j < outdoorsList.length; j++){
                var name 		= outdoorsList[j]['display'];
                var folder 	= outdoorsList[j]['folder'];
                var outdoors_list = document.getElementById("outdoors-list");       
                outdoors_list.innerHTML += 
                  '<li><a href="#outdoors-'+folder+'" onclick=\'loadAdventure("'+folder+'");\'>'
                      +name+'</a></li>';       
              } 
            
            </script>
    
          </ul>
        </li>
        <!-- OUTDOORS LIST  END ======================================================================== -->
         
      </ul>
    </div>
    <!-- / NAVBAR   -->
  </div>
</div>
 

<!- THIS IS THE MAIN CONTENT AREA -->
<div id="main-index">
  <div class="section">
  
    <div id="intro-block" class="">
  
      <div class="full_width">
        <div id="intro-links">
          <a href="http://www.linkedin.com/in/mihaipeteu"><img src="media/img/linkedin.png" class="padding-bottom"></a>
          <a href="media/mihai-peteu-resume.pdf"><img src="media/img/pdf-resume.png"></a>
          <!-- <a href="http://athlinks.com/athletes/jericho1ne/Profile"><img src="media/img/ath-race-results.png"></a>  -->   
        </div>
        <div id="intro-spacer" class="">&nbsp;</div>
      
        <img id="intro-image" src="media/team-mapei-master.jpg">
      </div>
  
      <div id="intro-text" class="">
        Hello.  I am a Full stack developer residing in Los Angeles.<br>
        <br>   
        I tell stories using still frames, moving pictures and plotted points, while keeping a focus on simplicity and usability.
        <br>
        
      </div>
  
    </div>
    
  </div>
</div> 

<script>
//=====================================================================
//  stuff to do upon page load
//	Mihai Peteu		2014.02.10
//=====================================================================
$( document ).ready(function() {
  console.log( "Page Loaded." );
 
  $( window ).resize(function() {
    var window_width = $(window).width() 
    console.log( "window width: " + window_width + " px" );
    
    if ( window_width < 600 ) {
      console.log( " *** " );
      $('#navbar').css( 'min-height', '220px' );
    }
  });

  
  //random bg image selector
  if (document.getElementById("main-index")) {
    var bg_img = leadingZero( Math.floor((Math.random() * 27) + 1) );			// total imgs minus 1
    $('#main-index').css('backgroundImage','url(media/backgrounds/'+bg_img+'.jpg)');
  }
	
	$('.dropdown').hover( function() {
			$(this).find('.dropdown-menu').first().stop(true, true).delay(0).slideDown(120);
		},
		function() {
		  $(this).find('.dropdown-menu').first().stop(true, true).delay(0).slideUp(60);
		}
	);

  // INITIALIZE CAROUSEL
	$(function(){
    $('.carousel').carousel({
      interval: 3500
    });
  });

  // CAROUSEL -- CONTROLLER ACTIONS
	$(window).bind("load resize slid.bs.carousel", function() {
	  var imageHeight = $(".active .holder").height();
	  $(".controllers").height( imageHeight );
	  //console.log("Slid "+imageHeight);
	});

  // CAROUSEL -- ARROW KEY NAVIGATION
	$(document).keydown( function(eventObject) {
		if(eventObject.which==37) {
			console.log("<<");
			$('#carousel-set').carousel('prev'); 
		} else if(eventObject.which==39) {
			console.log(">>");
			$('#carousel-set').carousel('next');
		}
	} );
	
	// CAROUSEL -- SWIPE NAVIGATION
	$("#carousel-set").swiperight(function() { $(this).carousel('prev');  });  
  $("#carousel-set").swipeleft(function() {  $(this).carousel('next');  });  

  // magic url hashtag parsing
	parseURL();		
  
  if ( $( "#ajax-content" ).length != 0 )      // if we are on the projects page
    $( "#ajax-content" ).load( "media/projects/visualization-live-shows/index.html" );
  
});
</script>

</BODY>
</HTML>

