var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.administrate.team.app_configurations.connections",{
			url: "/connections",
			templateUrl: "/templates/components/public/administrate/team/app_configurations/connections/connections.html",
			controller: "app_configurationsController"
		})
});