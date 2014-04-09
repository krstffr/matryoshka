MatryoshkaController = RouteController.extend({
	onAfterAction: function () {
		$('body').addClass('matryoshka__body');
	}
});


Router.map(function () {

	this.route('matryoshka__loginRoute', {
		path: '/matryoshka/login',
		template: 'matryoshka__login',
		controller: MatryoshkaController
	});

	this.route('matryoshka', {
		path: '/matryoshka/:action?/:_id?',
		template: 'matryoshka__rootContainer',
		controller: MatryoshkaController,
		data: function() {

			console.log('matryoshka: called data');

			if (!Session.get('matryoshkaCurrentNestable') && this.params._id) {
				var nestableToEdit = MatryoshkaNestables.findOne({ _id: this.params._id });
				console.log('in data: setting new session: matryoshkaCurrentNestable');
				Session.set('matryoshkaCurrentNestable', nestableToEdit );
			}

			if (Session.get('matryoshkaCurrentNestable'))
				return Session.get('matryoshkaCurrentNestable');

		},
		waitOn: function () {

			// TODO: This is not super clean.
			if (Matryoshka.loginRequired) {
				if (!Meteor.userId) Router.go('matryoshka__loginRoute');
				if (!Meteor.userId()) Router.go('matryoshka__loginRoute');
			}

			console.log('matryoshka: called waitOn');

			var menuItems = Meteor.subscribe('matryoshkaNestablePartsForMenu');

			if (this.params.action === 'edit' && this.params._id) {
				// Reset this session if we're here
				console.log('Resetting session: matryoshkaCurrentNestable');
				Session.set('matryoshkaCurrentNestable', false );
				return [ Meteor.subscribe('matryoshkaNestableFromId', this.params._id ), menuItems ];
			}

			return ;

		}
	});

});
