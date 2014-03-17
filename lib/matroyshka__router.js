Router.map(function () {

	this.route('matroyshka', {
		path: '/matroyshka/:action?/:_id?',
		template: 'matroyshka__rootContainer',
		waitOn: function () {

			if (this.params.action === 'edit' && this.params._id) {
				return Meteor.subscribe('matroyshkaNestableFromId', this.params._id );
			}

			return ;

		},
		before: function () {
			if (this.params.action === 'edit' && this.params._id)
				Session.set('matroyshkaCurrentNestable', MatroyshkaNestables.findOne({ _id: this.params._id }) );
		}
	});

});