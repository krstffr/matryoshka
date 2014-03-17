MatroyshkaNestables = new Meteor.Collection('matroyshkaNestables');

if (Meteor.isServer) {

	Meteor.publish('matroyshkaNestableFromId', function ( _id ) {
		return MatroyshkaNestables.find({ _id: _id, matroyshkaStatus: 'editable' });
	});

}