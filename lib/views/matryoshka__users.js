Template.matryoshka__users.helpers({
	authorizedUsers: function () {
		return Matryoshka.users.getAuthorizedUsers();
	},
	nonAuthorizedUsers: function () {
		return Matryoshka.users.getNonAuthorizedUsers();
	}
});

Template.matryoshka__users.events({
	'click .create-user': function ( e ) {
		var newUser = { profile: {} };
		newUser.username = $('#username').val();
		newUser.profile.name = $('#name').val();
		newUser.password = $('#password').val();
		newUser.profile.matryoshkaLevel = $('#matryoshka-level').val();

		Matryoshka.users.createUser( newUser, false, function ( err, res ) {
			if (err)
        return Matryoshka.messages.add({ message: err.reason, type: 'error' });
      $('input').val('');
      Matryoshka.messages.add({ message: 'User created!', type: 'success' });
		});
	},
	'click .logout': function () {
		Meteor.logout();
	},
	'click .delete-user': function () {
		if (!confirm('Are you sure you want to delete this user?'))
			return ;

		var userIdToRemove = this._id;

		Matryoshka.users.deleteUser( userIdToRemove, function (err, res) {
			if (err)
        return Matryoshka.messages.add({ message: err.reason, type: 'error' });
      $('input').val('');
      Matryoshka.messages.add({ message: 'User removed!', type: 'success' });
		});

	}
});