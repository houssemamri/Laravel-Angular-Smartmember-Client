var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.app.admin.helpdesk",{
			url: "/helpdesk",
			templateUrl: "/templates/components/public/app/admin/helpdesk/helpdesk.html",
			controller: "SiteHelpdeskController"
		})
}); 

app.controller("SiteHelpdeskController", function ($scope) {
// alert('asd');
});