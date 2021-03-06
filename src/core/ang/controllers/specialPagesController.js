app.controller('specialPagesController', function ($scope, $rootScope, $localStorage, $location , $stateParams,  Restangular, toastr, $state, smModal) {
    $site = $rootScope.site;     
    $site_options = Restangular.all( 'siteMetaData' ).getList().then(function(response){$scope.site_options = response ; $scope.initialize()});
    
    $scope.initialize = function(){
        $homepage_url=_.find($scope.site.meta_data, function(temp){ return temp.key == 'homepage_url'; });
        
        if($homepage_url)
            $scope.site_options = {homepage_url:$homepage_url.value};
        else
            $scope.site_options ={};
        
        $scope.site=$site;
        $.each($scope.site.meta_data, function (key, data) {
            $scope.site_options[data.key] = data.value;
        });

        $scope.site_options.isOpen = false;
        if($scope.site_options['support_enable'] == undefined){
            $scope.site_options.support_enable = 'yes';
        }else{
            $scope.site_options.support_enable = $scope.site_options['support_enable'];
        }

        $rootScope.support_enable = $scope.site_options.support_enable;
        $rootScope.not_homepage_setting = false;
    }
    //this looks like it doesn't belong here, but it actually is needed to make the icon picker work
    //the function name has to be updateMenuItem because it is what the icon picker directive looks for
    $scope.updateMenuItem = function ( model ) {
        console.log('chosen menu item is ' + model.custom_icon);
        $scope.site_options.cap_icon = model.custom_icon;
        jQuery('#cap_icon i').attr('class','').addClass('fa ' + $scope.site_options.cap_icon );
        $scope.site_options.open = false;
    }

    $scope.menuItemLabel=function(){
        $('.ui-iconpicker').toggleClass('open');
    }
    
    $scope.save = function () {
        delete $scope.site_options.url;
        delete $scope.site_options.open;
        Restangular.all('siteMetaData').customPOST($scope.site_options, "save").then(function () {
            toastr.success("Options are saved!");
            $scope.site_options.isOpen = false;
            $localStorage.homepage_url = $scope.site_options.homepage_url;
            smModal.Show('public.administrate.site.pages.core.list');
        });
    }

    $scope.selectUrl = function(item , selected_url , show_next){

        var api_resources = ['lesson' , 'customPage' , 'post' , 'download' , 'livecast' , 'supportArticle', 'bridgePage'];
        if(!selected_url)
            return;
        if(api_resources.indexOf(selected_url)<0)
        {
            $scope.site_options['homepage_url'] = selected_url;
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
