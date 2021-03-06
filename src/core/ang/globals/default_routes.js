app.config( function( $httpProvider, $urlRouterProvider, $locationProvider )
{
	$locationProvider.html5Mode( {
		enabled: true,
		requireBase: true
	} );

	$httpProvider.interceptors.push( 'httpInterceptor' );

	var parts = location.hostname.split( '.' );
	var subdomain = parts.shift();
	var possible_domain = parts.shift();
	var tld = parts.shift();

	$urlRouterProvider.when( '/', function( $injector )
	{
		var $state = $injector.get( '$state' );

		if( !location.host.isCustomDomain() && possible_domain == 'smartmember' && parts.length === 0 && tld != 'io' )
		{
			if( subdomain == "my" )
			{
				$state.go('public.my');
				/*window.location.href = 'http://www.' + possible_domain + '.' + parts.join('.');*/
			}
			else if( subdomain == "app" )
			{
				$state.go('admin.app');
			}
			else
			{
				$state.go( "public.app.site.home" );
			}
		}
		else
		{
			$state.go( "public.app.site.home" );
		}
	} );

	$urlRouterProvider.otherwise( function( $injector )
	{
		console.log( "On otherwise" );

		var $state = $injector.get( '$state' );
		var Restangular = $injector.get( 'Restangular' );

		if( !location.host.isCustomDomain() && subdomain == "my" && possible_domain == 'smartmember' && parts.length == 1 )
		{
			console.log( "Going to 'public.my' state from non-/" );
			$state.go( "public.my" );
		}
		else if( !location.host.isCustomDomain() && subdomain == "app" && possible_domain == 'smartmember' )
		{
			console.log( "Going to 'admin.app' state from non-/" );
			$state.go( "admin.app" );
		}
		else
		{
			var parts = location.pathname.split( '/' );
			if( parts.length == 2 || ( parts.length == 3 && parts[ 2 ] == '') )
			{
				Restangular.one( 'permalink', parts[ 1 ] ).get().then( function( response )
				{	
					switch( response.type )
					{
						case "lessons":
							$state.go( 'public.app.site.lesson', { permalink: parts[ 1 ] }, { location: false } );
							break;
						case "custom_pages":
							$state.go( 'public.app.site.page', { permalink: parts[ 1 ] }, { location: false } );
							break;
						case "download_center":
							$state.go( 'public.app.site.download', { permalink: parts[ 1 ] }, { location: false } );
							break;
						case "livecasts":
							$state.go( 'public.app.site.livecast', { permalink: parts[ 1 ] }, { location: false } );
							break;
						case "posts":
							$state.go( 'public.app.site.post', { permalink: parts[ 1 ] }, { location: false } );
							break;
						case "support_articles":
							$state.go( 'public.app.site.support-article', { permalink: parts[ 1 ] }, { location: false } );
							break;
						case "bridge_bpages":
							
							location.reload();

							$state.go( 'bridgepage', { permalink: parts[ 1 ] }, { location: false } );
							break;
						case "forum_topics":
							$state.go("public.app.site.forum-topic",{permalink: parts[1]}, {location: false});
							break;
						case "forum_categories":
							$state.go("public.app.site.forum-category",{permalink: parts[1]}, {location: false});
							break;
                        case 'affcontests':
                            $state.go( 'public.app.site.affiliateContest', { permalink: parts[1] }, { location: false } );
                            break;
                        case 'smart_links':
                            location.href = response.redirect_url;
                            break;
                        case 'categories':
                            $state.go( 'public.app.site.post-category', { permalink: parts[1] }, { location: false } );
                            break;
					}
				} );
			}

		}
	} );
} );