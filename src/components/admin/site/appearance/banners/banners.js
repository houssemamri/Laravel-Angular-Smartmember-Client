var app = angular.module("app");

app.config(function($stateProvider){
	$stateProvider
		.state("admin.site.appearance.banners",{
			url: "/banners",
			templateUrl: "/templates/components/admin/site/appearance/banners/banners.html",
			controller: "BannersController",
            resolve: {
                $ads: function( Restangular, $site )
                {
                    return Restangular.all( 'siteAds' ).getList( { site_id: $site.id, custom_ad: false } );
                }
            }
		})
}); 

app.controller("BannersController", function ($scope, $state,$http, $ads, $site, Restangular, toastr, $modal) {
	    $scope.ads = $ads;

	    $scope.currentPage = 1;

	    $scope.loadMore = function(){
	        $scope.disable = true;
	        Restangular.all('siteAds').getList({p:++$scope.currentPage , site_id :$site.id}).then(function (ads) {
	            $scope.ads = $scope.ads.concat(ads);
	            if(ads.length>0)
	                $scope.disable = false;
	        });
	    }

	    $scope.delete= function($ad)
	    {
	         var modalInstance = $modal.open({
	             templateUrl: '/templates/modals/deleteConfirm.html',
	             controller: "modalController",
	             scope: $scope,
	             resolve: {
	                 id: function () {
	                     return $ad.id
	                 }
	             }
	         });
	         modalInstance.result.then(function () {
	             $ad.remove().then(function(response){
	                 for(var i=0;i<$scope.ads.length;i++) {
	                     if($scope.ads[i].id==$ad.id) {
	                         $scope.ads.splice(i, 1);
	                         break;
	                     }
	                 }
	                 toastr.success("Ad removed!");
	             });
	         })
	    }

	    $scope.save = function(){
	        $scope.postAds=[];
	        console.log("check1");
	        $.each($(".ad_items"), function (key, ad) {
	            console.log("check2");
	            $tempAd=$(ad).data("component");
	            $tempAd.sort_order=key;
	            $scope.postAds.push($tempAd);
	        });
	        console.log($scope.postAds);
	        $scope.update();
	    }

	    $scope.sortableOptions = {
	        connectWith: ".connectList"
	    };

	    $scope.update=function()
	    {
	        Restangular.all("putAdvertisementsOrder").post({"adds":$scope.postAds}).then(function(response){
	            toastr.success("Banner saved!");
	        });
	    }


	    $scope.dragControlListeners = {
	        accept: function (sourceItemHandleScope, destSortableScope){
	            return true;
	        },
	        itemMoved: function ($event) {console.log("moved"); },//Do what you want},
	        orderChanged: function($event) {console.log("orderchange1"); setTimeout($scope.save,200);},//Do what you want},
	        
	        dragEnd: function ($event) {
	            $(window).off();
	        },
	        containment: '#board'//optional param.
	    };

	});

	app.controller('adminSiteWidgetsController', function ($scope, $state,$http, $ads, $site, Restangular, toastr, $modal) {

	    $scope.displayAds=[];
	    $scope.hiddenAds=[];

	    $scope.divide=function($allAds){
	        $.each($allAds,function(key,value){
	            if(value.display)
	            {
	                $scope.displayAds.push(value);
	            }
	            else
	            {
	                $scope.hiddenAds.push(value);
	            }
	        });
	    }
	    $scope.divide($ads);

	    console.log("display ads: ");
	    console.log($scope.displayAds);
	    console.log("hidden ads: ");
	    console.log($scope.hiddenAds);

	    $scope.currentPage = 1;

	    $scope.loadMore = function(){
	        $scope.disable = true;
	        Restangular.all('siteAds').getList({p:++$scope.currentPage , site_id :$site.id}).then(function (ads) {
	            $scope.ads = $scope.ads.concat(ads);
	            if(ads.length>0)
	                $scope.disable = false;
	            $scope.divide(ads);
	        });
	    }
	    $scope.$watch('displayAds|json', function() {
	        setTimeout($scope.save, 1000);
	    });
	    $scope.$watch('hiddenAds|json', function() {
	        setTimeout($scope.save, 1000);
	    });

	    $scope.save = function(){
	        $scope.postAds=[];
	        $.each($scope.displayAds,function(key,value){
	            value.display=true;
	            value.sort_order=key;
	            $scope.postAds.push(value);
	        });
	        $.each($scope.hiddenAds,function(key,value){
	            value.display=false;
	            value.sort_order=key;
	            $scope.postAds.push(value);
	        });

	        console.log($scope.postAds);
	        $scope.update();
	    }

	    $scope.sortableOptions = {
	        connectWith: ".connectList"
	    };

	    $scope.update=function()
	    {
	        Restangular.all("putAdvertisementsOrder").post({"adds":$scope.postAds}).then(function(response){
	        });
	    }

	    $scope.delete= function($ad)
	    {
	         var modalInstance = $modal.open({
	             templateUrl: '/templates/modals/deleteConfirm.html',
	             controller: "modalController",
	             scope: $scope,
	             resolve: {
	                 id: function () {
	                     return $ad.id
	                 }
	             }
	         });
	         modalInstance.result.then(function () {
	             $ad.remove().then(function(response){
	                 for(var i=0;i<$scope.ads.length;i++) {
	                     if($scope.ads[i].id==$ad.id) {
	                         $scope.ads.splice(i, 1);
	                         break;
	                     }
	                 }
	                 toastr.success("Notification removed!");
	             });
	         })
	    }

	    $scope.dragControlListeners = {
	        accept: function (sourceItemHandleScope, destSortableScope){
	            return true;
	        },
	        itemMoved: function ($event) {console.log("moved");},//Do what you want},
	        orderChanged: function($event) {console.log("orderchange2"); setTimeout(200,$scope.save)},//Do what you want},

	        dragEnd: function ($event) {
	            $(window).off();
	        },
	        containment: '#board'//optional param.
	    };

});