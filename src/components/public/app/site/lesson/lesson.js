var app = angular.module( "app" );

app.config( function( $stateProvider )
{
	$stateProvider
		.state( "public.app.site.lesson", {
			url: "/lesson/:permalink",
			templateUrl: "/templates/components/public/app/site/lesson/lesson.html",
			controller: "PublicLessonController"
		} )
} );

app.controller( 'PublicLessonController', function( $scope, $rootScope, $localStorage, $state, $stateParams, $filter, Restangular, toastr,smModal )
{
	$scope.loading = true;
	$scope.comment = '';
	$scope.child_comment = '';


	$lesson = {};
	$scope.user = $localStorage.user;
	$index = 0;
	$scope.pagination = {
		current_page: 1,
		per_page: 25,
		total_count: 0,
		disable : true
	};
	// console.log("permalink: " + $stateParams.permalink );

	Restangular.one( 'lessonByPermalink', $stateParams.permalink ).get().then( function( response )
	{
		$lesson = response;
		$rootScope.page_title = $lesson.title || $rootScope.page_title;
		$scope.loading = false;
		$scope.lesson = $lesson;
		$scope.next_item = $scope.lesson;

        // $rootScope.setSocialShareForContent( $scope.next_item );
        $rootScope.widget_target_type = 'lesson';
        $rootScope.widget_target = $scope.next_item.id;

        $scope.next_item.content_type = 'lesson';
		$scope.userNote = { lesson_id: $lesson.id, site_id: $lesson.site_id };
		$scope.lesson.new_reply = '';
		$scope.lesson.new_comment = '';
		$scope.pagination.disable = false;
		$scope.paginate();
		if( $scope.$storage.user )
		{
			Restangular.one( 'userNote' ).customGET( 'single/' + $lesson.id ).then( function( note )
			{
				if( note )
				{
					$scope.userNote = note;
				}
			} );
		}

		if( $lesson != undefined && $lesson.id != undefined && $lesson.permalink != undefined && $stateParams.permalink == $lesson.id )
		{
			$( 'body' ).append( $( '<a>' ).attr( 'href', '/lesson/' + $lesson.permalink ) );
			$( 'body a:last' ).click().remove();
		}
		$scope.lesson.transcript_content_public == 1 ? $scope.lesson.transcript_content_public = true : $scope.lesson.transcript_content_public = false;


		if( $rootScope.Modulelessons )
		{
			console.log( "now here it is" );
			$rootScope.showCounter = _.findLastIndex( $rootScope.Modulelessons, { permalink:  decodeURI($stateParams.permalink)  } ) + 1;
			$scope.showCounter = $rootScope.showCounter;
			$index = $scope.showCounter - 1;
			$scope.assignNextPrev();
			$scope.lesson.total_lessons = $rootScope.Modulelessons.length;
		}
		else
		{
			console.log( "here it is" );
			Restangular.one( 'module', 'home' ).get().then( function( response )
			{
				console.log( response );
				$scope.modules = response;// $filter('orderBy')(response, 'sort_order');
				$scope.modules = _.reject( $scope.modules, function( $mod )
				{
					return $mod.lessons.length == 0;
				} );
				console.log( $scope.modules );
				$rootScope.Modulelessons = [];
				console.log( "length: " + $scope.modules.length );
				$.each( $scope.modules, function( key, temp_module )
				{
					$modlessons = $filter( 'orderBy' )( temp_module.lessons, 'sort_order' );
					$.each( $modlessons, function( key, data )
					{
						$rootScope.Modulelessons.push( data );
					} );
				} );
				$rootScope.showCounter = _.findLastIndex( $rootScope.Modulelessons, { permalink: decodeURI($stateParams.permalink) } ) + 1;
				console.log( "show counter: " + $rootScope.showCounter );
				$scope.showCounter = $rootScope.showCounter;
				$index = $scope.showCounter - 1;
				$scope.lesson.total_lessons = $rootScope.Modulelessons.length;
				$scope.assignNextPrev();
			} );
		}
	} );

	$scope.paginate = function( search )
	{
		if(!$scope.lesson.comments || $scope.lesson.comments.length==0){
			$scope.lesson.comments = [];
			$scope.loading = true;
		}
		$scope.pagination.disable=true;
		if( search )
		{
			$scope.pagination.current_page = 1;
		}

		var $params = { p: $scope.pagination.current_page };

		Restangular.all( '' ).customGET( 'comment?target_id=' + $scope.lesson.id + '&type=' + 2 + '&p=' + $params.p).then( function( data )
		{
			$scope.loading = false;
			$scope.pagination.current_page++;
			$scope.pagination.total_count = data.total_count;
			if(data && data.items && data.items.length > 0)
			{
				$scope.pagination.disable = false;
			}
			$scope.lesson.comments = $scope.lesson.comments.concat( data.items )
		} );
	}

	$scope.assignCounter = function( $ctr )
	{
		$rootScope.showCounter = parseInt( $ctr );
	}

	$scope.assignNextPrev = function()
	{
		if( $index == 0 )
		{
			$scope.lesson.prev_lesson = null;
		}
		else
		{
			$scope.lesson.prev_lesson = $rootScope.Modulelessons[ $index - 1 ];
		}

		if( $index + 1 == $rootScope.Modulelessons.length )
		{
			$scope.lesson.next_lesson = null;
		}
		else
		{
			$scope.lesson.next_lesson = $rootScope.Modulelessons[ $index + 1 ];
		}
	}

	$scope.saveComment = function( body )
	{
		if( !$scope.user )
		{
			toastr.error( "Sorry , you must be logged in to comment!" );
			return;
		}

		if(!body || body.trim().length <= 0){
			toastr.error( "Sorry , comment cannot be empty!" );
			return;
		}

		Restangular.all( 'comment' ).post( {
			target_id: $scope.lesson.id,
			type: 2,
			body: body,
			public: $scope.lesson.discussion_settings.public_comments
		} ).then( function( comment )
		{
			$scope.lesson.comments.push( comment );
			$scope.lesson.new_comment = "";
			toastr.success( "Your comment is added!" );
		} )
	}

	$scope.showReplyBox = function( comment )
	{
		comment.show_reply_div = !comment.show_reply_div;
		$( '#comment_reply_25' ).focus()
	}

	$scope.deleteComment = function( comment )
	{
		if( !$scope.user.id == comment.user_id && !$rootScope.site.is_admin)
		{
			toastr.error( "Sorry , you are not authorized to remove this comment" );
			return;
		}
		Restangular.one( 'comment', comment.id ).remove().then( function( response )
		{
			$scope.lesson.comments = _.without( $scope.lesson.comments, comment );
		} )
	}

	$scope.editComment = function( comment )
	{
		if( !$scope.user.id == comment.user_id && !$rootScope.site.is_admin)
		{
			toastr.error( "Sorry , you are not authorized to remove this comment" );
			return;
		}

		if(!comment || comment.trim().length <= 0){
			toastr.error( "Sorry , comment cannot be empty!" );
			return;
		}

		Restangular.all( 'comment').customPUT({body : comment.body} , comment.id).then( function( response )
		{
			comment.edit = false;
			//$scope.lesson.comments = _.without( $scope.lesson.comments, comment );
		} )
	}

	$scope.deleteReply = function( reply, comment )
	{
		if( !$scope.user.id == reply.user_id && !$rootScope.site.is_admin)
		{
			toastr.error( "Sorry , you are not authorized to remove this reply" );
			return;
		}
		Restangular.one( 'comment', reply.id ).remove().then( function( response )
		{
			comment.reply = _.without( comment.reply, reply );
		} )
	}

	$scope.editReply = function( reply )
	{
		if( !$scope.user.id == reply.user_id && !$rootScope.site.is_admin)
		{
			toastr.error( "Sorry , you are not authorized to remove this reply" );
			return;
		}

		if(!reply || reply.trim().length <= 0){
			toastr.error( "Sorry , comment cannot be empty!" );
			return;
		}

		Restangular.all( 'comment').customPUT({body : reply.body} , reply.id).then( function( response )
		{
			reply.edit = false;
		} )
	}

	$scope.saveReply = function( comment, body )
	{
		if( !$scope.user )
		{
			toastr.error( "Sorry , you must be logged in to comment" );
			return;
		}

		if(!body || body.trim().length <= 0){
			toastr.error( "Sorry , comment cannot be empty!" );
			return;
		}
		
		Restangular.all( 'comment' ).post( {
			target_id: $scope.lesson.id,
			type: 2,
			parent_id: comment.id,
			body: body,
			public: $scope.lesson.discussion_settings.public_comments
		} ).then( function( reply )
		{
			comment.reply.push( reply );
			comment.new_reply = '';
			toastr.success( "Your reply is reply added!!" );
		} )
	}

	$scope.commentPermission = function()
	{
		return ($scope.lesson.discussion_settings.show_comments && !$scope.lesson.discussion_settings.close_to_new_comments);
	}

	$scope.replyPermission = function()
	{
		if( $scope.commentPermission() )
		{
			;
		}
		return ($scope.lesson.discussion_settings.show_comments && !$scope.lesson.discussion_settings.close_to_new_comments && $scope.lesson.discussion_settings.allow_replies );
	}


	$scope.saveNote = function()
	{
		if( !$scope.lesson.access )
		{
			toastr.error( "You do not have access to this content" );
			return;
		}
		if( !$localStorage.user )
		{
			toastr.error( "You must be logged in to save notes" );
			return;
		}

		if( !$scope.userNote.note )
		{
			toastr.error( "Note is empty can not be saved!" );
			return;
		}

		if( $scope.userNote.id )
		{
			$scope.userNote.put();
		}
		else
		{
			Restangular.all( 'userNote' ).post( $scope.userNote ).then( function( note )
			{
				$scope.userNote = note;
			} );
		}
		toastr.success( "Note has been saved!" );
	}

	$scope.saveNoteAndToggleComplete = function()
	{
		if( !$scope.lesson.access )
		{
			toastr.error( "You do not have access to this content" );
			return;
		}
		if( !$localStorage.user )
		{
			toastr.error( "You must be logged in to save notes" );
			return;
		}

		$scope.userNote.complete = !$scope.userNote.complete;

		if( $scope.userNote.id )
		{
			$scope.userNote.put();
			if( $scope.userNote.complete )
			{
				toastr.success( "Note has been saved and marked complete" );
			}
			else
			{
				toastr.success( "Note has been saved and marked incomplete" );
			}
		}
		else
		{
			Restangular.all( 'userNote' ).post( $scope.userNote ).then( function( note )
			{
				$scope.userNote = note;
				if( $scope.userNote.complete )
				{
					toastr.success( "Note has been saved and marked complete" );
				}
				else
				{
					toastr.error( "Note has been saved and marked incomplete" );
				}
			} );
		}
	}

	$scope.showNoAccessLogin = function() {
		if (!$localStorage.user || !$localStorage.user.access_token)
		{
			$state.go('public.sign.in');
		}
	}
} );