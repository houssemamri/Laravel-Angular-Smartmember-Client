var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.app.admin.pages.home",{
			url: "/home",
			templateUrl: "/templates/components/public/app/admin/pages/core/home/home.html",
			controller: 'specialPagesController',
			resolve: {
				$site_options: function( Restangular )
				{
					return Restangular.all( 'siteMetaData' ).customGETLIST( "getOptions", [ 'cap_icon', 'syllabus_text', 'search_lesson_text', 'module_text', 'course_info_text', 'lesson_text', 'begin_course_text', 'homepage_url' ] );
				}
			}
		})
}); 
