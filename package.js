Package.describe({
  summary: "A GUI for nesting and linking objects inside other objects.",
  name: "krstffr:matryoshka",
  version: "1.0.4",
  git: "https://github.com/krstffr/matryoshka.git"
});

Package.onUse(function (api) {

  // Set versions from.
  api.versionsFrom("METEOR@0.9.0");

  // Server/Client stuff
  api.use('underscore', ['client', 'server']);

  // Client stuff
  api.use([
    'templating',
    'handlebars',
    'jquery',
    'krstffr:msgs@0.0.2',
    'iron:router@0.9.0',
    'pfafman:font-awesome-4@4.2.0'
    ], 'client');

  api.add_files('lib/collections/matryoshka__nestables.js', ['server', 'client']);

  api.add_files('lib/img/matryoshka-logo.png', 'client');

  api.add_files('lib/matryoshka__methods.js', 'server');

  api.add_files('lib/matryoshka__globalHelpers.js', 'client');

  api.add_files('lib/css/stylesheets/matryoshka__main.css', 'client');

  api.add_files('lib/views/matryoshka__UImenuButtons.js', 'client');

  api.add_files('lib/views/matryoshka__firstPageTemplate.html', 'client');

  api.add_files('lib/views/matryoshka__login.html', 'client');
  api.add_files('lib/views/matryoshka__login.js', 'client');

  api.add_files('lib/views/matryoshka__fixedButton.html', 'client');
  api.add_files('lib/views/matryoshka__fixedButton.js', 'client');

  api.add_files('lib/views/matryoshka__nestablePartButtons.html', 'client');
  api.add_files('lib/views/matryoshka__nestablePartButtons.js', 'client');

  api.add_files('lib/views/matryoshka__nestableSubPartButtons.html', 'client');
  api.add_files('lib/views/matryoshka__nestableSubPartButtons.js', 'client');

  api.add_files('lib/views/matryoshka__filter.html', 'client');
  api.add_files('lib/views/matryoshka__filter.js', 'client');

  api.add_files('lib/views/matryoshka__rootContainer.html', 'client');
  api.add_files('lib/views/matryoshka__rootContainer.js', 'client');

  api.add_files('lib/views/matryoshka__mainMenu.html', 'client');
  api.add_files('lib/views/matryoshka__mainMenu.js', 'client');

  api.add_files('lib/views/matryoshka__partLooper.html', 'client');
  api.add_files('lib/views/matryoshka__partLooper.js', 'client');

  api.add_files('lib/views/matryoshka__fields.html', 'client');
  api.add_files('lib/views/matryoshka__fields.js', 'client');

  api.add_files('lib/views/matryoshka__addPartOverlay.html', 'client');
  api.add_files('lib/views/matryoshka__addPartOverlay.js', 'client');

  api.add_files('lib/matryoshka__router.js', 'client');

  api.add_files('lib/matryoshka__matryoshkaHandler.js', ['client', 'server']);

  // The main object.
  api.export('Matryoshka', ['server', 'client']);

  // The Collection where we store stuff.
  api.export('MatryoshkaNestables', ['client', 'server']);

});
