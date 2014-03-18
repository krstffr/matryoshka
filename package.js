Package.describe({
  "summary": "A tiny cms for handling recursive js objects or something."
});

Package.on_use(function (api) {

	api.use('underscore', ['client', 'server']);
	api.use('templating', 'client');
	api.use('handlebars', 'client');
	api.use('jquery', 'client');

	api.add_files('lib/collections/matroyshka__nestables.js', ['server', 'client']);

	api.add_files('lib/matroyshka__methods.js', 'server');

	api.add_files('lib/css/stylesheets/matroyshka__main.css', 'client');

	api.add_files('lib/views/matroyshka__nestablePartButtons.html', 'client');

	api.add_files('lib/views/matroyshka__rootContainer.html', 'client');
	api.add_files('lib/views/matroyshka__rootContainer.js', 'client');

	api.add_files('lib/views/matroyshka__mainMenu.html', 'client');
	api.add_files('lib/views/matroyshka__mainMenu.js', 'client');

	api.add_files('lib/views/matroyshka__partLooper.html', 'client');
	api.add_files('lib/views/matroyshka__partLooper.js', 'client');

	api.add_files('lib/matroyshka__globalHelpers.js', 'client');
	api.add_files('lib/matroyshka__router.js', 'client');
	api.add_files('lib/matroyshka__matroyshkaHandler.js', 'client');

	if (typeof api.export !== 'undefined') {
		
		api.use(['font-awesome', 'iron-router'], 'client');

		// The main object.
		api.export('Matroyshka', 'client');

		// The Collection where we store stuff.
		api.export('MatroyshkaNestables', ['client', 'server']);

	}

});