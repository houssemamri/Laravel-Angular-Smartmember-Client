var app = angular.module( "app" );

app.config( function( $stateProvider )
{
	$stateProvider
		.state( "public.app.site.page", {
			url: "/page/:permalink",
			templateUrl: "/templates/components/public/app/site/page/page.html",
			controller: "PublicPageController"
		} )
} );

app.controller( 'PublicPageController', function( $scope, $localStorage, $rootScope, $state, $stateParams, $filter, Restangular, toastr, smModal )
{

	$scope.comment = '';
	$scope.child_comment = '';
	$scope.user = $localStorage.user;
	$scope.loading = true;

	$scope.pagination = {
		current_page: 1,
		per_page: 25,
		total_count: 0,
		disable : true
	};
	Restangular.one( 'pageByPermalink', $stateParams.permalink ).get().then( function( response )
	{
		$scope.loading = false;
		$page = response;
		$scope.page = $page;
		$scope.next_item = $scope.page;
		$rootScope.setSocialShareForContent( $scope.next_item );
		$rootScope.widget_target_type = 'page';
		$rootScope.widget_target = $scope.next_item.id;
		$rootScope.page_title = $page.title || $rootScope.page_title;

		if( $rootScope.site.subdomain == 'sm' )
		{
			(function()
			{
				var articleId = fyre.conv.load.makeArticleId( null );
				fyre.conv.load( {}, [ {
					el: 'livefyre-comments',
					network: "livefyre.com",
					siteId: "380511",
					articleId: articleId,
					signed: false,
					collectionMeta: {
						articleId: articleId,
						url: fyre.conv.load.makeCollectionUrl(),
					}
				} ], function()
				{
				} );
			}());
		}
		$scope.pagination.disable = false;
		$scope.paginate();
		// Restangular.all( '' ).customGET( 'comment?target_id=' + $scope.page.id + '&type=' + 1 ).then( function( comments )
		// {
		// 	$scope.page.comments = _.toArray( comments.comments );
		// 	$scope.page.comments_count = $scope.page.comments.length;

		// 	_.map( $scope.page.comments, function( item )
		// 	{
		// 		$scope.page.comments_count += item.reply.length;
		// 	});
		// } );
	} );

	$scope.paginate = function( search )
	{
		if(!$scope.page.comments || $scope.page.comments.length==0){
			$scope.page.comments = [];
			$scope.loading = true;
		}
		$scope.pagination.disable=true;
		if( search )
		{
			$scope.pagination.current_page = 1;
		}

		var $params = { p: $scope.pagination.current_page };

		Restangular.all( '' ).customGET( 'comment?target_id=' + $scope.page.id + '&type=' + 1 + '&p=' + $params.p).then( function( data )
		{
			$scope.loading = false;
			$scope.pagination.current_page++;
			$scope.pagination.total_count = data.total_count;
			$scope.page.comments_count = data.total_count;

			if(data && data.items && data.items.length > 0)
			{
				$scope.pagination.disable = false;
			}
			$scope.page.comments = $scope.page.comments.concat( data.items )
		} );
	}


	$scope.saveComment = function( body )
	{

		if( !$scope.user )
		{
			toastr.error( "Sorry , you must be logged in to commen" );
			return;
		}

		if( !body || body.trim().length <= 0 )
		{
			toastr.error( "Sorry , comment cannot be empty!" );
			return;
		}


		Restangular.all( 'comment' ).post( {
			target_id: $scope.page.id,
			type: 1,
			body: body,
			public: $scope.page.discussion_settings.public_comments
		} ).then( function( comment )
		{
			$scope.page.comments.push( comment );
			toastr.success( "Your comment is added!" );

		} )
	}

	$scope.saveReply = function( comment, body )
	{

		if( !$scope.user )
		{
			toastr.error( "Sorry , you must be logged in to comment" );
			return;
		}

		if( !body || body.trim().length <= 0 )
		{
			toastr.error( "Sorry , comment cannot be empty!" );
			return;
		}

		Restangular.all( 'comment' ).post( {
			target_id: $scope.page.id,
			type: 1,
			parent_id: comment.id,
			body: body,
			public: $scope.page.discussion_settings.public_comments
		} ).then( function( reply )
		{
			comment.reply.push( reply );
			toastr.success( "Your reply is added!" );

			$scope.SetCommentReplyBoxVisibility( false );
		} )
	}

	$scope.deleteComment = function( comment )
	{
		if( !$scope.user.id == comment.user_id )
		{
			toastr.error( "Sorry , you are not authorized to remove this comment" );
			return;
		}
		Restangular.one( 'comment', comment.id ).remove().then( function( response )
		{
			$scope.page.comments = _.without( $scope.page.comments, comment );
		} )
	}

	$scope.deleteReply = function( reply, comment )
	{
		if( !$scope.user.id == reply.user_id )
		{
			toastr.error( "Sorry , you are not authorized to remove this reply" );
			return;
		}
		Restangular.one( 'comment', reply.id ).remove().then( function( response )
		{
			comment.reply = _.without( comment.reply, reply );
		} )
	}

	$scope.commentPermission = function()
	{
		return ($scope.page.discussion_settings.show_comments && !$scope.page.discussion_settings.close_to_new_comments);
	}

	$scope.replyPermission = function()
	{
		if( $scope.commentPermission() )
		{
			;
		}
		return ($scope.page.discussion_settings.show_comments && !$scope.page.discussion_settings.close_to_new_comments && $scope.page.discussion_settings.allow_replies );
	}

	$scope.TriggerEmbeds = function()
	{
		$( '.ui.embed' ).embed();
	}

	$scope.showNoAccessLogin = function()
	{
		if( !$localStorage.user || !$localStorage.user.access_token )
		{
			$state.go( 'public.sign.in' );
		}
	}

} );