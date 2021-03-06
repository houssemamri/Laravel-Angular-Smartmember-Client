var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.app.admin.members.pass",{
			url: "/pass/:id?",
			templateUrl: "/templates/components/public/app/admin/members/pass/pass.html",
			controller: "PassController"
		})
}); 

app.controller("PassController", function ($scope,smModal, $q, $stateParams, $rootScope , $localStorage, Restangular, toastr, $state) {
	$access_pass=null;
	if (!Modernizr.inputtypes.date) {
	  // no native support for <input type="date"> :(
	  // maybe build one yourself with Dojo or jQueryUI
	  $('input[type="date"]').datepicker();
	  $('input[type="date"]' ).datepicker( "option", "dateFormat", 'yy-mm-dd' );
	}
	$site = $rootScope.site;
	role=null;
		$scope.resolve = function(){
			$accessPassRequest=null;
			roleRequest=null;
			if( $stateParams.id )
			{
				$accessPassRequest = Restangular.one( 'siteRole', $stateParams.id ).get().then(function(response){
					$access_pass = response;
				});
			}
			$access_pass = { site_id: $site.id };

			roleRequest = Restangular.all( 'siteRole' ).customGET('', { site_id: $site.id } ).then(function(response){
				roles = response.items;
			});

			accessLevelRequest = Restangular.all( 'accessLevel' ).customGET('', { site_id: $site.id } ).then(function(response){
				access_levels = response;
			});

			if($accessPassRequest)
				$q.all([$accessPassRequest,roleRequest , accessLevelRequest]).then(function(response){
					$scope.init();
				});
			else
			{
				$q.all([roleRequest , accessLevelRequest]).then(function(response){
					$scope.init();
				});
			}
		}

		$scope.init = function (){
			if(!$access_pass.id){
				$access_pass.site_id = $rootScope.site.id;
				$access_pass.type = 'member';
			}
			$scope.access_pass = $access_pass;
			$scope.page_title = $scope.access_pass.id ? 'Edit Pass' : 'Grant New Pass';
			if($scope.access_pass.id)
			{
				if($scope.access_pass.expired_at)
					$scope.access_pass.expired_at = moment($scope.access_pass.expired_at).toDate();
				else
					$scope.access_pass.expired_at = "2030-01-20";
			}

			$scope.roles = _.uniq(roles, function(item, key, a) { 
				if(item && item.user)
			    	return item.user.email;
			});

			//$scope.roles = roles;
			$scope.access_levels = access_levels;
		}

		

	    $scope.select2 = function() {
	        $('[name=user_id]').select2();
	    }

		
		$scope.dateOptions = {
	        changeYear: true,
	        formatYear: 'yy',
	        startingDay: 1
	    }

	    $scope.format = 'yyyy-MM-dd';
	    $scope.minDate = new Date();

	    $scope.status = {
	        opened: false
	    };

	     $scope.open = function(event) {
	        $scope.status.opened = true;
	    }

		$scope.save = function(){
			if ($scope.access_pass.id){
				$scope.update();
			}else{
	            $scope.create();
	        }
		}

		$scope.update = function(){
			$scope.access_pass.put().then(function(response){
				$state.go("public.app.admin.members.passes");
	            toastr.success("Changes saved!");
			})
		}

		$scope.create = function(){
			Restangular.service("siteRole").post($scope.access_pass).then(function(response){
	            toastr.success("Access pass created!");
	            $state.go("public.app.admin.members.passes");
			});
		}
		$scope.resolve();
});