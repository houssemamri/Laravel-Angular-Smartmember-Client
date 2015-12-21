var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.admin.site.pages.custom-page",{
			url: "/custom-page/:id?",
			templateUrl: "/templates/components/public/admin/site/pages/custom-page/custom-page.html",
			controller: "CustomPageController",
			resolve: {
                $next_item: function( Restangular, $site, $stateParams, $location )
				{
					if( $stateParams.id )
						return Restangular.one( 'customPage', $stateParams.id ).get();
					else if( $location.search().clone )
                    {
                        return Restangular.one( 'customPage', $location.search().clone ).get();
                    }
                    else
                    {
                        return { site_id: $site.id, access_level_type: 4, access_level_id: 0 }
                    }
                },
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'summernote'
                        }
                    ]);
                }
            }
		})
}); 

app.controller("CustomPageController", function ($scope, $rootScope, $localStorage, $location, $site , $timeout , $user , $next_item ,$state, $stateParams,  $filter, Restangular, toastr, Upload) {
	$scope.template_data = {
        title: 'Pages',
        cancel_route: 'public.admin.pages.pages'
    }

    if(!$next_item.id)
    {
        $next_item.site_id=$rootScope.site.id;
    }

    var draft;
    var changed;
    if($location.search().clone){
        delete $next_item.id;
        delete $next_item.access;
        delete $next_item.site;

    }

    $scope.next_item = $next_item;

    $scope.next_item.id ? $scope.page_title = 'Edit page' : $scope.page_title = 'Create page';
    $scope.next_item.access_level_type = parseInt( $scope.next_item.access_level_type );
    $scope.next_item.access_level_id = parseInt( $scope.next_item.access_level_id );

    if( $scope.next_item.access_level_type == 3 )
        $scope.next_item.access_level_type = 2;

    var seo = {};
    if ($scope.next_item.seo_settings) {
        $.each($next_item.seo_settings, function (key, data) {
            seo[data.meta_key] = data.meta_value;
        });
    }
    $scope.next_item.seo_settings = seo;

    $scope.imageUpload = function(files , type){
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            Upload.upload({
                url: $scope.app.apiUrl + '/utility/upload',
                file: file
            })
                .success(function (data, status, headers, config) {
                    var editor = $.summernote.eventHandler.getModule();

                    $scope.next_item[ type ] += '<img src=\''+data.file_name+'\'>';
                    console.log('do we gots editable now? ', $scope.editable );
                    //$scope.editable seems to be undefined, not sure why
                    /*
                     if(type=='transcript')
                     editor.insertImage( $scope.editable2, data.file_name);
                     else
                     editor.insertImage( $scope.editable, data.file_name);
                     */
                }).error(function (data, status, headers, config) {
                });
        }
    }

    $scope.setPermalink = function ($event) {
        if (!$scope.next_item.permalink)
            $scope.next_item.permalink = $filter('urlify')($scope.next_item.title);
        $scope.next_item.seo_settings.fb_share_title = $scope.next_item.title;
    }
    $scope.onBlurSlug = function ($event) {
        if ($scope.next_item.permalink)
            $scope.next_item.permalink = $filter('urlify')($scope.next_item.permalink);
    }

    $scope.save = function () {
        delete $scope.next_item.access_level;

        if( $scope.next_item.permalink == '' )
            this.onBlurTitle(null);

        $scope.next_item.site_id = $site.id;

        if( $scope.next_item.access_level_type == 2 && $scope.next_item.access_level_id == 0 )
            $scope.next_item.access_level_type = 3;

        if($scope.next_item.access_level_type!=2)
            $scope.next_item.access_level_id = 0;
        if ($scope.next_item.id) {
            $scope.next_item.put();
            $state.go("public.admin.site.pages.custom-pages");
            toastr.success("Page has been updated!");
        }
        else {
            Restangular.all('customPage').post($scope.next_item).then(function (page) {
                if(draft)
                    Restangular.one('draft' , draft.id).remove();
                $scope.next_item = page;
                $state.go("public.admin.site.pages.custom-pages");
                toastr.success("Custom page has been saved!");
            });
        }

    }

    //disabling for now because this wasn't the draft feature we wanted
    if(false && !$stateParams.id && !$location.search().clone)
    Restangular.all('draft').customGET('', {site_id : $site.id , user_id : $user.id , key : 'pages.content'}).then(function(response){
        if(response.length){
            draft = response[0]
            $scope.loadDraft()
        }
    })
    $scope.loadDraft = function(){
        var value = JSON.parse(draft.value);
        var modalInstance = $modal.open({
            templateUrl: '/templates/modals/loadDraft.html',
            controller: "modalController",
            scope: $scope,

        });
        modalInstance.result.then(function () {
            $scope.next_item = value;
        } , 
        function () {
          Restangular.one('draft' , draft.id).remove().then(function(res)
            {
                draft=null;
            });
        })
    }

    var timeout = null;
    $scope.$watch('page' , function(page , oldPage){
        if(typeof changed == "undefined")
            changed = false;
        else
            changed = true;
        if (page != oldPage && changed && !$scope.page.id && !$location.search().clone) {
              if (timeout) {
                $timeout.cancel(timeout)
              }
              timeout = $timeout($scope.start, 3000);  // 1000 = 1 second
            }
    } , true)

    $scope.start = function(){
        var data = {site_id : $site.id , user_id : $user.id , key : 'pages.content' , value : JSON.stringify($scope.page)}
        Restangular.all('draft').post(data).then(function(response){
            console.log(response);
            draft=response;
        })
    }
});