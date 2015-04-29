Template.matryoshka__addPartOverlay.helpers({
	action: function () {
		
		if (!Session.get('matryoshka__addPartOverlay') || !Session.get('matryoshka__addPartOverlay').action) return;

		return Session.get('matryoshka__addPartOverlay').action;

	},
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
			if ( _.indexOf(nestableNamesToFilter, nestable.nestableName ) > -1 )
				return nestable;
		});

		return _.chain(filteredNestables)
		.compact()
		.sortBy(function( nestable ){ return nestable.nestableNameReadable; })
		.value();

	},
	filteredNestables: function ( nestables ) {
		return Matryoshka.filter.filterCollection( nestables, ['nestableNameReadable', 'nestableName'] );
	},
	matryoshkaId: function() {

		if (!Session.get('matryoshka__addPartOverlay')) return;

		return Session.get('matryoshka__addPartOverlay').matryoshkaId;

	},
	savedNestableParts: function( nestables ) {

		var savedNestableParts = _.chain(nestables)
		// Return all the saved nestables which are of the "nestableName type"
		.map( function( nestable ) {
			return MatryoshkaNestables
			.find({ matryoshkaStatus: 'live', nestableName: nestable.nestableName })
			.fetch();
		})
		// Flatten the array
		.flatten()
		// Add nestableNameReadable as is defined in the code for all found savedNestableParts, cause we need it in the filtering
		.map( function( nestablePart ) {
			var nestableDefinedInCode = Matryoshka.nestablePart.getNestablePartData( nestablePart.type, nestablePart.nestableName );
			nestablePart.nestableNameReadable = nestableDefinedInCode.nestableNameReadable;
			return nestablePart;
		})
		// Sort them!
		.sortBy(function(nestable) { return nestable.matryoshkaName; })
		.value();

		return Matryoshka.filter.filterCollection( savedNestableParts, ['matryoshkaName', 'nestableNameReadable', 'nestableName'] );
		
	}
});

Template.matryoshka__addPartOverlay.events({
	'click .update-predefined-part': function ( e ) {

		if ( !Session.get('matryoshka__addPartOverlay').actionMatryoshkaId )
			Matryoshka.messages.add({message: 'Can\'t find linked part matryoshkaId to update!', type: 'error' });

		e.stopImmediatePropagation();

		var clickedBtn = $(e.currentTarget);
		var matryoshkaId = Session.get('matryoshka__addPartOverlay').actionMatryoshkaId;

		Matryoshka.currentNestable.update( matryoshkaId, 'put', 'nestableToLinkId', this._id );

		matryoshka__toggleAddPartOverlay( clickedBtn, 'hide' );

		// Reset the session var now that the nestable is in place
		Session.set('matryoshka__addPartOverlay', false);

	},
	'click .add-part': function ( e ) {

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
	'click .add-predefined-part': function ( e ) {

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

Template.matryoshka__addPartOverlay.onCreated(function() {
	// Set this to false by default
	Session.setDefault('matryoshka__addPartOverlay', false );

	// Track changes to the session var, and whenerver it's not false,
	// update it's top position to wherever the window is currently at.
	Tracker.autorun(function () {

		if (Session.get('matryoshka__addPartOverlay')){
			$('.matryoshka__nestable__container__add-part-container__inner')
			.css({ top: $(window).scrollTop() });
		}

	});
});