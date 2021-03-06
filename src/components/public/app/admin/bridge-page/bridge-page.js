var app = angular.module( "app" );

app.config( function( $stateProvider, $stickyStateProvider )
{
	$stateProvider
		.state( "public.app.admin.bridge-page", {
			url: "/bridge-page/:id?",
			templateUrl: "/templates/components/public/app/admin/bridge-page/bridge-page.html",
			controller: "BridgePageController",
			resolve: {

			}
		} )

	//$stickyStateProvider.enableDebug(true);
} );

app.controller( "BridgePageController", function( $scope, $localStorage, smSidebar, $q, $state, $stateParams, $filter, Restangular, toastr, Upload, $rootScope, $window, $sce )
{
    if( !$rootScope.site || $rootScope.site.capabilities.indexOf( 'manage_content' ) == -1 ) {
        smSidebar.Close();
        smSidebar.DestroyBPSidebar();
        $state.go('public.app.site.home');
    }

	$site = $rootScope.site;
	$scope.loading = true
	smSidebar.Show( '.top_bp_sidebar_contents', 'bridgepage-editor-controls.html' );
	smSidebar.Show( '.left_bp_sidebar_contents', 'bridgepage-editor.html' );

	$scope.randomPermalink = function(length) {
		if( length == undefined )
			length = 6;

		var characters = "abcdefghijklmnopqrstuwxyz0123456789".split('');
		var permalink = [];
		var length_of_characters = characters.length;

		for( var i = 0; i < length; i++ )
		{
			var n = Math.floor( Math.random() * length_of_characters );
			permalink.push( characters[ n ] );
		}

		return permalink.join('');
	}

	$templates = Restangular.all( 'bridgeTemplate' ).customGET( 'getlist' ).then( function( response )
	{
		$scope.templates = response;
	} )
	$emailLists = Restangular.all( 'emailList' ).customGET().then( function( response )
	{
		$scope.emailLists = response.items;
	} )

	if( $stateParams.id )
	{
		$page = Restangular.one( 'bridgePage', $stateParams.id ).get().then( function( response )
		{
			$scope.bridgepage = response;
		} )
	}
	else
	{
		$scope.bridgepage = $page = { site_id: $site.id, access_level_type: 4 , permalink : $scope.randomPermalink() }
	}
	$dependencies = [ $templates, $emailLists ];
	if( $stateParams.id )
	{
		$dependencies.push( $page );
	}

	$q.all( $dependencies ).then( function( response )
	{
		$scope.initialize()
	} )


	$scope.loadDefaultValue = function()
	{
		if(!$scope.template)
			return;
		switch( $scope.template.id )
		{
			case 5:
				$scope.bridgepage.swapspot.logo = 'https://s3.amazonaws.com/smpub/bp/beyondbasick.png';
				$scope.bridgepage.swapspot.headline = 'Get This Free Time Turner Today!';
				$scope.bridgepage.swapspot.ad = 'https://s3.amazonaws.com/smpub/bp/harrypotter.jpg';
				$scope.bridgepage.swapspot.background_url = 'https://s3.amazonaws.com/smpub/bp/rsz_challenger.jpg';
				$scope.bridgepage.swapspot.button = 'Get It Now';
				$scope.bridgepage.swapspot.open_link_new_tab = '_blank';
				$scope.bridgepage.swapspot.open_term_link_in_new_tab = '_blank';
				$scope.bridgepage.swapspot.open_privacy_link_in_new_tab = '_blank';
				$scope.bridgepage.swapspot.term_text_color = '#47C787';
				$scope.bridgepage.swapspot.privacy_text_color = '#47C787';
				$scope.bridgepage.swapspot.headline_text_color = '#ffffff';
				$scope.bridgepage.swapspot.button_text_color = '#ffffff';
				$scope.bridgepage.swapspot.button_background_color = '#47c787';
				$scope.bridgepage.swapspot.embed = '<iframe src="https://www.youtube.com/embed/qCiOWQgAcuI?autoplay=0&modestbranding=1&controls=0&showinfo=0&rel=0&hd=1" frameborder="0" allowfullscreen=""></iframe>';
				$scope.bridgepage.swapspot.term_text = 'Terms & Conditions';
				$scope.bridgepage.swapspot.privacy_text = 'Privacy Policy';
				$scope.bridgepage.swapspot.copyright = 'Copyright © 2016. All Rights Reserved.';
				$scope.bridgepage.swapspot.headline_font_size = 48;
				break;
			case 4:
				$scope.bridgepage.swapspot.headline = 'Enter your Hard-hitting Headline here to engage your audience';
				$scope.bridgepage.swapspot.tagline = 'Put any tagline you want up here';
				$scope.bridgepage.swapspot.open_link_new_tab = '_blank';
				$scope.bridgepage.swapspot.button = 'Get It Now';
				$scope.bridgepage.swapspot.open_term_link_in_new_tab = '_blank';
				$scope.bridgepage.swapspot.open_privacy_link_in_new_tab = '_blank';
				$scope.bridgepage.swapspot.tagline_text_color = '#ffffff';
				$scope.bridgepage.swapspot.headline_text_color = '#ffffff';
				$scope.bridgepage.swapspot.button_text_color = '#ffffff';
				$scope.bridgepage.swapspot.button_background_color = '#fe861d';
				$scope.bridgepage.swapspot.term_text_color = '#ffffff';
				$scope.bridgepage.swapspot.privacy_text_color = '#ffffff';
				$scope.bridgepage.swapspot.headline_font_size = 48;
				break;
			case 6:
				$scope.bridgepage.swapspot.tagline = 'Put any tagline you want up here';
				$scope.bridgepage.swapspot.headline = 'Enter your Hard-hitting Headline here to engage your audience';
				$scope.bridgepage.swapspot.optin_heading = 'Enter your best name & email';
				$scope.bridgepage.swapspot.mark_name_visible = 'block';
				$scope.bridgepage.swapspot.button = 'Sign Up';
				$scope.bridgepage.swapspot.name_placeholder = 'Full Name...';
				$scope.bridgepage.swapspot.email_placeholder = 'Email Address...'
				$scope.bridgepage.swapspot.open_term_link_in_new_tab = '_blank';
				$scope.bridgepage.swapspot.open_privacy_link_in_new_tab = '_blank';
				$scope.bridgepage.swapspot.tagline_text_color = '#ffffff';
				$scope.bridgepage.swapspot.headline_text_color = '#ffffff';
				$scope.bridgepage.swapspot.button_text_color = '#ffffff';
				$scope.bridgepage.swapspot.button_background_color = '#fe861d';
				$scope.bridgepage.swapspot.term_text_color = '#ffffff';
				$scope.bridgepage.swapspot.privacy_text_color = '#ffffff';
				$scope.bridgepage.swapspot.enable_video = 'none';
				$scope.bridgepage.swapspot.emailListId = $emailLists[ 0 ];
				$scope.bridgepage.swapspot.headline_font_size = 48;
				break;
			case 7:
				$scope.bridgepage.swapspot.background_url = 'https://s3.amazonaws.com/smpub/bp/trans-webinar.jpg';
				$scope.bridgepage.swapspot.tagline_text_color = '#565656';
				$scope.bridgepage.swapspot.headline_text_color = '#39a0e1';
				$scope.bridgepage.swapspot.button_text_color = '#a18800';
				$scope.bridgepage.swapspot.button_background_color = '#ffe400';
				$scope.bridgepage.swapspot.term_text_color = '#ffffff';
				$scope.bridgepage.swapspot.privacy_text_color = '#ffffff';
				$scope.bridgepage.swapspot.popup_width = '700px';
				$scope.bridgepage.swapspot.headline = 'Enter your Hard-hitting Headline here to engage your audience';
				$scope.bridgepage.swapspot.tagline = 'Put any tagline you want up here';
				$scope.bridgepage.swapspot.open_link_new_tab = '_blank';
				$scope.bridgepage.swapspot.greentime = 0;
				$scope.bridgepage.swapspot.enable_timer = 1;
				$scope.bridgepage.swapspot.timer_settings = 2;
				$scope.bridgepage.swapspot.duration = 1;
				$scope.bridgepage.swapspot.interval = 'hours';
				$scope.bridgepage.swapspot.show_guarantee_text = 'block';
				$scope.bridgepage.swapspot.time_end_action = 1;
				$scope.bridgepage.swapspot.enable_popup = 0;
				$scope.bridgepage.swapspot.button = 'Get It Now';
				$scope.bridgepage.swapspot.open_term_link_in_new_tab = '_blank';
				$scope.bridgepage.swapspot.open_privacy_link_in_new_tab = '_blank';
				$scope.bridgepage.swapspot.headline_font_size = 48;
				break;
		}
	}

	$scope.initialize = function()
	{
		console.log( "doing initialize" );
		if( !$scope.bridgepage.id )
		{
			$scope.bridgepage.site_id = $rootScope.site.id;
		}
		$scope.visible = false;

		$scope.current_url = $rootScope.app.appUrl;
		if( $scope.bridgepage.id == undefined )
		{
			$scope.template = $scope.templates[ 1 ];
		}
		else
		{
			$scope.template = _.findWhere( $scope.templates, { id: $scope.bridgepage.template_id } );
		}

		$scope.bridgepage.id ? $scope.page_title = 'Edit page' : $scope.page_title = 'Create page';
		console.log('Bridgepage ID', $scope.bridgepage.id);
		console.log('CURRENT BRIDGEPAGE', $scope.bridgepage);
		console.log('CURRENT TEMPLATE', $scope.template);
		var seo = {};
		if( $scope.bridgepage.seo_settings )
		{
			$.each( $scope.bridgepage.seo_settings, function( key, data )
			{
				seo[ data.meta_key ] = data.meta_value;

			} );
		}
		$scope.bridgepage.seo_settings = seo;

		var swapspot = {};
		//initiate default swapspot value
		if( $scope.bridgepage.swapspots )
		{
			$.each( $scope.bridgepage.swapspots, function( key, data )
			{
				if (data.name == 'enable_timer')
				{
					swapspot[data.name] = parseInt(data.value);
				}
				swapspot[ data.name ] = data.value;
			} );
		}
		$scope.bridgepage.swapspot = swapspot;
		console.log('enable timer', $scope.bridgepage.swapspot.enable_timer);
		if( $scope.bridgepage.id != undefined )
		{
			$scope.bridgepage.swapspot.optin_action = $sce.trustAsResourceUrl( $scope.bridgepage.swapspot.optin_action );
			$scope.bridgepage.swapspot.emailListId = _.findWhere( $scope.emailLists, { id: parseInt( $scope.bridgepage.swapspot.sm_list_id ) } ) ||  _.findWhere( $scope.emailLists, { id: $scope.bridgepage.swapspot.sm_list_id + '' } );

			if( $scope.bridgepage.swapspot.access_levels ) {
				var old_level_ids = $scope.bridgepage.swapspot.access_levels.split(',');
				$scope.bridgepage.swapspot.access_levels = [];

				angular.forEach( old_level_ids, function(value){
					var new_level = _.findWhere( $scope.access_levels, {id: parseInt( value )}) || _.findWhere( $scope.access_levels, {id: value + ''});

					if( new_level )
						$scope.bridgepage.swapspot.access_levels.push( new_level );
				});
			}
		}
		else
		{
			$scope.loadDefaultValue();
		}

		if( $scope.bridgepage.swapspot.enable_popup )
		{
			$scope.bridgepage.swapspot.enable_popup = parseInt( $scope.bridgepage.swapspot.enable_popup );
		}

		if( $scope.bridgepage.swapspot.enable_timer )
		{
			$scope.bridgepage.swapspot.timer_column = 'col-sm-8';
		}
		else
		{
			$scope.bridgepage.swapspot.timer_column = 'col-sm-12';
		}

		$scope.loading = false;

	}

	$scope.range = function( min, max, step )
	{
		step = step || 1;
		var input = [];
		for( var i = min; i <= max; i += step )
		{
			input.push( i );
		}
		return input;
	};

	$scope.toTimeStamp = function( $event )
	{
		if( $scope.bridgepage.swapspot.day )
		{
			$scope.bridgepage.swapspot.timestamp = moment( $scope.bridgepage.swapspot.day ).format( 'x' );
			$scope.bridgepage.swapspot.greentime = 0;
		}
	}

	$scope.toTimeStampGreen = function()
	{
		switch( $scope.bridgepage.swapspot.interval )
		{
			case 'minutes':
				$scope.bridgepage.swapspot.greentime = $scope.bridgepage.swapspot.duration * 60 * 1000;
				break;
			case 'hours':
				$scope.bridgepage.swapspot.greentime = $scope.bridgepage.swapspot.duration * 3600 * 1000;
				break;
			case 'days':
				$scope.bridgepage.swapspot.greentime = $scope.bridgepage.swapspot.duration * 3600 * 24 * 1000;
				break;
			case 'months':
				$scope.bridgepage.swapspot.greentime = $scope.bridgepage.swapspot.duration * 3600 * 24 * 30 * 1000;
				break;
		}
	}

	$scope.toTimeStampDelay = function()
	{
		switch( $scope.bridgepage.swapspot.interval2 )
		{
			case 'minutes':
				$scope.bridgepage.swapspot.cta_delay = $scope.bridgepage.swapspot.duration2 * 60 * 1000;
				break;
			case 'hours':
				$scope.bridgepage.swapspot.cta_delay = $scope.bridgepage.swapspot.duration2 * 3600 * 1000;
				break;
			case 'days':
				$scope.bridgepage.swapspot.cta_delay = $scope.bridgepage.swapspot.duration2 * 3600 * 24 * 1000;
				break;
			case 'months':
				$scope.bridgepage.swapspot.cta_delay = $scope.bridgepage.swapspot.duration2 * 3600 * 24 * 30 * 1000;
				break;
            default:
                $scope.bridgepage.swapspot.cta_delay = 0;
		}
	}

	$scope.onBlurTitle = function( $event )
	{
		if( !$scope.bridgepage.permalink )
		{
			$scope.bridgepage.permalink = $filter( 'urlify' )( $scope.bridgepage.title );
		}
		$scope.bridgepage.seo_settings.fb_share_title = $scope.bridgepage.title;
	}
	$scope.onBlurSlug = function( $event )
	{
		if( $scope.bridgepage.permalink )
		{
			$scope.bridgepage.permalink = $filter( 'urlify' )( $scope.bridgepage.permalink );
		}
	}

	$scope.cloneBridgePage = function()
	{
		$scope.bridgepage.put().then( function( page )
		{
			toastr.success( "Bridge page has been updated!" );
			$scope.bridgepage = page;

			var clonedBridgePage = {
				access_level_type: $scope.bridgepage.access_level_type,
				permalink: $scope.bridgepage.permalink,
				seo_settings: $scope.bridgepage.seo_settings || {},
				site_id: $scope.bridgepage.site_id,
				swapspot: $scope.bridgepage.swapspot || {},
				template_id: $scope.bridgepage.template_id,
				title: $scope.bridgepage.title,
			};

			$scope.bridgepage = clonedBridgePage;

			console.log( 'cloned page: ', $scope.bridgepage );

			$scope.save( true );
		} );
	}

	$scope.close = function()
	{
        smSidebar.Close();
        smSidebar.DestroyBPSidebar();
        window.location.href = '/admin/bridge-pages';
		//$state.go('public.app.admin.bridge-pages');

	}

	$scope.save = function( cloned )
	{

		if( $scope.bridgepage.permalink == '' || $scope.bridgepage.permalink == undefined )
		{
			toastr.error( "Permalink is required" );
			return;
		}

		// if( $scope.bridgepage.title == '' || $scope.bridgepage.title == undefined )
		// {
		// 	toastr.error( "Titlte is required" );
		// 	return;
		// }

		if( $scope.bridgepage.swapspot.enable_timer )
		{
			$scope.bridgepage.swapspot.timer_column = 'col-sm-8';
		}
		else
		{
			$scope.bridgepage.swapspot.timer_column = 'col-sm-12';
		}

		if( $scope.bridgepage.swapspot.day )
		{
			$scope.bridgepage.swapspot.timestamp = moment( $scope.bridgepage.swapspot.day ).format( 'x' );
		}

		if( $scope.bridgepage.permalink == '' )
		{
			this.onBlurTitle( null );
		}

		if( $scope.bridgepage.swapspot.optin_type == 'sm' )
		{
			$scope.bridgepage.swapspot.optin_name_field = 'name';
			$scope.bridgepage.swapspot.optin_email_field = 'email';
			$scope.bridgepage.swapspot.optin_action = 'https://api.smartmember.com/optin';
			$scope.bridgepage.swapspot.option_hidden_fields = '';
			if( $scope.bridgepage.swapspot.emailListId != undefined )
			{
				$scope.bridgepage.swapspot.option_hidden_fields += '<input type="hidden" name="list" value="' + $scope.bridgepage.swapspot.emailListId.id + '">\n' +
					'<input type="hidden" name="account_id" value="' + $scope.user.id + '">\n';
				$scope.bridgepage.swapspot.sm_list_id = $scope.bridgepage.swapspot.emailListId.id;
			}

			if ( $scope.bridgepage.swapspot.access_levels != undefined)
			{
				var level_ids = [];

				angular.forEach( $scope.bridgepage.swapspot.access_levels, function(value){
					level_ids.push( value.id );
				});

				level_ids = level_ids.join(',');

				$scope.bridgepage.swapspot.option_hidden_fields += '<input type="hidden" name="access_levels" value="' + level_ids + '">';
				$scope.bridgepage.swapspot.access_levels = level_ids;
			}

			if( $scope.bridgepage.swapspot.redirect_url != undefined )
				$scope.bridgepage.swapspot.option_hidden_fields += '<input type="hidden" name="redirect_url" value="' + $scope.bridgepage.swapspot.redirect_url + '">\n';

		}

		if( $scope.bridgepage.swapspot.turn_optin_to_member == '1' || $scope.bridgepage.swapspot.turn_optin_to_member )
		{
			if( $scope.bridgepage.swapspot.option_hidden_fields != undefined && $scope.bridgepage.swapspot.option_hidden_fields.indexOf( 'site_id' ) == -1 )
			{
				$scope.bridgepage.swapspot.option_hidden_fields += '<input type="hidden" name="site_id" value="' + $scope.bridgepage.site_id + '">';
			}
		}


		$scope.bridgepage.template_id = $scope.template.id;
		$scope.bridgepage.site_id = $site.id;
		if( $scope.bridgepage.id )
		{
			$scope.bridgepage.put().then( function( response )
			{
				$scope.close();
				toastr.success( "Bridge page has been updated!" );
			} )
		}
		else
		{
			Restangular.all( 'bridgePage' ).post( $scope.bridgepage ).then( function( page )
			{
				$scope.bridgepage = page;

				if( typeof cloned == 'undefined' || cloned != true )
				{
					$scope.close();
					toastr.success( "Bridge page has been saved!" );
				}
				else
				{
					$state.go( "public.app.admin.bridge-page", { id: page.id } );
					window.scrollTo( 0, 0 );
					toastr.success( "Bridge page has been cloned!" );
				}
			} );
		}

	}

	$scope.addSiteHiddenField = function()
	{
		if( $scope.bridgepage.swapspot.option_hidden_fields != undefined )
		{
			$scope.bridgepage.swapspot.option_hidden_fields += '<input type="hidden" name="site_id" value="' + $scope.bridgepage.site_id + '">';
		}
		else
		{
			$scope.bridgepage.swapspot.option_hidden_fields = '<input type="hidden" name="site_id" value="' + $scope.bridgepage.site_id + '">';
		}
	}

	$scope.setForm = function()
	{
		$scope.isSetForm = true;
		var optin_html = $scope.bridgepage.swapspot.optin_form;

		var hidden_inputs = '';
		$( optin_html ).find( 'input[type=hidden]' ).each( function()
		{
			hidden_inputs += $( this ).wrap( '<div>' ).parent().html() + "\n";
		} );

		if( typeof $( 'input', optin_html )[ 0 ].closest( 'form' ) != 'undefined' && typeof $( $( 'input', optin_html )[ 0 ].closest( 'form' ) ).attr( 'action' ) != 'undefined' )
		{
			var form_action = $( $( 'input', optin_html )[ 0 ].closest( 'form' ) ).attr( 'action' );

			var name_field = '';

			if( typeof $( optin_html ).find( 'input[name=name]' ) != 'undefined' && $( optin_html ).find( 'input[name=name]' ).length > 0 )
			{
				name_field = 'name';
			}
			else if( typeof $( optin_html ).find( 'input[name=full_name]' ) != 'undefined' && $( optin_html ).find( 'input[name=full_name]' ).length > 0 )
			{
				name_field = 'full_name';
			}
			else if( typeof $( optin_html ).find( 'input[name=fname]' ) != 'undefined' && $( optin_html ).find( 'input[name=fname]' ).length > 0 )
			{
				name_field = 'fname';
			}
			else
			{
				$( optin_html ).find( 'input:not([type=hidden])' ).each( function()
				{
					if( typeof $( this ).attr( 'name' ) != 'undefined' && $( this ).attr( 'name' ).indexOf( 'name' ) != -1 )
					{
						name_field = $( this ).attr( 'name' );
						return false;
					}
				} );
			}
			var name_options = [];
			var email_options = [];

			$( optin_html ).find( 'input:not([type=hidden]):not([type=submit]):not([type=image])' ).each( function()
			{
				if( typeof $( this ).attr( 'name' ) != 'undefined' )
				{
					name_options.push( $( this ).attr( 'name' ) );
					email_options.push( $( this ).attr( 'name' ) );
				}
			} );

			$scope.bridgepage.swapspot.name_options = name_options;
			$scope.bridgepage.swapspot.email_options = email_options;

			var email_field = $( optin_html ).find( 'input[name=email]' ).attr( 'name' );
			if( typeof $( optin_html ).find( 'input[name=email]' ) != 'undefined' && $( optin_html ).find( 'input[name=email]' ).length > 0 )
			{
				email_field = 'email';
			}
			else if( typeof $( optin_html ).find( 'input[name=email_address]' ) != 'undefined' && $( optin_html ).find( 'input[name=email_address]' ).length > 0 )
			{
				email_field = 'email_address';
			}
			else if( typeof $( optin_html ).find( 'input[name=emailaddress]' ) != 'undefined' && $( optin_html ).find( 'input[name=emailaddress]' ).length > 0 )
			{
				email_field = 'emailaddress';
			}
			else
			{
				$( optin_html ).find( 'input:not([type=hidden])' ).each( function()
				{
					if( typeof $( this ).attr( 'name' ) != 'undefined' && $( this ).attr( 'name' ).indexOf( 'email' ) != -1 )
					{
						email_field = $( this ).attr( 'name' );
						return false;
					}
				} );
			}
			if( $scope.bridgepage.swapspot.option_hidden_fields != undefined )
			{
				$scope.bridgepage.swapspot.option_hidden_fields += hidden_inputs;
			}
			else
			{
				$scope.bridgepage.swapspot.option_hidden_fields = hidden_inputs;
			}

			$scope.bridgepage.swapspot.optin_action = form_action;
			$scope.bridgepage.swapspot.optin_name_field = name_field;
			$scope.bridgepage.swapspot.optin_email_field = email_field;
			toastr.success( "Your form has been parsed successfully" );
		}
		else
		{
			toastr.error( "We could not parse this form. Make sure it has valid form tag" );
		}
	}


} );

