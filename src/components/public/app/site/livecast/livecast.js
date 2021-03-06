var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.app.site.livecast",{
			url: "/livecast/:permalink",
			templateUrl: "/templates/components/public/app/site/livecast/livecast.html",
			controller: "PublicLivecastController"
		})
}); 

app.controller('PublicLivecastController',function($scope,$rootScope,$http,$stateParams,$localStorage,Restangular,smModal,toastr){

    $scope.comment = '';
    $scope.child_comment = '';
    $scope.user = $localStorage.user;
    $scope.loading=true;
    $scope.pagination = {
        current_page: 1,
        per_page: 25,
        total_count: 0,
        disable : true
    };
    Restangular.one('livecastByPermalink' , $stateParams.permalink).get().then(function(response){
        $livecast=response;
        $scope.loading=false;
        $scope.next_item = $livecast;
        $rootScope.setSocialShareForContent( $scope.next_item );
        $rootScope.widget_target_type = 'livecast';
        $rootScope.widget_target = $scope.next_item.id;
        $rootScope.page_title = $livecast.title || $rootScope.page_title;
        $scope.pagination.disable = false;
        $scope.paginate();
        // Restangular.all('').customGET('comment?target_id='+$scope.next_item.id+'&type='+5).then(function(comments){
        //        $scope.next_item.comments = _.toArray(comments.comments)
        //     });
    })

    $scope.paginate = function( search )
    {
        if(!$scope.next_item.comments || $scope.next_item.comments.length==0){
            $scope.next_item.comments = [];
            $scope.loading = true;
        }
        $scope.pagination.disable=true;
        if( search )
        {
            $scope.pagination.current_page = 1;
        }

        var $params = { p: $scope.pagination.current_page };

        Restangular.all( '' ).customGET( 'comment?target_id=' + $scope.next_item.id + '&type=' + 5 + '&p=' + $params.p).then( function( data )
        {
            $scope.loading = false;
            $scope.pagination.current_page++;
            $scope.pagination.total_count = data.total_count;

            if(data && data.items && data.items.length > 0)
            {
                $scope.pagination.disable = false;
            }
            $scope.next_item.comments = $scope.next_item.comments.concat( data.items )
        } );
    }

    
    

    
    $scope.saveComment = function(body){
        if(!$scope.user){
            toastr.error("Sorry , you must be logged in to comment");
            return;
        }

        if(!body || body.trim().length <= 0){
            toastr.error( "Sorry , comment cannot be empty!" );
            return;
        }

        Restangular.all('comment').post({target_id:$scope.next_item.id , type:5 ,body:body , public:$scope.next_item.discussion_settings.public_comments}).then(function(comment){
            $scope.next_item.comments.push(comment);
            toastr.success("Your comment is added!");

        })
    }

    $scope.saveReply = function(comment , body){
        if(!$scope.user){
            toastr.error("Sorry , you must be logged in to comment");
            return;
        }

        if(!body || body.trim().length <= 0){
            toastr.error( "Sorry , comment cannot be empty!" );
            return;
        }

        Restangular.all('comment').post({target_id:$scope.next_item.id , type:5 , parent_id : comment.id ,body:body , public:$scope.next_item.discussion_settings.public_comments}).then(function(reply){
            comment.reply.push(reply);
        })
    }

    $scope.deleteComment = function(comment){
        if(!$scope.user.id == comment.user_id){
            toastr.error("Sorry , you are not authorized to remove this comment");
            return;
        }
        Restangular.one('comment' , comment.id).remove().then(function(response){
            $scope.next_item.comments = _.without($scope.next_item.comments, comment);
        })
    }

     $scope.deleteReply = function(reply , comment){
        if(!$scope.user.id == reply.user_id){
            toastr.error("Sorry , you are not authorized to remove this reply");
            return;
        }
        Restangular.one('comment' , reply.id).remove().then(function(response){
            comment.reply = _.without(comment.reply, reply);
        })
    }

    $scope.commentPermission = function(){
        return ($scope.next_item.discussion_settings.show_comments && !$scope.next_item.discussion_settings.close_to_new_comments);
    }

    $scope.replyPermission = function(){
        if($scope.commentPermission());
        return ($scope.next_item.discussion_settings.show_comments && !$scope.next_item.discussion_settings.close_to_new_comments && $scope.next_item.discussion_settings.allow_replies );
    }

    $scope.showNoAccessLogin = function() {
        if (!$localStorage.user || !$localStorage.user.access_token)
        {
            $state.go('public.sign.in');
        }
    }

});