var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("admin.site.content.helpdesk.category",{
			url: "/category/:id",
			templateUrl: "/templates/components/admin/site/content/helpdesk/category/category.html",
			controller: "CategoryController",
		    resolve: {
			    $category: function(Restangular, $site , $stateParams) {
				    if($stateParams.id)
					    return Restangular.one('supportCategory' , $stateParams.id).get();
				    else
					    return {company_id : $site.company_id}
			    }
		    }
		})
}); 

app.controller("CategoryController", function ($scope, $localStorage, $state,$category, $stateParams, $site, $filter, Restangular, toastr) {
	//$scope.page = $page;
    $scope.category = $category;
    $scope.category.id ? $scope.page_title = 'Edit category' : $scope.page_title = 'Create category';


    $scope.save = function(){
        if($scope.category.id){
            $scope.category.put();
            toastr.success("Support category edited successfully!");
            $state.go("admin.site.content.helpdesk.categories");
        }
        else{
            Restangular.all('supportCategory').post($scope.category).then(function(response){
                toastr.success("Support category added successfully!");
                $state.go("admin.site.content.helpdesk.categories");
            })
        }
    }
});