Router.map(function () {

	this.route('matroyshka', {
		path: '/matroyshka/:action?/:_id?',
		template: 'matroyshka__rootContainer',
		waitOn: function () {

			var menuItems = Meteor.subscribe('matroyshkaNestablePartsForMenu');

			if (this.params.action === 'edit' && this.params._id) {
				return [ Meteor.subscribe('matroyshkaNestableFromId', this.params._id ), menuItems ];
			}

			return ;

		},
		before: function () {
			if (this.params.action === 'edit' && this.params._id) {
				Session.set('matroyshkaCurrentNestable', MatroyshkaNestables.findOne({ _id: this.params._id }) );
				// Hack to make sure it does not create an infinite loop (or something)
				Meteor.setTimeout(Matroyshka.updateFieldsInTemplate, 1);
			}
			// console.log('router, before fired!');
		}
	});

});