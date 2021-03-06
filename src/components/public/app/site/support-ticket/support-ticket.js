var app = angular.module( "app" );

app.config( function( $stateProvider )
{
	$stateProvider
		.state( "public.app.site.support-ticket", {
			url: "/support-ticket",
			templateUrl: "/templates/components/public/app/site/support-ticket/support-ticket.html",
			controller: "PublicSupportTicketController"
		} )
} );

app.controller( 'PublicSupportTicketController', function( $scope, $site, Upload, $rootScope, $localStorage, $state, RestangularV3, $stateParams, $filter, Restangular, toastr )
{
	$scope.ticket = {};
	$rootScope.page_title = $rootScope.site.name + ' - Leave a Support Ticket';
    if( !$rootScope.site.name )
    {
        $rootScope.page_title = 'Leave a Support Ticket'
    }

    $rootScope.is_member = $rootScope.site.is_member;
	$scope.init = function()
	{
		$scope.ticket.type = $stateParams.type || 'normal';
		$scope.ticket.company_id = $site.user_id;
	}

	$scope.validateEmail = function( email )
	{
		var re = /^[_a-z0-9\+]+(\.[_a-z0-9\+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/i;
		return re.test( email );
	}

	$scope.save = function()
	{

		var message_verified = true;
		if( !$scope.isLoggedIn() )
		{
			if( !$scope.validateEmail( $scope.ticket.user_email ) )
			{
				toastr.error( "Email is not valid. Please check email again" );
				message_verified = false;
			}
		}
		if( typeof $scope.ticket.message == 'undefined' || $scope.ticket.message == '' )
		{
			toastr.error( "You must add a message to submit a ticket!" );
			message_verified = false;
		}

		if( typeof $scope.ticket.subject == 'undefined' || $scope.ticket.subject == '' )
		{
			toastr.error( "You must add a subject to submit a ticket" );
			message_verified = false;
		}

		if( message_verified == true )
		{
			console.log( $scope.ticket );
			$scope.ticket.parent_id = "0";
			$scope.ticket.agent_id = "0";
			$scope.ticket.status = "open";
			$scope.ticket.site_id = $rootScope.site.id ? $rootScope.site.id : null;
			$scope.ticket.company_id = $rootScope.site.company_id ? $rootScope.site.company_id : null;
			$scope.ticket.send_email = true;
			$scope.loading = true;
			RestangularV3.all( 'ticket' ).post( $scope.ticket ).then( function( response )
			{
				$scope.loading = false;
				toastr.success( "Your ticket has been created." );
				/*Restangular.all( '' ).customGET( 'ticketCount' ).then( function( data )
				{
					$rootScope.site.unread_support_ticket = data;
				} );*/

				$scope.ticket_submitted = true;
			} )
		}
	}
} );