Template.matryoshka__fields.helpers({
	typeIsUserDefined: function () {
		return _(Matryoshka.userDefinedFields.fields).findWhere({ name: this.type });
	},
	getUserDefinedTypeField: function () {
		var userDefinedField = _(Matryoshka.userDefinedFields.fields).findWhere({ name: this.type });
		if (!userDefinedField)
			return null;
		return Template[ userDefinedField.templateFileName ];
	},
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

		// If we have a selectableData.type declared, then don't return the array, but
		// rather return the defined session (or session key) or a collection cursor.
		if (this.selectableData.type) {

			var nestablesToReturn;
			var specifiedCollectionField;
			var mapMethod = this.selectableData.mapMethod;

			// If it's a session, do this
			if (this.selectableData.type === 'session') {

				// This is the value of the session, nice to have stored here
				var sessionValue = Session.get(this.selectableData.sessionName);

				// If we don't have a sessionKey then there is no point of this
				if (!this.selectableData.sessionKey)
					throw new Error('You must pass a selectableData.sessionKey');

				// This is the key the user specified
				specifiedCollectionField = this.selectableData.sessionField;

				// If we don't have a sessionField then we don't know what key to return
				// TODO: The Session also could have a name key I guess? But it's probably
				// better to explicitly set one?
				if (!this.selectableData.sessionField)
					throw new Error('You must pass a selectableData.sessionField');

				// If there is not a sessionKey defined, return it, else return the whole
				// Session variable.
				if (sessionValue && this.selectableData.sessionKey)
					nestablesToReturn = sessionValue[this.selectableData.sessionKey];
				else
					nestablesToReturn = sessionValue;

				// If the user has defined a mapMethod, then run it on every item,
				// and remove any false/undefined values
				if (mapMethod) {
					nestablesToReturn = _( nestablesToReturn ).map( function ( nestable ) {
						return mapMethod( nestable );
					});
					nestablesToReturn = _.compact( nestablesToReturn );
				}

				// Use the specified field key to set the name of the returned array items.
				// TODO: Should we also have the extraDesc field here?
				nestablesToReturn = _(nestablesToReturn).map( function( nestable ) {
					return {
						name: nestable[ specifiedCollectionField ]
					};
				});
				
				return Matryoshka.filter.filterCollection( nestablesToReturn, ['name', 'extraDesc']);
			}

			// If it's a collection, do this
			if (this.selectableData.type === 'collection') {

				// Make sure there is a collection with the name we've specified
				if (!window[this.selectableData.collectionName]) throw new Error('there is no collection called '+this.selectableData.collectionName);
				if (!this.selectableData.collectionSelector) throw new Error('You have to pass a "collectionSelector" to the selectableData object!');

				var fieldsToReturn = {};

				// Let's make sure we store the actual field inside a var (for later use)
				specifiedCollectionField = this.selectableData.collectionField;

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

				return Matryoshka.filter.filterCollection( nestablesToReturn, ['name', 'extraDesc']);

			}
		}
		else {
			return Matryoshka.filter.filterCollection( this.selectableData, ['name', 'extraDesc']);
		}
	},
	setActiveSelectValue: function( id, context, name ) {

		var key = id+'-'+name,
			value = context[name];

		// If the value is already set, then don't do anything
		if (Matryoshka.getCurrentlySetSelectValues( key ) === value) return ;

		Matryoshka.setCurrentlySetSelectValues( key, value );

	}
});
