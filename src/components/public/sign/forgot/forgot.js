var app = angular.module( "app" );

app.config( function( $stateProvider )
{
	$stateProvider
		.state( "public.sign.forgot", {
			url: "/forgot",
			templateUrl: "/templates/components/public/sign/forgot/forgot.html",
			controller: 'ResetController'
		} )
} );

app.controller( 'ResetController', function( $rootScope, $scope, $localStorage, $stateParams, $location, Restangular, $state, $http, toastr )
{
	var auth = Restangular.all( 'auth' );
	$rootScope.is_admin = true;
	$rootScope.page_title = "Smartmember - Password Reset";
	$scope.data = {};

	$site = $rootScope.site;

    if( $rootScope.site ) {
        $site_options = $rootScope.site.meta_data;
        $scope.site_options = {};
        $.each($site_options, function (key, data) {
            $scope.site_options[data.key] = data.value;
        });
    }
    
	if ($location.search().error_message)
	{
		if( $location.search().error_message == "inprocess registration" )
		{
			$scope.inprocess_register = true;
		}
	}

	if( $rootScope.$_GET[ 'reset_hash' ] )
	{
		$scope.hash = $rootScope.$_GET[ 'reset_hash' ];
	}

	$scope.reset = function( password )
	{
		auth.customPOST( { reset_token: $scope.hash, password: password }, 'reset' ).then( function( data )
		{
			if( data.message && data.message == "no such email found" )
			{
				toastr.error( "The email you specified does not exist" );
			}
			else
			{
				$scope.message = data.message;
				$state.go( 'public.sign.in' );
			}

		} );
	}

	$scope.forgot = function( reset_email )
	{
		auth.customPOST( { email: $scope.data.reset_email }, 'forgot' ).then( function( data )
		{
			if( data.message && data.message == "no such email found" )
			{
				toastr.error( "The email you specified does not exist" );
			}
			else
			{
				//( 'public.sign.in', { reset: 1 } );
				$state.go( 'public.sign.in' ); // what is reset:1 for above?
				$scope.message = data.message;
			}
		} );
	}

	$scope.init = function()
	{
		$scope.hash = $stateParams.hash;
	}

} );