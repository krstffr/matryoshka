Package.describe({
  "summary": "A tiny cms for handling stuff."
});

Package.on_use(function (api) {

	api.use('reactive-dict', ['client', 'server']);
	api.use('deps', ['client', 'server']);
	api.use('underscore', ['client', 'server']);
	api.use('ejson', ['client', 'server']);

	api.use('templating', 'client');
	api.use('handlebars', 'client');
	api.use('jquery', 'client');

	api.add_files(['client/views/boxcms__rootContainer.html', 'client/views/boxcms__rootContainer.html'], 'client');
	
});