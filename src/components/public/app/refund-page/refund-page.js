var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("public.app.refund-page",{
			url: "/refund-page",
			templateUrl: "/templates/components/public/app/refund-page/refund-page.html",
			controller: "RefundPageController"
		})
}); 

app.controller('RefundPageController', function ($scope, $localStorage, $site, $state, $stateParams, $modal, $filter, Restangular, toastr, Upload) {
    $scope.refund = {};
    $scope.loading=true;
    Restangular.all('specialPage').getList({site_id:$site.id , type:'Refund Page'}).then(function(response){
        $refund=response;
        $scope.loading=false;
        if($refund.length>0){
            $scope.refund = $refund[0];
            $scope.embed_content = $scope.refund.embed_content;
        }
        $scope.refund.isOpen = false;
        $scope.refund.type = 'Refund Page';
        $scope.refund.site_id = $site.id;
        $scope.isChecked = false; 
    });

    $scope.save = function () {
        delete $scope.refund.url;
        var ref = angular.copy($scope.refund);
        delete ref.isOpen;
        if (ref.id) {
            Restangular.all('specialPage').customPUT(ref , ref.id)
            toastr.success("Refund Page has been saved");
            $state.go('admin.site.pages.core.list');
        }
        else {
            Restangular.all('specialPage').post(ref).then(function (refund) {
                refund.isOpen = false;
                $scope.refund = refund;
                toastr.success("Refund Page has been saved!");
                $state.go('admin.site.pages.core.list');
            });
        }
    }

    $scope.selectUrl = function(item , selected_url , show_next){
    
      var api_resources = ['lesson' , 'customPage' , 'post' , 'download' , 'livecast' , 'supportArticle'];
      if(!selected_url)
          return;
      if(api_resources.indexOf(selected_url)<0)
      {
          $scope.refund.free_item_url = selected_url;
          item.url = selected_url;

          $scope.refund.isOpen = false;
      }
      else if(selected_url == 'download'){
        Restangular.all('').customGET('download',{site_id: item.site_id}).then(function(response){
            var downloads = response;
            downloads.forEach(function(entity){
                entity.url = entity.permalink;
            })
            $scope.show_next = true;
            $scope.loaded_items = downloads;
              
        })
      }
      else
      {
        Restangular.all(selected_url).getList({site_id: item.site_id}).then(function(response){
            if(response.route == 'customPage')
                response.route = 'page';
            if(response.route == 'supportArticle')
                response.route = 'support-article';
            response.forEach(function(entity){
                entity.url =  entity.permalink;
            })
            $scope.show_next = true;
            $scope.loaded_items = response.items;
              
        })
      }
    }

    $scope.imageUpload = function(files){

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            Upload.upload({
                url: $scope.app.apiUrl + '/utility/upload',
                file: file
            })
                .success(function (data, status, headers, config) {
                    console.log(data.file_name);
                    var editor = $.summernote.eventHandler.getModule();
                    file_location = '/uploads/'+data.file_name;
                    editor.insertImage($scope.editable, data.file_name);
                }).error(function (data, status, headers, config) {
                    console.log('error status: ' + status);
                });
        }
    }
});