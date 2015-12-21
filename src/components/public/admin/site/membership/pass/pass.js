var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.admin.site.membership.pass",{
			url: "/pass/:id?",
			templateUrl: "/templates/components/public/admin/site/membership/pass/pass.html",
			controller: "PassController"
		})
}); 

app.controller("PassController", function ($scope,smModal, $stateParams, $rootScope , $localStorage, Restangular, toastr, $state) {
	$access_pass=null;
	role=null;
		$scope.resolve = function(){
			$accessPassRequest=null;
			roleRequest=null;
			if( $stateParams.id )
			{
				$accessPassRequest = Restangular.one( 'pass', $stateParams.id ).get().then(function(response){
					$access_pass = response;
				});
			}
			$access_pass = { site_id: $site.id };

			roleRequest = Restangular.all( 'role' ).customGET('', { site_id: $site.id } ).then(function(response){
				roles = response;
			});

			if($accessPassRequest)
				$q.all([$accessPassRequest,roleRequest]).then(function(response){
					$scope.init();
				});
			else
			{
				$q.all([$accessPassRequest]).then(function(response){
					$scope.init();
				});
			}
		}

		$scope.init = function (){
			if(!$access_pass.id){
				$access_pass.site_id = $rootScope.site.id;
			}
			$scope.access_pass = $access_pass;
			$scope.page_title = $scope.access_pass.id ? 'Edit Pass' : 'Grant New Pass';
			if($scope.access_pass.id)
				$scope.access_pass.expired_at = moment($scope.access_pass.expired_at).toDate();
			$scope.roles = roles.items;
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
				smModal.Show("public.admin.site.membership.passes");
			}else{
	            $scope.create();
	        }
		}

		$scope.update = function(){
			$scope.access_pass.put().then(function(response){
	            toastr.success("Changes saved!");
			})
		}

		$scope.create = function(){
			Restangular.service("pass").post($scope.access_pass).then(function(response){
	            toastr.success("Access pass created!");
	            smModal.Show("public.admin.site.membership.passes");
			});
		}
		$scope.resolve();
});