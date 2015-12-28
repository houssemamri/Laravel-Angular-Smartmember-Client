<?php
header( 'Access-Control-Allow-Origin: *' );

include_once( 'php/functions.php' );

DetectAndPerformBridgePageThings();
?>
<!DOCTYPE html>

<html ng-app='app' class="no-js {{$state.current.name.split('.').join(' ')}}"  ng-controller="IndexAppController" ng-init="home_init()">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">

	<base href="/"></base>

	<title>Smart Member</title>
	<meta name="description" content="">

	<!-- <link rel="stylesheet" href="bower/ui-iconpicker/dist/styles/ui-iconpicker.min.css"> -->
	<!-- <link rel="stylesheet" href="bower/font-awesome/css/font-awesome.min.css"> -->
	<link rel="stylesheet" href="css/vendor.min.css">
	<link rel="stylesheet" href="bower/footable/css/footable.core.css">
	<link rel="stylesheet" href="css/main.min.css">
	<link rel="shortcut icon" href="{{options.favicon}}" type="image/x-icon">
</head>
<body resize class="fixed-nav {{$root.admin_nav_open ? 'nav_open' : 'nope'}} {{viewport}} {{options.theme || 'default'}} {{$state.current.data.specialClass}} {{IsWidescreen() ? 'widescreen' : ''}}" landing-scrollspy id="page-top">

<div class="ui top sidebar top_sidebar_contents" ><ng-include src="top_sidebar_contents"></ng-include></div>
<div class="ui sidebar vertical menu left left_sidebar_contents" ><ng-include src="left_sidebar_contents"></ng-include></div>
<div id="wrapper" class="pusher" ui-view></div>

<script src="js/vendor.min.js"></script>
<script src="js/main.min.js"></script>

<!-- <script src="bower/ui-iconpicker/dist/scripts/ui-iconpicker.min.js"></script> -->
<!-- <script src="bower/slimScroll/jquery.slimscroll.min.js"></script> -->
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.6/semantic.js"></script>
<!--script src="js/library.min.js"></script-->
<!-- <script type="text/javascript" src="bower/Flot/jquery.flot.resize.js"></script> -->
<!-- <script type="text/javascript" src="//cdn.jsdelivr.net/jquery.flot/0.8.3/jquery.flot.min.js"></script> -->
<!--<script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.14.3/ui-bootstrap.min.js'></script>-->
<!--script type="text/javascript" src="https://angular-ui.github.io/bootstrap/ui-bootstrap-tpls-0.14.3.min.js"></script-->

</body>
</html>