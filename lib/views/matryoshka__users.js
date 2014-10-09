Template.matryoshka__users.helpers({
	authorizedUsers: function () {
		return Matryoshka.users.getAuthorizedUsers();
	},
	nonAuthorizedUsers: function () {
		return Matryoshka.users.getNonAuthorizedUsers();
	}
});