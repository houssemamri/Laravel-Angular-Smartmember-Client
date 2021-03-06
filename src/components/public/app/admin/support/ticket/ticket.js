var app = angular.module( "app" );

app.config( function( $stateProvider )
{
	$stateProvider
		.state( "public.app.admin.support.ticket", {
			url: "/ticket/:id?",
			templateUrl: "/templates/components/public/app/admin/support/ticket/ticket.html",
			controller: "TicketController"
		} )
} );

app.controller( "TicketController", function( $scope, $localStorage, $state, $rootScope, $stateParams, $filter, Restangular, toastr )
{
	$scope.display_replies = [];
	$scope.change_ticket_status = '';
	$user = $rootScope.user;
	if( $stateParams.id )
	{
		$ticket = Restangular.one( 'supportTicket', $stateParams.id ).get().then( function( response )
		{
			$scope.ticket = response.ticket;
			$ticket = response;
			$scope.init()
		} );
	}
	else
	{
		$scope.ticket = {};
	}

	$scope.current_user_id = $user.id;
	$scope.agents = [];
	$scope.init = function()
	{
		$scope.advanced_info = $ticket.advanced_info;
		$scope.recent_tickets = $ticket.recent_tickets;
		$scope.statuses = [
			{ value: "Open", id: "open" },
			{ value: "Closed", id: "closed" },
		]


		$scope.reply = { parent_id: $scope.ticket.id, company_id: $scope.ticket.company_id };
		$scope.send_email = false;


		Restangular.all( '' ).customGET( 'supportAgents', { site_id: $scope.ticket.site_id + ( $scope.ticket.escalated_site_id && $scope.ticket.escalated_site_id != 0 && $scope.ticket.escalated_site_id != '0' ? ',' + $scope.ticket.escalated_site_id : '' ) } ).then( function( data )
		{
			data=data.items;
			angular.forEach( data, function( value )
			{
				console.log(value);
				if( typeof value.user != 'undefined' && value.user)
				{
					var user_name = value.user.first_name + ' ' + value.user.last_name;
					var name_bits = user_name.split( ' ' );
					var initials = '';
					if( name_bits.length > 1 )
					{
						initials = name_bits[ 0 ].charAt( 0 ).toUpperCase() + name_bits[ 1 ].charAt( 0 ).toUpperCase();
					}
					else
					{
						initials = name_bits[ 0 ].charAt( 0 ).toUpperCase() + name_bits[ 0 ].charAt( 1 ).toUpperCase();
					}

					$scope.agents.push( {
						id: value.user.id,
						name: user_name,
						email: value.user.email,
						profile_image: value.user.profile_image,
						initials: initials
					} );
				}
			} );
			$scope.agents = _.uniq($scope.agents , 'id');



			var isAgent = _.find( $scope.agents, { 'id': $user.id } ) || _.find( $scope.agents, { 'id': $user.id + '' } );
			console.log( $scope.agents )
			if( isAgent )
			{
				$scope.display_replies = $scope.ticket.reply.concat( $scope.ticket.notes )
				$scope.display_replies = $scope.display_replies.concat( $scope.ticket.actions );
				$scope.display_replies = _.sortBy( $scope.display_replies, 'created_at' );

				angular.forEach( $scope.display_replies, function( value, key )
				{
					console.log( key, ' => ', $scope.formatDate( value.created_at ) );
				} );

			}
			else
			{
				$scope.display_replies = $scope.ticket.reply.concat( $scope.ticket.actions );
				_.sortBy( $scope.display_replies, 'created_at' );
			}
		} );
	}

	$scope.getFileName =function($url) {
 		$url = decodeURI($url);
 		$str = $url.split('/');
 		if($str.length >=1)
 			return $str[$str.length-1];
 		else
 			return " ";
 	}


	$scope.isImage = function( file )
	{
		return [ 'jpg', 'jpeg', 'png', 'gif', 'bmp' ].indexOf( file.split( '/' ).pop().split( '.' ).pop().toLowerCase() ) != -1;
	}

	$scope.linkify = function( inputText )
	{
		var replacedText, replacePattern1, replacePattern2, replacePattern3;

		//URLs starting with http://, https://, or ftp://
		replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		replacedText = inputText.replace( replacePattern1, '<a href="$1" target="_blank">$1</a>' );

		//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
		replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		replacedText = replacedText.replace( replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>' );

		//Change email addresses to mailto:: links.
		replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
		replacedText = replacedText.replace( replacePattern3, '<a href="mailto:$1">$1</a>' );

		return replacedText;
	}

	$scope.userActionMessage = function( action )
	{
		var message = '';
		if( action.user.first_name || action.user.last_name )
		{
			message += action.user.first_name + ' ' + action.user.last_name;
		}
		else
		{
			message += action.user.email;
		}

		switch( action.modified_attribute )
		{
			case 'status':
				message += ' changed ticket status from ' + _.findWhere( $scope.statuses, { id: action.old_value } ).value + ' to <strong>' + _.findWhere( $scope.statuses, { id: action.new_value } ).value + '</strong>';
				break;
			case 'agent_id':
				var agent = _.find( $scope.agents, { 'id': action.new_value } ) || _.find( $scope.agents, { 'id': action.new_value + '' } );
				message += ' assigned ticket to <strong>' + ( agent ? agent.name : action.new_value ) + '</strong>';
				break;
			case 'rating_requested':
				message = '<strong>' + ( $scope.ticket.user.first_name || $scope.ticket.user.last_name ? $scope.ticket.user.first_name + ' ' + $scope.ticket.user.last_name : $scope.ticket.user.email ) + '</strong> was asked to rate the customer service';
				break;
			case '3_day':
				message = 'Auto follow-up sent to ' + '<strong>' + ( $scope.ticket.user.first_name || $scope.ticket.user.last_name ? $scope.ticket.user.first_name + ' ' + $scope.ticket.user.last_name : $scope.ticket.user.email ) + '</strong> after 3 days without a reply';
				break;
			case '5_day':
				message = 'Notice of ticket being closed sent to ' + '<strong>' + ( $scope.ticket.user.first_name || $scope.ticket.user.last_name ? $scope.ticket.user.first_name + ' ' + $scope.ticket.user.last_name : $scope.ticket.user.email ) + '</strong> after 5 days without a reply';
				break;
		}

		return message;
	}

	$scope.autoActionMessage = function( action )
	{
		switch( action.modified_attribute )
		{
			case 'status':
				message = 'Ticket status changed from ' + _.findWhere( $scope.statuses, { id: action.old_value } ).value + ' to <strong>' + _.findWhere( $scope.statuses, { id: action.new_value } ).value + '</strong>';
				break;
			case 'agent_id':
				var agent = _.find( $scope.agents, { 'id': action.new_value } ) || _.find( $scope.agents, { 'id': action.new_value + '' } );
				message = 'Ticket assigned to <strong>' + ( agent ? agent.name : action.new_value ) + '</strong>';
				break;
			case 'rating_requested':
				message = '<strong>' + ( $scope.ticket.user.first_name || $scope.ticket.user.last_name ? $scope.ticket.user.first_name + ' ' + $scope.ticket.user.last_name : $scope.ticket.user.email ) + '</strong> was asked to rate the customer service';
				break;
			case '3_day':
				message = 'Auto follow-up sent to ' + '<strong>' + ( $scope.ticket.user.first_name || $scope.ticket.user.last_name ? $scope.ticket.user.first_name + ' ' + $scope.ticket.user.last_name : $scope.ticket.user.email ) + '</strong> after 3 days without a reply';
				break;
			case '5_day':
				message = 'Notice of ticket being closed sent to ' + '<strong>' + ( $scope.ticket.user.first_name || $scope.ticket.user.last_name ? $scope.ticket.user.first_name + ' ' + $scope.ticket.user.last_name : $scope.ticket.user.email ) + '</strong> after 5 days without a reply';
				break;
		}

		return message;
	}

	$scope.actionMessage = function( action )
	{
		if( action.user )
		{
			return $scope.userActionMessage( action );
		}
		else
		{
			return $scope.autoActionMessage( action );
		}
	}

	$scope.autop = function( stringValue )
	{
		if( typeof stringValue != 'undefined' )
		{
			var string_bits = stringValue.split( '\n' );
			return '<p>' + string_bits.join( '</p><p>' ) + '</p>';
		}
		else
		{
			return stringValue;
		}
	}

	$scope.changeStatus = function( status )
	{
		$scope.ticket.status = status;
        Restangular.one( 'supportTicket', $scope.ticket.id ).put( {
            'status': status
        }).then(function(response){
            toastr.success( "Ticket status changed to " + status );
        });
	}

	$scope.formatDate = function( inputDate )
	{
		var input = new Date( inputDate );
		var timeNow = new Date( Date.now() );
		var today = timeNow.getDay();
		var thenDay = input.getDay();

		if( today == thenDay )
		{
			return 'Today';
		}
		else if( today - 1 == thenDay )
		{
			return 'Yesterday';
		}
		else
		{
			return moment( inputDate ).format( 'MMMM Do' );
		}
	}


	$scope.sendReply = function()
	{

		if( $scope.admin_mode )
		{
			Restangular.all( 'adminNote' ).post( {
				ticket_id: $scope.ticket.id,
				note: $scope.reply.message
			} ).then( function( response )
			{
				toastr.success( "Your note has been saved" );
				response.user = $user;
				$scope.ticket.notes.push( response );
				$scope.display_replies.push( response )
				$scope.reply = { parent_id: $scope.ticket.id, company_id: $scope.ticket.company_id };
			} );
		}
		else
		{

			if( $scope.ticket.agent_id == 0 )
			{
				$scope.ticket.agent_id = $scope.current_user_id;
				$scope.agentChange();
			}

			if( (typeof $scope.reply.message != 'undefined' && $scope.reply.message != '') || ($scope.reply.attachment != '' && typeof $scope.reply.attachment != 'undefined')  )
			{
				$scope.send_email = $scope.change_ticket_status == $scope.ticket.status;
				$scope.reply.send_email = $scope.send_email;
				console.log($scope.reply);
				Restangular.all( 'supportTicket' ).post( $scope.reply ).then( function( response )
				{
					toastr.success( "A reply has been created." );
					$scope.reply.message = '';
					$scope.ticket.reply.push( response );
					$scope.display_replies.push( response );
					$scope.reply = { parent_id: $scope.ticket.id, company_id: $scope.ticket.company_id };
					$scope.send_email = !$scope.send_email;
				} );
			}
		}
	}

	$scope.agentChange = function()
	{
		Restangular.one( 'supportTicket', $scope.ticket.id ).put( { 'agent_id': $scope.ticket.agent_id } ).then( function( response )
		{
			toastr.success( "Agent updated" );
			$scope.ticket.agent = response.agent;
			$scope.change_agent = false;
			var action = {
				modified_attribute: 'agent_id',
				user: $user,
				new_value: $scope.ticket.agent_id,
				created_at: response.created_at
			};

			$scope.display_replies.push( action );
		} )
	}

	$scope.setCannedResponse = function( content )
	{
		$scope.reply.message = content;
	}

	$scope.assignToSMTech = function()
	{
		Restangular.one( 'supportTicket', $scope.ticket.id ).put( {
			'escalated_site_id': 2056,
            'agent_id': '0'
		} ).then( function( response )
		{
            $scope.ticket.escalated_site_id = 2056;
            $scope.ticket.agent_id = 0;
            $scope.ticket.agent = null;
			$scope.ticket.sm_tech = true;
            $scope.ticket.sm_marketing = false;
			toastr.success( "Ticket assigned to SM Tech team" );
		} )
	}

    $scope.assignToSMMarketing = function()
	{
		Restangular.one( 'supportTicket', $scope.ticket.id ).put( {
			'escalated_site_id': 6325,
            'agent_id': '0'
		} ).then( function( response )
		{
            $scope.ticket.escalated_site_id = 6325;
            $scope.ticket.agent_id = 0;
            $scope.ticket.agent = null;
			$scope.ticket.sm_marketing = true;
            $scope.ticket.sm_tech = false;
			toastr.success( "Ticket assigned to SM Marketing team" );
		} )
	}

} );