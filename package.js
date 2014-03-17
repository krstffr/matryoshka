Package.describe({
  "summary": "A tiny cms for handling recursive js objects or something."
});

Package.on_use(function (api) {

	api.use('underscore', ['client', 'server']);
	api.use('templating', 'client');
	api.use('handlebars', 'client');
	api.use('jquery', 'client');

	api.add_files('lib/css/matroyshka__tempStyles.css', 'client');

	api.add_files('lib/views/matroyshka__rootContainer.html', 'client');
	api.add_files('lib/views/matroyshka__rootContainer.js', 'client');

	api.add_files('lib/views/matroyshka__partLooper.html', 'client');
	api.add_files('lib/views/matroyshka__partLooper.js', 'client');

	api.add_files('lib/matroyshka__globalHelpers.js', 'client');
	api.add_files('lib/matroyshka__router.js', 'client');
	api.add_files('lib/matroyshka__matroyshkaHandler.js', 'client');

	if (typeof api.export !== 'undefined') {
		api.use('iron-router', 'client');

		api.export('Matroyshka', ['client']);
	}

});