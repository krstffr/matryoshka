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
		Matryoshka.users.createUser( newUser, false );
	},
	'click .logout': function () {
		Meteor.logout();
	},
	'click .delete-user': function () {
		if (!confirm('Are you sure you want to delete this user?'))
			return ;
		Matryoshka.users.deleteUser( this._id, this.username );
	},
	'click .change-level': function ( e ) {
		if (!confirm('Are you sure you want to change level for this user?'))
			return ;
		var clickedBtn = $( e.currentTarget );
		var newLevel = clickedBtn.data('new-level');
		Matryoshka.users.changeUserLevel( this._id, newLevel );
	}
});