Template.matryoshka__fields.helpers({
	getLinkedNestableName: function( context ) {
    var linkedNestable = MatryoshkaNestables.findOne( context.nestableToLinkId );
    if (linkedNestable)
      return linkedNestable.matryoshkaName;
  },
	name: function() {
    if (this.matryoshkaName)
        return this.matryoshkaName;
    return this.name;
  },
	extraDesc: function () {
		if (!this.extraDesc) return;
		return this.extraDesc + ': ';
	},
	selectableData: function () {

		// A filter regular expression, (if any)
		var re = new RegExp(Session.get('matryoshka__filter'), "gi");

		// If we have a selectableData.type declared, it should be a collection and we
		// should return the collection cursor instead of the selectableData array (which is
		// the case otherwise
		if (this.selectableData.type) {

			// Just doublecheck that it's actually called collection
			// (In the futute we might support more sources of selectData)
			if (this.selectableData.type === 'collection') {

				// Make sure there is a collection with the name we've specified
				if (!window[this.selectableData.collectionName]) throw new Error('there is no collection called '+this.selectableData.collectionName);
				if (!this.selectableData.collectionSelector) throw new Error('You have to pass a "collectionSelector" to the selectableData object!');

				var fieldsToReturn = {};
				var nestablesToReturn;

				// Let's make sure we store the actual field inside a var (for later use)
				var specifiedCollectionField = this.selectableData.collectionField;

				// This is for the mongo { fields: {} } selector, to only return the actual field we need
				fieldsToReturn[ specifiedCollectionField ] = 1;

				// Also get the extra field (if defined)
				if (this.selectableData.collectionFieldDescription) {
					var specifiedCollectionFieldDescription = this.selectableData.collectionFieldDescription;
					fieldsToReturn[ specifiedCollectionFieldDescription ] = 1;
				}

				// If no specific field is passed, return the whole cursor
				// TODO: Do we really need this? REMOVED FOR NOW!
				// if (!specifiedCollectionField)
				//   return window[this.selectableData.collectionName].find( this.selectableData.collectionSelector, { fields: { matryoshkaName: 1 } });

				// Fetch all the docs which match our collectionSelector selector
				nestablesToReturn = window[this.selectableData.collectionName].find( this.selectableData.collectionSelector, { fields: fieldsToReturn } ).fetch();

				// Loop over all the docs, and store our passed key (field) in a name key instead (cause this is the key which will be outputted in the HTML loop)
				nestablesToReturn = _(nestablesToReturn).map( function( nestable ) {
					return {
						name: nestable[specifiedCollectionField],
						_id: nestable._id,
						extraDesc: nestable[ specifiedCollectionFieldDescription ]
					};
				});

				// If we have a filter, apply it
				if (Session.get('matryoshka__filter')) {
					// The combined search on name and extraDesc
					nestablesToReturn = _.extend(
						matryoska__filter__filterRegex(nestablesToReturn, 'name', re ),
						matryoska__filter__filterRegex(nestablesToReturn, 'extraDesc', re )
					);
				}

				// Retur all the docs
				return nestablesToReturn;
			}
		}
		else {

			// If there was to .type passed, just return the selectableData array
			var selectableDataToReturn = this.selectableData;

			// If we have a filter, apply it
			if (Session.get('matryoshka__filter')) {
				// The combined search on name and extraDesc
				selectableDataToReturn = _.extend(
					matryoska__filter__filterRegex(selectableDataToReturn, 'name', re ),
					matryoska__filter__filterRegex(selectableDataToReturn, 'extraDesc', re )
				);
			}

			return selectableDataToReturn;
		}
	},
	getFieldValue: function( context ) {
		// console.log(context, this);
		return context[ this.name ];
	},
	setActiveSelectValue: function( id, context, name ) {

		var key = id+'-'+name,
			value = context[name];

		// If the value is already set, then don't do anything
		if (Matryoshka.getCurrentlySetSelectValues( key ) === value) return ;

		Matryoshka.setCurrentlySetSelectValues( key, value );

	}
});
