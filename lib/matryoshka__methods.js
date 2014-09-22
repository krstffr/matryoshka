Meteor.methods({
	'matryoshka/nestable/check-unique-fields': function ( doc, nestableDefinedInCode ) {

		// Make sure all "unique" fields are unique
		var mongoSelector = {};
		var mongoOrSelector = [];
		var uniqueFields = [];
		var foundDocs = [];
		var matchedFields = [];

		if (!nestableDefinedInCode)
			return false;

		if (!nestableDefinedInCode.fields)
			return false ;

		uniqueFields = _.where(nestableDefinedInCode.fields, { unique: true });
		if (!uniqueFields)
			return false;

		// Make sure the user has actually set the fields to something
		uniqueFields = _(uniqueFields).chain()
		.map( function( field ) {
			if (doc[field.name])
				return field;
		})
		.compact()
		.value();

		// Make sure we have uniqueFields to check against
		if (uniqueFields.length < 1)
			return false;

		mongoOrSelector = _(uniqueFields).map( function( field ) {
			var toReturn = {};
			toReturn[field.name] = doc[field.name];
			return toReturn;
		});

		mongoSelector = { $or: mongoOrSelector, matryoshkaId: { $ne: doc.matryoshkaId }, matryoshkaStatus: { $ne: 'backup' } };

		foundDocs = MatryoshkaNestables.find( mongoSelector ).fetch();

		if (!foundDocs.length)
			return false;

		// Check all the fields which match the original doc
		_.each(foundDocs, function( foundDoc ) {
			_.each(uniqueFields, function(field) {
				if (foundDoc[field.name] === doc[field.name])
					matchedFields.push( field.name );
			});
		});

		return _(matchedFields).uniq();

	},
	'matryoshka/nestable/delete-duplicates': function ( matryoshkaId ) {

		if (!Matryoshka.checkLoginReq( this.userId )) return false;

		// Get the 15 latest backup
		var oldestDoc = MatryoshkaNestables.findOne({ matryoshkaId: matryoshkaId, matryoshkaStatus: 'backup'}, { sort: { updatedDate: -1 }, skip: 14 });
		// If there is not 15, then don't do nothing
		if (!oldestDoc) return false;
		// Else get all the older docs and remove them!
		return MatryoshkaNestables.remove({ matryoshkaId: matryoshkaId, matryoshkaStatus: 'backup', updatedDate: { $lt: oldestDoc.updatedDate } });
	},
	'matryoshka/nestable/delete': function ( matryoshkaId ) {

		if (!Matryoshka.checkLoginReq( this.userId )) return false;

		var removedDocs = MatryoshkaNestables.remove({ matryoshkaId: matryoshkaId });

		return removedDocs;

	},
	'matryoshka/nestable/save': function ( doc, goLiveBool, nestableDefinedInCode ) {

		if (!Matryoshka.checkLoginReq( this.userId )) return false;

		// Make sure all fields are unique!
		var nonUniqueFields = Meteor.call('matryoshka/nestable/check-unique-fields', doc, nestableDefinedInCode);
		if (nonUniqueFields)
			throw new Meteor.Error(403, 'Some fields are not unique', nonUniqueFields );

		// We don't want an _id field (won't play nice with upserts, backups etc.)
		var tempId = _.clone(doc._id);
		delete doc._id;

		// Set status to editable, and update date
		doc.matryoshkaStatus = 'editable';
		doc.updatedDate = new Date();

		// Save the current document
		var savedDoc = MatryoshkaNestables.upsert({ matryoshkaId: doc.matryoshkaId, matryoshkaStatus: doc.matryoshkaStatus }, { $set: doc });
		if (!savedDoc.insertedId)
			savedDoc.insertedId = tempId;

		// --- CREATE A BACKUP
		doc.matryoshkaStatus = 'backup';
		MatryoshkaNestables.insert(doc);

		if (goLiveBool === 'goLive') {
			// --- CREATE A LIVE VERSION
			doc.matryoshkaStatus = 'live';
			MatryoshkaNestables.upsert({ matryoshkaId: doc.matryoshkaId, matryoshkaStatus: doc.matryoshkaStatus }, { $set: doc });
		}

		var removedDuplicates = Meteor.call('matryoshka/nestable/delete-duplicates', doc.matryoshkaId);

		return savedDoc;

	}
});
