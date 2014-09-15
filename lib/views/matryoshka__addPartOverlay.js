Template.matryoshka__addPartOverlay.helpers({
	nestableTypes: function () {

		if (!Session.get('matryoshka__addPartOverlay')) return;

		// This is the object set from the button press
		var parentNestable = Session.get('matryoshka__addPartOverlay');

		// Get the defined nestable type from the Matryoshka object
		var nestableType = Matryoshka.nestables[parentNestable.type];

		var nestable = _(nestableType).findWhere({ nestableName: parentNestable.nestableName });

		return nestable.nestables;

	},
	nestables: function() {

		if (!Session.get('matryoshka__addPartOverlay')) return;

		var nestableNamesToFilter = this.nestables;
		var allNestables = Matryoshka.nestables[this.name];

		if (typeof nestableNamesToFilter !== 'object') return allNestables;

		var filteredNestables = _(allNestables).map( function( nestable ) {
			if ( nestableNamesToFilter.indexOf( nestable.nestableName ) > -1 )
				return nestable;
		});

		filteredNestables = _(filteredNestables).compact();

		return filteredNestables;

	},
	filteredNestables: function ( nestables ) {
		return Matryoshka.filter.filterCollection( nestables, ['nestableNameReadable', 'nestableName'] );
	},
	matryoshkaId: function() {

		if (!Session.get('matryoshka__addPartOverlay')) return;

		return Session.get('matryoshka__addPartOverlay').matryoshkaId;

	},
	savedNestableParts: function() {

		var savedNestableParts = MatryoshkaNestables.find({ matryoshkaStatus: 'live', nestableName: this.nestableName }).fetch();

		// Add nestableNameReadable as is defined in the code for all found savedNestableParts, cause we need it in the filtering
		savedNestableParts = _(savedNestableParts).map( function( nestablePart ) {
			var nestableDefinedInCode = Matryoshka.nestablePart.getNestablePartData( nestablePart.type, nestablePart.nestableName );
			nestablePart.nestableNameReadable = nestableDefinedInCode.nestableNameReadable;
			return nestablePart;
		});

		return Matryoshka.filter.filterCollection( savedNestableParts, ['matryoshkaName', 'nestableNameReadable', 'nestableName'] );
		
	}
});

Template.matryoshka__addPartOverlay.events({
	'click .add-part': function (e) {

		e.stopImmediatePropagation();

		var defaultNewObject = {
			matryoshkaId: Matryoshka.nestablePart.generateId(),
			creationDate: new Date()
		};
		var clickedBtn = $(e.currentTarget);
		var matryoshkaId = Session.get('matryoshka__addPartOverlay').matryoshkaId;
		var key = 'nestedNestables';
		var value = _.extend( _( this ).pick('type', 'nestableName'), defaultNewObject);

		Matryoshka.currentNestable.update( matryoshkaId, 'put', key, value );

		matryoshka__toggleAddPartOverlay( clickedBtn, 'hide' );

		// Reset the session var now that the nestable is in place
		Session.set('matryoshka__addPartOverlay', false);

	},
	'click .add-predefined-part': function (e) {

		e.stopImmediatePropagation();

		var linkedObject = {
			matryoshkaId: Matryoshka.nestablePart.generateId(),
			creationDate: new Date(),
			nestableToLinkId: this._id,
			type: 'matryoshkaLinkedPart',
			nestableName: 'matryoshkaLinkedPartNestable'
		};
		var clickedBtn = $(e.currentTarget);
		var matryoshkaId = Session.get('matryoshka__addPartOverlay').matryoshkaId;
		var key = 'nestedNestables';

		Matryoshka.currentNestable.update( matryoshkaId, 'put', key, linkedObject );

		matryoshka__toggleAddPartOverlay( clickedBtn, 'hide' );

		// Reset the session var now that the nestable is in place
		Session.set('matryoshka__addPartOverlay', false);

	}
});
