Router.onBeforeAction(function () {
	// TODO: This is not super clean.
	if (Matryoshka.loginRequired === undefined)
		throw new Error("You must pass a bool to Matryoshka.requireLogin( bool )! Decide wether it's open for all or not.");
	if (Matryoshka.loginRequired) {
		if (!Meteor.userId) Router.go('matryoshka__loginRoute');
		if (!Meteor.userId()) Router.go('matryoshka__loginRoute');
	}
}, { only: ['matryoshka__home', 'matryoshka'] });

MatryoshkaController = RouteController.extend({
	waitOn: function () {
		return Meteor.subscribe('matryoshkaNestablePartsForMenu');
	},
	onStop: function () {
		Matryoshka.filter.reset();
	},
	onAfterAction: function () {

		// Add the matryoshka body class
		$('body').removeClass().addClass('matryoshka__body');

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
			// Make sure we're logged in
			if (!Matryoshka.checkLoginReq() && !Meteor.userId())
				Router.go('matryoshka__loginRoute');
			// If the user has created her own custom first page,
			// use it instead of the default one.
			if (Template.matryoshka__firstPageTemplateCustom)
				this.template = 'matryoshka__firstPageTemplateCustom';
		}
	});

	this.route('matryoshka', {
		path: '/matryoshka/:action?/:_id?/:secondAction?/:secondActionParam?',
		layoutTemplate: 'matryoshka__rootContainer',
		template: 'matryoshka__partLooper',
		controller: MatryoshkaController,
		onRun: function() {
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

			if (this.params.secondAction === 'focusOnPart' && this.params.secondActionParam)
				matryoshka__focusOnPagePart( this.params.secondActionParam );
		}
	});

});
