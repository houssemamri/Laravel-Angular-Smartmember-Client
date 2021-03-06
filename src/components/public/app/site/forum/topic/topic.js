var app = angular.module( "app" );

app.config( function( $stateProvider )
{
	$stateProvider
		.state( "public.app.site.forum.topic", {
			url: "/forum/topic/:permalink",
			templateUrl: "/templates/components/public/app/site/forum/topic/topic.html",
			controller: "Forum-topicController"
		} )
} );

app.controller( "Forum-topicController", function( $scope, $stateParams, Restangular, $rootScope )
{
	$scope.loading = true;

	Restangular.one( 'forumTopic', 'permalink' )
		.get( { permalink: $stateParams.permalink } )
		.then( function( response )
		{
			$rootScope.page_title = response.title;
			$scope.topic = response;

			$scope.loading = false;
		} );

	$scope.addReply = function()
	{
		if( !$scope.content )
		{
			return;
		}

		$scope.loading = true;

		Restangular.service( 'forumReply' )
			.post( { content: $scope.content, topic_id: $scope.topic.id, category_id: $scope.topic.category.id } )
			.then( function( response )
			{
				$scope.topic.replies.push( response );
				$scope.content = "";

				$scope.loading = false;
			} );
	}

	$scope.replyComment = function( content )
	{
		$scope.content = "<blockquote>" + content + "</blockquote> <br/>";
		$scope.scrollBottom();
	}

	$scope.scrollBottom = function()
	{
		$( "html, body" ).animate( { scrollTop: $( document ).height() }, 1000 );
	}

} );