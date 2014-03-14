Package.describe({
  "summary": "A tiny cms for handling recursive js objects or something."
});

Package.on_use(function (api) {

	api.use('underscore', ['client', 'server']);
	api.use('templating', 'client');
	api.use('handlebars', 'client');
	api.use('jquery', 'client');

	api.add_files('lib/boxcms__tempStyles.css', 'client');

	api.add_files('lib/boxcms__rootContainer.html', 'client');
	api.add_files('lib/boxcms__rootContainer.js', 'client');

	api.add_files('lib/boxcms__partLooper.html', 'client');
	api.add_files('lib/boxcms__partLooper.js', 'client');

	api.add_files('lib/boxcms__globalHelpers.js', 'client');
	api.add_files('lib/boxcms__router.js', 'client');
	api.add_files('lib/boxcms__boxcmsHandler.js', 'client');

	if (typeof api.export !== 'undefined') {
		api.use('iron-router', 'client');

		api.export('Boxcms', ['client']);
	}

});