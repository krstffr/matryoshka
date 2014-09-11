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

		// Set the title
		$('title').text('Matryoshka');

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
		data: function() {

			if (!Session.get('matryoshkaCurrentNestable') && this.params._id) {
				var nestableToEdit = MatryoshkaNestables.findOne({ _id: this.params._id });
				Session.set('matryoshkaCurrentNestable', nestableToEdit );
			}

			if (Session.get('matryoshkaCurrentNestable'))
				return Session.get('matryoshkaCurrentNestable');

		},
		waitOn: function () {

			if (this.params.action === 'edit' && this.params._id) {
				// Reset this session if we're here
				Session.set('matryoshkaCurrentNestable', false );
				return Meteor.subscribe('matryoshkaNestableFromId', this.params._id );
			}

			return ;

		},
		onStop: function () {
			Session.set('matryoshkaCurrentNestable', false );
		},
		onAfterAction: function () {
			if (this.params.secondAction === 'focusOnPart' && this.params.secondActionParam)
				matryoshka__focusOnPagePart( this.params.secondActionParam );
		}
	});

});
