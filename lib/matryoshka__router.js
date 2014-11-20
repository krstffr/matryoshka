Router.onBeforeAction(function () {

	// Make sure setup is done, else redirect to setup page
	if (Matryoshka.users.loginRequired === undefined)
		Router.go('matryoshka__setupRoute');

	// Make sure we're authorized
	if (this.ready() && !Matryoshka.users.userIsPermitted())
		Router.go('matryoshka__loginRoute');

	this.next();

}, { only: ['matryoshka__home', 'matryoshka', 'matryoshka__users'] });

MatryoshkaController = RouteController.extend({
	onBeforeAction: function () {
		this.render('matryoshka__loadingTemplate');
		this.next();
	},
	waitOn: function () {
		// Add the matryoshka body class
		Matryoshka.DOMhelpers.body.addMainClass();
		return [ Meteor.subscribe('matryoshkaNestablePartsForMenu'), Meteor.subscribe('matryoshkaAdditionalUserFields') ];
	},
	onStop: function () {
		Matryoshka.filter.reset();
	},
	onAfterAction: function () {

		// Show loading template…
		if (!this.ready())
			this.render('matryoshka__loadingTemplate');

		var title = 'Matryoshka';

		var currentNestable = Matryoshka.currentNestable.get();

		if ( currentNestable && currentNestable.matryoshkaName )
			title += ' - ' + currentNestable.matryoshkaName;

		// Set the title
		$('title').text( title );

	}
});

Router.map(function () {

	this.route('matryoshka__setupRoute', {
		path: '/matryoshka/setup',
		template: 'matryoshka__statusMessage',
		controller: MatryoshkaController,
		onBeforeAction: function () {
			if (Matryoshka.users.loginRequired !== undefined)
				Router.go('matryoshka__home');
			this.next();
		},
		data: function () {
			return {
				headline: 'Additional setup required',
				message: '<p>You need to decide wether or not login should be required for Matryoshka, and you do this by passing a Boolean to Matryoshka.users.requireLogin( bool ) on both the server and the client like this:</p><pre>// If you wan\'t anybody to be able to access  Matryoshka:\nMatryoshka.users.requireLogin( false );\n\n// If only logged in users (any logged in user!)\n// should be able to access Matryoshka:\nMatryoshka.users.requireLogin( true, false );\n\n// If you only want logged in users which have\n// Meteor.user().matryoshkaLevel === \'admin\'\n// to be able to access Matryoshka:\nMatryoshka.users.requireLogin( true, true );</pre>'
			};
		}
	});

	this.route('matryoshka__loginRoute', {
		path: '/matryoshka/login',
		template: 'matryoshka__login',
		controller: MatryoshkaController
	});

	this.route('matryoshka__home', {
		path: '/matryoshka/',
		layoutTemplate: 'matryoshka__rootContainer',
		template: 'matryoshka__firstPageTemplate',
		controller: MatryoshkaController,
		onBeforeAction: function () {
			// If the user has created her own custom first page,
			// use it instead of the default one.
			if (Template.matryoshka__firstPageTemplateCustom)
				this.template = 'matryoshka__firstPageTemplateCustom';
			this.next();
		}
	});

	this.route('matryoshka__users', {
		path: '/matryoshka/users',
		layoutTemplate: 'matryoshka__rootContainer',
		template: 'matryoshka__users',
		waitOn: function () {
			return Meteor.subscribe('matryoshkaUsers');
		},
		controller: MatryoshkaController
	});

	this.route('matryoshka', {
		path: '/matryoshka/:action?/:_id?/:secondAction?/:secondActionParam?',
		layoutTemplate: 'matryoshka__rootContainer',
		template: 'matryoshka__partLooper',
		controller: MatryoshkaController,
		onRun: function() {

			// Remove any current focus
			Matryoshka.DOMhelpers.focus.reset();

			// Add any new focus (from the URL params)
			if (this.params.secondAction === 'focusOnPart' && this.params.secondActionParam)
				Matryoshka.DOMhelpers.focus.focusOnPagePart( this.params.secondActionParam );

			window.scroll(0,0);
			// Init all user defined fields
			_.each(Matryoshka.userDefinedFields.fields, function( userDefinedField ){
				if (!userDefinedField.initMethod)
					return ;
				if (typeof userDefinedField.initMethod === 'function')
					return userDefinedField.initMethod();
				else
					throw new Error(".initMethod() of "+userDefinedField.name+' is not a method, is: ', typeof userDefinedField.initMethod );
			});

		},
		data: function() {

			var currentNestable = Matryoshka.currentNestable.get();

			if (!currentNestable && this.params._id) {
				var nestableToEdit = MatryoshkaNestables.findOne({ _id: this.params._id });
				Matryoshka.currentNestable.set( nestableToEdit );
			}

			if (currentNestable)
				return currentNestable;

		},
		waitOn: function () {

			if (this.params.action === 'edit' && this.params._id)
				return Meteor.subscribe('matryoshkaNestableFromId', this.params._id );

			return ;

		},
		onStop: function () {
			Matryoshka.currentNestable.setToFalse();
		},
		onAfterAction: function () {
			
			// Remove any current filters
			Matryoshka.filter.hide();

		}
	});

});
