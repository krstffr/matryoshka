Router.map(function () {

	this.route('matryoshka', {
		path: '/matryoshka/:action?/:_id?',
		template: 'matryoshka__rootContainer',
		waitOn: function () {

			var menuItems = Meteor.subscribe('matryoshkaNestablePartsForMenu');

			if (this.params.action === 'edit' && this.params._id) {
				return [ Meteor.subscribe('matryoshkaNestableFromId', this.params._id ), menuItems ];
			}

			return ;

		},
		before: function () {
			if (this.params.action === 'edit' && this.params._id) {
				var nestableToEdit = MatryoshkaNestables.findOne({ _id: this.params._id });
				Session.set('matryoshkaCurrentNestable', nestableToEdit );
				// Hack to make sure it does not create an infinite loop (or something)
				// Meteor.setTimeout(Matryoshka.updateFieldsInTemplate, 100);
			}
			// console.log('router, before fired!');
		}
	});

});