Router.onBeforeAction(function () {
	// TODO: This is not super clean.
	if (Matryoshka.users.loginRequired === undefined)
		throw new Error("You must pass a bool to Matryoshka.users.requireLogin( bool )! Decide wether it's open for all or not.");
	if (Matryoshka.users.loginRequired) {
		if (!Matryoshka.users.userIsPermitted()) Router.go('matryoshka__loginRoute');
	}
}, { only: ['matryoshka__home', 'matryoshka', 'matryoshka__users'] });

MatryoshkaController = RouteController.extend({
	onBeforeAction: function () {
		// Add the matryoshka body class
		Matryoshka.DOMhelpers.body.addMainClass();
	},
	waitOn: function () {
		return [ Meteor.subscribe('matryoshkaNestablePartsForMenu'), Meteor.subscribe('matryoshkaAdditionalUserFields') ];
	},
	onStop: function () {
		Matryoshka.filter.reset();
	},
	onAfterAction: function () {

		var title = 'Matryoshka';

		var currentNestable = Matryoshka.currentNestable.get();

		if ( currentNestable && currentNestable.matryoshkaName )
			title += ' - ' + currentNestable.matryoshkaName;

		// Set the title
		$('title').text( title );

	}
});

Router.map(function () {

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

			if (this.params.action === 'edit' && this.params._id) {
				// Reset this session if we're here
				Matryoshka.currentNestable.set( false );
				return Meteor.subscribe('matryoshkaNestableFromId', this.params._id );
			}

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
