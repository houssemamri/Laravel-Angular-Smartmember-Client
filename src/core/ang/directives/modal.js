/*
	No need for this directive
*/

app.directive( 'modal', function()
{
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<div class="ui modal" ng-transclude></div>',
		link: function( scope, element, attrs, ngModel )
		{
			element.modal( {
				onHide: function()
				{
					//ngModel.$setViewValue( false );
				}
			});

			/*
			scope.$watch( function()
			{
				return ngModel.$modelValue;
			}, function( modelValue )
			{
				element.modal( modelValue ? 'show' : 'hide' );
			} );
			*/

			scope.$on( '$destroy', function()
			{
				element.modal( 'hide' );
				element.remove();
			} );
		}
	}
} );
