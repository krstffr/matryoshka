// Method for hiding children of parents with hideChildren: true
Template.matryoshka__partLooper.rendered = function () {
	// Get parent context
	var parentData = Template.parentData(2);
	if (!parentData)
		return ;
	var parentNestableDefinedInCode = Matryoshka.nestablePart.getNestablePartData( parentData.type, parentData.nestableName );
	if (parentNestableDefinedInCode.hideChildren)
		$(this.find('.matryoshka__nestable__container')).addClass('matryoshka__nestable__container--hidden');
};

Template.matryoshka__partLooper.helpers({
	nestableFirstFieldValue: function () {
		// Return the value of the field/key which is defined FIRST by the user
		// in the matryoshka setup.
		var nestableDefinedInCode = Matryoshka.nestablePart.getNestablePartData( this.type, this.nestableName );
		// If there is no nestableDefinedInCode or there are no fields, do nothing.
		if (!nestableDefinedInCode || nestableDefinedInCode.fields.length < 1)
			return ;
		var firstKey = nestableDefinedInCode.fields[0].name || '';
		var firstValue = this[firstKey] || '';
		if (firstValue)
			return '– '+firstValue;
		return ;
	},
	nestables: function() {
		// Return the nestables from "code" instead of the object
		if (!this.type)
			return false;
		
		var nestableDefinedInCode = Matryoshka.nestablePart.getNestablePartData( this.type, this.nestableName );

		return nestableDefinedInCode.nestables;

	},
	name: function() {
		if (this.matryoshkaName)
			return this.matryoshkaName;
		return this.name;
	},
	fields: function () {

		// TODO: This don't work very well as we actually add fields when creating new objects,
		//       for example { matryoshkaName: "New Part" } to new parts.
		//       Maybe combine the fields from this.fields with the fields saved in the actual code?
		//       Probably won't work as we might rename fields at some point. Like imgSrc to imgUrl.
		//       In that example not both fields will show (and which one should?)
		// HACK2:For now, I'll also add the matryoshkaName as it's the only one thing that is actually
		//       added afterwards.

		// HACK: This returns the actual fields which are defined in the code instead of whats saved in
		//       the actual object
		if (this.nestableName) {

			// This is what happens:
			// 1. Return an array of all the nestables inside the type (defined in this.type)
			// 2. Only return the ones where nestableName is equal to this specific nestableName
			// 3. It's an array, therefore go into the [0] element and return it's fields array
			// 4. Check if the doc has a matryoshkaName field (and not the actual fields which are return)
			// 5. If there is one in the doc but not in the fields to be returned, add it!

			var nestablesInType = Matryoshka.nestables[this.type];
			var currentNestable = _.where(nestablesInType, { nestableName: this.nestableName });

			if (!currentNestable[0]) return ;

			var fieldsDefinedInCode = currentNestable[0].fields;
			var matryoshkaNameFieldInObject = _.where(this.fields, { name: 'matryoshkaName' });
			var matryoshkaNameFieldInCode = _.where(fieldsDefinedInCode, { name: 'matryoshkaName' });

			if ( matryoshkaNameFieldInObject.length > 0 && matryoshkaNameFieldInCode.length < 1 ) {
				fieldsDefinedInCode.unshift( matryoshkaNameFieldInObject[0] );
			}

			return fieldsDefinedInCode;
		}

		return this.fields;

	},
	fieldsTypeSpecific: function () {

		// TODO: This is just an EXACT copy of the method above!!!!! F I X    T H I S
		if (this.nestableName) {

			var nestablesInType = Matryoshka.nestables[this.type],
					currentNestable = _.where(nestablesInType, { nestableName: this.nestableName });

			if (!currentNestable[0]) return ;

			var fieldsDefinedInCode = currentNestable[0].fieldsTypeSpecific,
					matryoshkaNameFieldInObject = _.where(this.fieldsTypeSpecific, { name: 'matryoshkaName' }),
					matryoshkaNameFieldInCode = _.where(fieldsDefinedInCode, { name: 'matryoshkaName' });

			if ( matryoshkaNameFieldInObject.length > 0 && matryoshkaNameFieldInCode.length < 1 ) {
					fieldsDefinedInCode.unshift( matryoshkaNameFieldInObject[0] );
			}

			return fieldsDefinedInCode;

		}

		return this.fieldsTypeSpecific;

	},
	fieldsTypeSpecific__getFields: function( context ) {
		if (this[ context[this.name] ])
			return this[ context[this.name] ];
	},
	fieldsTypeSpecific__hasFieldsBool: function ( context ) {
		return this[ context[this.name] ] !== undefined;
	},
	recurse: function () {
		// Return this template but with the new context
		return Template.matryoshka__partLooper;
	},
	nestableGetCssClasses: function ( context ) {
		
		// Make sure we have the nesatble as it's defined in the code
		var nestableDefinedInCode = Matryoshka.nestablePart.getNestablePartData( this.type, this.nestableName );
		if (!nestableDefinedInCode || !nestableDefinedInCode.fields)
			return ;

		var thisNestable = this;
		var fieldsWhichOutputCss = _( _(nestableDefinedInCode.fields).where({ cssOutputValueAsClass: true }) ).map( function( field ) { return field.name; });
		var cssToReturn = '';
		// Loop over all the keys/values and add them to the string which will be returned
		_.each(fieldsWhichOutputCss, function( field ) {
			cssToReturn += 'matryoshkaCssClass--'+field+'--'+thisNestable[field]+' ';
		});
		return cssToReturn;
	}
});

