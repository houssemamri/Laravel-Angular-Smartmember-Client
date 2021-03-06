var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.app.admin.pages.login",{
			url: "/login",
			templateUrl: "/templates/components/public/app/admin/pages/core/login/login.html",
			controller: "LoginController",
            resolve: {
                $site_options: function( Restangular )
                {
                    return 
                }
            }
		})
}); 

app.controller("LoginController", function ($scope, smModal, $rootScope, $localStorage, $location , $stateParams,  Restangular, toastr, $state) {
	$site = $rootScope.site;
    $scope.site=$rootScope.site;
    Restangular.all( 'siteMetaData' ).customGETLIST( "getOptions", [ 'create_account_url', 'login_page_text', 'login_to_site_text', 'login_email_text', 'login_password_text', 'login_button_text', 'login_close_button_text', 'forgot_password_text', 'need_help_text' ] ).then(function(response){
        $scope.site_options = {};
        $.each(response, function (key, data) {
            $scope.site_options[data.key] = data.value;
        });

        $scope.site_options.isOpen = false;
    })
    

    $scope.save = function () {
        delete $scope.site_options.url;
        delete $scope.site_options.open;
        Restangular.all('siteMetaData').customPOST($scope.site_options, "save").then(function () {
            toastr.success("Options are saved");
            $scope.site_options.isOpen = false;
            $localStorage.homepage_url = $scope.site_options.homepage_url;
            $state.go('public.app.admin.pages.core.list');
        });
    }

    $scope.selectUrl = function(item , selected_url , show_next){

        var api_resources = ['lesson' , 'customPage' , 'post' , 'download' , 'livecast' , 'supportArticle', 'bridgePage'];
        if(!selected_url)
            return;
        if(api_resources.indexOf(selected_url)<0)
        {
            // item.url = selected_url;
            $scope.site_options['create_account_url'] = selected_url;
            $scope.show_next = show_next;
            $scope.close();
        }
        else if(selected_url == 'post'){
          Restangular.all(selected_url).customGET('',{site_id: $site.id,view: 'admin'}).then(function(response){
              var posts = response.items;
              response.items.forEach(function(entity){
                  entity.url =  entity.permalink;
              })
              $scope.show_next = true;
              $scope.loaded_items = {items : posts };
                
          })
        }
        else if(selected_url == 'download'){
            console.log(item.site_id)
            Restangular.all('download').customGET('',{site_id: $site.id}).then(function(response){
                var downloads = response;
                downloads.items.forEach(function(entity){
                    entity.url = entity.permalink;
                })
                $scope.show_next = true;
                $scope.loaded_items = downloads;

            })
        }
        else
        {

           $params = {site_id: $site.id, bypass_paging: true};
                   if(selected_url == 'lesson')
                   {
                       $params.drafted = false;
                   }

                   Restangular.all(selected_url).customGET('',$params).then(function(response){
                       if(response.route == 'customPage')
                           response.route = 'page';
                       if(response.route == 'supportArticle')
                           response.route = 'support-article';
                       if(response && response.items)
                           $.each(response.items,function(key,value){
                               value.url =  value.permalink;
                           });
                       else if(response)
                           $.each(response,function(key,value){
                              value.url =  value.permalinwk;
                           });
                       $scope.show_next = true;
                       $scope.loaded_items = response;
                         
                   })
        }
    }
});