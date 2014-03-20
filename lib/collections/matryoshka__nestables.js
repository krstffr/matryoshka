MatryoshkaNestables = new Meteor.Collection('matryoshkaNestables');

if (Meteor.isServer) {

	Meteor.publish('matryoshkaNestableFromId', function ( _id ) {
		return MatryoshkaNestables.find({ _id: _id, matryoshkaStatus: 'editable' });
	});

	Meteor.publish('matryoshkaNestablePartsForMenu', function () {
		return MatryoshkaNestables.find({ matryoshkaStatus: { $in: ['editable', 'live'] } });
	});

}