// This function handles text input changes.

var handleTextInputChange = function ( e, context ) {

	var input = $(e.currentTarget),
	value = input.val(),
	matryoshkaId = input.data('parent-id'),
	key = context.name;

	// If {number: true} then make sure we store a number
	if (context.number) {
		value = value.replace(/,/g, '.');
		value = parseFloat(value, 10);
	}

	var updatedSession = Matryoshka.nestables.modifyNestableBasedOnId( Session.get('matryoshkaCurrentNestable'), matryoshkaId, 'put', key, value );

	Session.set('matryoshkaCurrentNestable', updatedSession );

};

// This var is for holding the setTimeout which will run on keyup
var currentUpdateTimeout;

Template.matryoshka__partLooper.events({
		'click .matryoshka__nestable__container__col--left': function ( e ) {
			e.stopImmediatePropagation();
			var clickedEl = $(e.currentTarget);
			var parentToHide = clickedEl.closest('.matryoshka__nestable__container');
			parentToHide.toggleClass('matryoshka__nestable__container--hidden');
		},
		'change .matryoshka-save-on-select': function (e) {

				e.stopImmediatePropagation();

				var input = $(e.currentTarget),
						value = input.val(),
						matryoshkaId = _.clone( input.data('parent-id') ),
						key = this.name,
						updatedSession = Session.get('matryoshkaCurrentNestable');

				// Check if we're dealing with a selectable from a collection
				if (this.selectableData) {
						if (this.selectableData.type === 'collection') {
								// Get the _id from the selected <option> and get the collection-id from it
								// Save it in the Session!
								var selectedOption = input.find('option:selected'),
										collectionId = selectedOption.data('collection-id');

								updatedSession = Matryoshka.nestables.modifyNestableBasedOnId( updatedSession, matryoshkaId, 'put', 'collection-id', collectionId );
						}
				}

				updatedSession = Matryoshka.nestables.modifyNestableBasedOnId( updatedSession, matryoshkaId, 'put', key, value );

				Session.set('matryoshkaCurrentNestable', updatedSession );

		},
		'keyup .matryoshka-save-on-blur': function (e) {

				e.stopImmediatePropagation();

				var context = this;

				// Remove the currently running update (you've pressed a new key
				// and the prev timeout hasn't run out of time yet)
				Meteor.clearTimeout(currentUpdateTimeout);

				// Start a new update timeout
				currentUpdateTimeout = Meteor.setTimeout(function () {
						// Handle the new data when the time runs out
						// (Instead of storing the new data on each keypress)
						handleTextInputChange( e, context );
				}, 1000);

		},
		'blur .matryoshka-save-on-blur': function (e) {

				e.stopImmediatePropagation();

				var context = this;

				Meteor.clearTimeout(currentUpdateTimeout);

				handleTextInputChange( e, context );

		},
		'click .add-part': function (e) {

				e.stopImmediatePropagation();

				var defaultNewObject = {
								matryoshkaId: Matryoshka.nestablePart.generateId(),
								creationDate: new Date()
						},
						clickedBtn = $(e.currentTarget),
						matryoshkaId = clickedBtn.data('parent-id'),
						key = 'nestedNestables',
						value = _.extend(this, defaultNewObject);

				var updatedSession = Matryoshka.nestables.modifyNestableBasedOnId( Session.get('matryoshkaCurrentNestable'), matryoshkaId, 'put', key, value );

				Session.set('matryoshkaCurrentNestable', updatedSession );

				matryoshka__toggleAddPartOverlay( clickedBtn, 'hide' );

		},
		'click .duplicate-part': function (e) {

				e.stopImmediatePropagation();

				var objectToDuplicate = _.clone(this),
						clickedBtn = $(e.currentTarget),
						matryoshkaId = clickedBtn.data('parent-id'),
						key = 'nestedNestables';

				// Method for updating matryoshkaId for all nested nestables inside passed nestable
				var updateAllNestableIds = function (nestable) {
						// Update the matryoshkaId if there is one to update
						if (nestable.matryoshkaId) nestable.matryoshkaId = Matryoshka.nestablePart.generateId();
						// If we have nested nestables, do the same thing to them
						_.each(nestable.nestedNestables, function (nestedNestable, index) {
								nestable.nestedNestables[index] = updateAllNestableIds(nestedNestable);
						});
						return nestable;
				};

				// We must find all the nested objects etc. and replace their matryoshkaId with new ones
				objectToDuplicate = updateAllNestableIds(objectToDuplicate);

				var updatedSession = Matryoshka.nestables.modifyNestableBasedOnId( Session.get('matryoshkaCurrentNestable'), matryoshkaId, 'put', key, objectToDuplicate, this.matryoshkaId );

				Session.set('matryoshkaCurrentNestable', updatedSession );


		},
		'click .delete-part': function (e) {

				e.stopImmediatePropagation();

				if (!confirm('Are you sure you want to remove this part?')) return ;

				var updatedSession = Matryoshka.nestables.modifyNestableBasedOnId( Session.get('matryoshkaCurrentNestable'), this.matryoshkaId, 'delete' );

				Session.set('matryoshkaCurrentNestable', updatedSession );

		},
		'click .move-part': function (e) {

				e.stopImmediatePropagation();

				var clickedBtn = $(e.currentTarget),
						parentMatryoshkaId = clickedBtn.closest('.matryoshka__nestableSubPartButtons').data('parent-id'),
						moveWhere = clickedBtn.data('moveWhere'),
						key = 'nestedNestables';

				var updatedSession = Matryoshka.nestables.modifyNestableBasedOnId( Session.get('matryoshkaCurrentNestable'), parentMatryoshkaId, 'move', key, moveWhere, this.matryoshkaId );

				Session.set('matryoshkaCurrentNestable', updatedSession );

		},
		'click .show-part-list': function (e) {

			Session.set('matryoshka__addPartOverlay', { nestableName: this.nestableName, type: this.type, matryoshkaId: this.matryoshkaId });

			$('.matryoshka__nestable__container__add-part-container--general').show();

		}
});