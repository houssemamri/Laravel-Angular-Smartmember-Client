var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("admin.team.email.emails",{
			url: "/emails",
			templateUrl: "/templates/components/admin/team/email/emails/emails.html",
			controller: "EmailsController",
			resolve: {
				emails: function(Restangular , $site){
					return Restangular.all('email').getList();
				}
			}
		})
}); 

app.controller("EmailsController", function ($scope, $localStorage,$state, $modal, Restangular, toastr, $site, emails , $user) {

	$scope.blockCalls=false;
	$scope.processingCall=false;
	$scope.emails=emails;
	$scope.query = '';
	$scope.currentPage = 1;

	$scope.hasAccess=function(role)
	{
	    if( typeof role == 'undefined' )
	        role = $user.role;

	    for (var i = role.length - 1; i >= 0; i--) {
	        var Manager = _.findWhere(role[i].type ,{role_type : 3});
	        if( !Manager )
	            Manager = _.findWhere(role[i].type ,{role_type : "3"});
	        var Owner = _.findWhere(role[i].type ,{role_type : 2});
	        if( !Owner )
	            Owner = _.findWhere(role[i].type ,{role_type : "2"});
	        var PrimaryAdmin = _.findWhere(role[i].type ,{role_type : 1});
	        if( !PrimaryAdmin )
	            PrimaryAdmin = _.findWhere(role[i].type ,{role_type : "1"});
	        if(Manager || Owner || PrimaryAdmin){
	            return true;
	        }
	    }
	    return false;
	}

	var access = $scope.hasAccess($user.role);
	if($state.current.name.split('.')[1]=='smartmail'){
	    console.log(access)
	    if(!access ){
	        $state.go('admin.account.memberships');
	    }
	}

	$scope.loadMore =function()
	{
	    if(!$scope.blockCalls&&!$scope.processingCall)
	    {
	        $scope.processingCall=true;
	        $params = {'p':++$scope.currentPage, company_id: $site.company_id};
	        
	        if ($scope.query) {
	            $params.q = $scope.query;
	        }

	        Restangular.all('email').getList($params).then(function($response){
	            $scope.emails=$scope.emails.concat($response);
	            if($response.length==0)
	                $scope.blockCalls=true;
	            $scope.processingCall=false;
	        });
	    }
	    else
	        return;
	}

	$scope.search= function()
	{
	    
	    $scope.emails = [];
	    $scope.currentPage = 0;
	    var $params = { company_id: $site.company_id , p : ++$scope.currentPage};

	    if ($scope.query){
	        $params.q = $scope.query;
	    }

	    Restangular.all('email').getList($params).then(function(data){
	        for (var i = data.length - 1; i >= 0; i--) {
	            var match = _.findWhere($scope.emails ,{id : data[i].id});
	            if(!match)
	                $scope.emails.push(data[i]);
	        };
	        if(data.length==0) {
	            $scope.emails = [];
	            $scope.blockCalls = true;
	        } else {
	            $scope.blockCalls = false;
	        }
	        
	    } , function(error){
	        $scope.emails = [];
	    })
	}

	$scope.formatDate = function ($unformattedDate){
	    return moment($unformattedDate).format("ll");
	}

	$scope.copyToClipBoard = function ($url) {
	    $uri = 'http://' + $scope.$location.host()+'/register/'+$url;
	    return $uri;
	}

	$scope.delete = function (email_id) {
	    var modalInstance = $modal.open({
	        templateUrl: '/templates/modals/deleteConfirm.html',
	        controller: "modalController",
	        scope: $scope,
	        resolve: {
	            id: function () {
	                return email_id;
	            }
	        }
	    });
	    modalInstance.result.then(function () {
	        var emailWithId = _.find($scope.emails, function (email) {
	            return email.id === email_id;
	        });

	        emailWithId.remove().then(function () {
	            $scope.emails = _.without($scope.emails, emailWithId);
	        });
	    })
	};
});