Meteor.methods({
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
	'matryoshka/nestable/save': function ( doc, goLiveBool ) {

		if (!Matryoshka.checkLoginReq( this.userId )) return false;

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
