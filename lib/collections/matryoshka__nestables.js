MatryoshkaNestables = new Meteor.Collection('matryoshkaNestables');

if (Meteor.isServer) {

	Meteor.publish('matryoshkaNestableFromId', function ( _id ) {
		if (!Matryoshka.userIsPermitted( this.userId )) return false;
		return MatryoshkaNestables.find({ _id: _id, matryoshkaStatus: 'editable' });
	});

	Meteor.publish('matryoshkaNestablePartsForMenu', function () {
		if (!Matryoshka.userIsPermitted( this.userId )) return false;
		return MatryoshkaNestables.find({ matryoshkaStatus: { $in: ['editable', 'live'] } });
	});

}
