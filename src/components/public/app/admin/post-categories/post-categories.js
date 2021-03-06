var app = angular.module( "app" );

app.config( function( $stateProvider )
{
	$stateProvider
		.state( "public.app.admin.post-categories", {
			url: "/post-categories",
			templateUrl: "/templates/components/public/app/admin/post-categories/post-categories.html",
			controller: "PostCategoriesController"
		} )
} );

app.controller( "PostCategoriesController", function( $scope, $rootScope, $localStorage, $state, $stateParams,  $filter, Restangular, toastr )
{
    if( !$rootScope.site || $rootScope.site.capabilities.indexOf( 'manage_content' ) == -1 )
        $state.go('public.app.site.home');

	$site = $rootScope.site;
	$scope.template_data = {
		title: 'Post Categories',
		description: 'Post Categories let you group like posts together into categories, you can link to display just the posts from a category.',
		singular: 'category',
		edit_route: 'public.app.admin.post-category',
		api_object: 'category'
	}

	$scope.loading = false;
	$scope.query = '';
	$scope.data = [];
	$scope.pagination = {
		current_page: 1,
		per_page: 25,
		total_count: 0
	};

	$scope.$watch( 'pagination.current_page', function( new_value, old_value )
	{
		if( new_value != old_value )
		{
			$scope.paginate(true);
		}
	} );

	$scope.paginate = function(search)
	{
		var continueSearch = true;
		if (search && $scope.query.length<3)
		{
			continueSearch = false;
		}
		if(continueSearch || $scope.query.length==0) {
			$scope.pagination.current_page = 1;
			$scope.loading = true;

			var $params = { p: $scope.pagination.current_page, site_id: $rootScope.site.id };

			if( $scope.query )
			{
				$params.q = encodeURIComponent( $scope.query );
			}

			Restangular.all( '' ).customGET( $scope.template_data.api_object + '?view=admin&p=' + $params.p + '&site_id=' + $params.site_id + ( $scope.query ? '&q=' + encodeURIComponent( $scope.query ) : '' ) ).then( function( data )
			{
				$scope.loading = false;
				$scope.pagination.total_count = data.total_count;
				$scope.data = Restangular.restangularizeCollection( null, data.items, $scope.template_data.api_object );
			} );
		}
	}

	$scope.paginate();

	$scope.deleteResource = function( id )
	{

		var itemWithId = _.find( $scope.data, function( next_item )
		{
			return next_item.id == parseInt(id);
		} );

		itemWithId.remove().then( function()
		{
			$scope.data = _.without( $scope.data, itemWithId );
		} );
	};
} );