app.controller( 'bridgepageEngineController', function( $scope, $timeout , $localStorage, smSidebar, $q, $state, $stateParams, $filter, Restangular, toastr, Upload, $rootScope, $window, $sce )
{
	$scope.original_data = [];
	$rootScope.viewport = '';
	$scope.template = '';
	$scope.show_options = false;

	$scope.toggleSidebar = function()
	{
		smSidebar.mobileToggle( '.left_bp_sidebar_contents' );
		$scope.show_options = !$scope.show_options;
	}

    $scope.toggleDesktopSidebar = function()
	{
		smSidebar.Toggle( '.left_bp_sidebar_contents' );
		$scope.show_options = !$scope.show_options;
	}

	$scope.toggleViewPort = function( option )
	{
		if( $rootScope.viewport == option )
		{
			return;
		}
		$rootScope.viewport = option;
	}

	$scope.close = function()
	{
		smSidebar.Close();
		smSidebar.DestroyBPSidebar();
		window.location.href = '/admin/bridge-pages';

		$rootScope.viewport = '';
	}

	$scope.$on( '$destroy', function()
	{
		console.log( $scope.original_data );

		$scope.destroyed = true;
		//window.location.href = '/';
		$timeout(function(){
			$state.transitionTo( $state.current, $stateParams, {
				reload: true, inherit: false, location: false
			} );
		} , 1000)

	} );
} );