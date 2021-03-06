app.factory( 'Wizards', function()
{
	var self = {};
	self.GetAll = function()
	{
		return [
			{
				"slug": 'site_content_wizard',
				"parent": '',
				"feature": "Site Content Wizard",
				"heading": "Fill your site with content",
				"enabled": true,
				"completed": false,
				"name": "Fill your site with content",
				"nodes": [
					"upload_site_logo",
					"create_site_modules",
					"create_site_lessons",
					"lock_site_content",
					"invite_members"
				]
			},

			{
				"slug": 'site_launch_wizard',
				"parent": '',
				"feature": "Site Launch Wizard",
				"heading": "Get your site launch-ready",
				"description": "Now that you've created a site, it's time to fill it with content.",
				"enabled": true,
				"completed": false,
				"name": "Get your site launch-ready",
				"nodes": [
					"upload_site_logo",
					"create_site_modules",
					"create_site_lessons",
					"lock_site_content",
					"invite_members"
				]
			},

			{
				"slug": 'account_wizard',
				"parent": '',
				"feature": "Smart Member Setup Wizard",
				"heading": "Get your site launch-ready",
				"description": "Congratz! Now that you have an account, it's time to create a site.",
				"enabled": true,
				"completed": false,
				"name": "Smart Member Setup Wizard",
				"nodes": [
					"create_new_site"
				]
			}
		]
	};

	self.GetCurrent = function( slug )
	{
		var all = self.GetAll();

		for( var i = 0; i < all.length; i++ )
		{
			if( all[ i ].slug == slug )
			{
				return all[ i ];
			}
		}
		return {};
	};

	return self;
} );