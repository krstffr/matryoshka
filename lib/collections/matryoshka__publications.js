MatryoshkaNestables = new Meteor.Collection('matryoshkaNestables');

if (Meteor.isServer) {

	// MatryoshkaNestables
	Meteor.publish('matryoshkaNestableFromId', function ( _id ) {
		if (!Matryoshka.users.userIsPermitted( this.userId )) return false;
		return MatryoshkaNestables.find({ _id: _id, matryoshkaStatus: 'editable' });
	});

	Meteor.publish('matryoshkaNestablePartsForMenu', function () {
		if (!Matryoshka.users.userIsPermitted( this.userId )) return false;
		return MatryoshkaNestables.find({ matryoshkaStatus: { $in: ['editable', 'live'] } });
	});


	// Users
	Meteor.publish('matryoshkaAdditionalUserFields', function () {
		if (!Matryoshka.users.userIsPermitted( this.userId )) return false;
		return Meteor.users.find(this.userId, { fields: { matryoshkaLevel: 1 } });
	});
	Meteor.publish('matryoshkaUsers', function () {
		if (!Matryoshka.users.userIsPermitted( this.userId )) return false;
		return Meteor.users.find({}, { fields: { username: 1 } });
	});
}
