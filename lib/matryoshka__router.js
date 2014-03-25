Router.map(function () {

	this.route('matryoshka', {
		path: '/matryoshka/:action?/:_id?',
		template: 'matryoshka__rootContainer',
		data: function() {

			console.log('called data');

			if (!Session.get('matryoshkaCurrentNestable') && this.params._id) {
				var nestableToEdit = MatryoshkaNestables.findOne({ _id: this.params._id });
				console.log('in data: setting new session: matryoshkaCurrentNestable');
				Session.set('matryoshkaCurrentNestable', nestableToEdit );
			}

			if (Session.get('matryoshkaCurrentNestable'))
				return Session.get('matryoshkaCurrentNestable');

		},
		waitOn: function () {

			console.log('called waitOn');

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