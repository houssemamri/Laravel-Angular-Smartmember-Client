var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.app.blog",{
			url: "/blog",
			templateUrl: "/templates/components/public/app/blog/blog.html",
			controller: "BlogController"
		})
}); 

app.controller( 'BlogController', function( $scope, $rootScope, $localStorage, Restangular, $site, notify )
{
	$scope.posts = [];
	$scope.loading=true;
	Restangular.all( 'post' ).getList( { 'site_id': $site.id } ).then( function( response )
	{
		$scope.loading=false;
		$scope.posts = response;
	} );
} );