Package.describe({
  "summary": "A tiny cms for handling stuff."
});

Package.on_use(function (api) {
	api.add_files(['client/views/boxcms__rootContainer.html', 'client/views/boxcms__rootContainer.html'], 'client');
});