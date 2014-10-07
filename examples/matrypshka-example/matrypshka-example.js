Matryoshka.requireLogin( true );

if (Meteor.isClient) {

	Matryoshka.nestables.addType({
		name: 'page',
		createable: true
	});

	Matryoshka.nestables.add({
		nestableName: 'oneCoolNestable',
		nestableNameReadable: 'One cool nestable!',
		type: 'page',
		fields: [{
			name: 'aCooltextInput',
			description: 'A cool input',
			type: 'text'
		}],
		nestables: [{ name: 'page', nestables: ['aNestedNestable'] }]
	});

	Matryoshka.nestables.add({
		nestableName: 'aNestedNestable',
		nestableNameReadable: 'One cool nestable!',
		createable: false,
		type: 'page',
		fields: [{
			name: 'input',
			description: 'A nested cool input',
			type: 'text'
		}, {
			name: 'aSelect',
			description: 'Select something!',
			type: 'select',
			selectableData: [{ name: 'One', value: 1 }, { name: 'Two', value: 2 }]
		}]
	});

}