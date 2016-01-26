var app = angular.module( "app" );

app.config( function( $stateProvider )
{
	$stateProvider
		.state( "public.app.admin.appearance.widgets", {
			url: "/widgets",
			templateUrl: "/templates/components/public/app/admin/appearance/widgets/widgets.html",
			controller: "WidgetsController"
		} )
} );

app.controller( "WidgetsController", function( $scope, $rootScope, $state, $http, Restangular, toastr, $ocLazyLoad, $timeout )
{
    $scope.loading = true;

    $scope.ucwords = function (str) {
        return (str + '')
            .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
                return $1.toUpperCase();
            });
    }

	$site = $rootScope.site;
	$ads = null;
    $scope.sidebar_id = 1;

	$scope.init = function()
	{
		Restangular.all( 'widget' ).getList( { site_id: $site.id, sidebar_id: $scope.sidebar_id } ).then( function( response )
		{
            $scope.loading = false;
            angular.forEach( response, function(value, key) {
                value.meta = {};

                value.widget_info = _.findWhere( $scope.available_widgets, {type: value.type } );

                angular.forEach( value.meta_data, function(value2, key2 ) {
                    value.meta[ value2.key ] = value2.value;
                });
            });

			$scope.widgets = response;
		} );

        Restangular.all( 'siteAds' ).getList( { site_id: $site.id } ).then( function( response )
        {
            $scope.banners = response;
        } );
	}

    $scope.moveUp = function(widget){
        var count = 0;
        var found = false;
        angular.forEach( $scope.widgets, function(value, key){

            if( !found )
                count++;

            if( value == widget ) {
                $scope.widgets = _.without($scope.widgets, value);
                found = true;
            }
        });

        var second_count = 0;
        var new_widgets = [];

        angular.forEach( $scope.widgets, function(value, key){
            second_count++;

            if( count - 1 == second_count )
                new_widgets.push( widget );

            new_widgets.push( value );
        });

        $scope.widgets = new_widgets;

        $scope.updateOrder();
    }

    $scope.moveDown = function(widget){
        var count = 0;
        var found = false;
        angular.forEach( $scope.widgets, function(value, key){

            if( !found )
                count++;

            if( value == widget ) {
                $scope.widgets = _.without($scope.widgets, value);
                found = true;
            }
        });

        var second_count = 0;
        var new_widgets = [];

        var added = false;

        angular.forEach( $scope.widgets, function(value, key){
            second_count++;

            if( count + 1 == second_count ) {
                new_widgets.push(widget);
                added = true;
            }

            new_widgets.push( value );
        });

        if( !added )
            new_widgets.push( widget );

        $scope.widgets = new_widgets;

        $scope.updateOrder();
    }

    $scope.addWidget = function(widget){
        var new_widget = {
            type: widget.type,
            widget_info: widget,
            meta: {},
            sort_order: $scope.widgets.length + 1
        };

        $scope.widgets.push( new_widget );
    }

    $scope.save = function(widget){
        if( widget.id ) {
            widget.put().then(function(response){
                toastr.success( "Widget saved!" );
            });
        } else {
            Restangular.all('widget').customPOST(widget).then(function(response){
                widget.id = response.id;
                toastr.success( "Widget Added!" );
            })
        }
    };

    $scope.delete = function(widget){
        if( widget.id ) {
            widget.remove().then(function(){
                $scope.widgets = _.without( $scope.widgets, widget );
            })
        } else {
            $scope.widgets = _.without( $scope.widgets, widget );
        }
    };

    $scope.updateOrder = function(){
        var new_order = {};
        var count = 1;

        angular.forEach( $scope.widgets, function(value){
            if( value.id ) {
                new_order[value.id] = count;
                count++;
            }
        });

        Restangular.all('widget').customPOST({order: new_order}, 'updateOrder').then(function(){
            console.log( 'new order saved');
        });
    }

	$scope.dropCallback = function(widget, index){

        var new_order = {};
        var count = 1;

        angular.forEach( $scope.widgets, function(value){
            if( value.id ) {
                new_order[value.id] = count;
                value.sort_order = count;
                count++;
            }
        });

        Restangular.all('widget').customPOST({order: new_order}, 'updateOrder').then(function(){
            console.log( 'new order saved');
        });
    }

	$scope.init();
} );