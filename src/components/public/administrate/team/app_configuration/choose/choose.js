var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.administrate.team.integration.choose",{
			url: "/choose",
			templateUrl: "/templates/components/public/administrate/team/app_configuration/choose/choose.html",
			controller: "app_configurationsController"
		})
}); 