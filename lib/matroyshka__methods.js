Meteor.methods({
	'matroyshka/nestable/delete-duplicates': function ( matroyshkaId ) {
		// Get the 15 latest backup
		var oldestDoc = MatroyshkaNestables.findOne({ matroyshkaId: matroyshkaId, matroyshkaStatus: 'backup'}, { sort: { updatedDate: -1 }, skip: 14 });
		// If there is not 15, then don't do nothing
		if (!oldestDoc) return false;
		// Else get all the older docs and remove them!
		return MatroyshkaNestables.remove({ matroyshkaId: matroyshkaId, matroyshkaStatus: 'backup', updatedDate: { $lt: oldestDoc.updatedDate } });
	},
	'matroyshka/nestable/delete': function ( matroyshkaId ) {

		var removedDocs = MatroyshkaNestables.remove({ matroyshkaId: matroyshkaId });

		return removedDocs;

	},
	'matroyshka/nestable/save': function ( doc, goLiveBool ) {

		// We don't want an _id field (won't play nice with upserts, backups etc.)
		var tempId = _.clone(doc._id);
		delete doc._id;

		// Set status to editable, and update date
		doc.matroyshkaStatus = 'editable';
		doc.updatedDate = new Date();

		// Save the current document
		var savedDoc = MatroyshkaNestables.upsert({ matroyshkaId: doc.matroyshkaId, matroyshkaStatus: doc.matroyshkaStatus }, { $set: doc });
		if (!savedDoc.insertedId)
			savedDoc.insertedId = tempId;

		// --- CREATE A BACKUP
		doc.matroyshkaStatus = 'backup';
		MatroyshkaNestables.insert(doc);

		if (goLiveBool === 'goLive') {
			// --- CREATE A LIVE VERSION
			doc.matroyshkaStatus = 'live';
			MatroyshkaNestables.upsert({ matroyshkaId: doc.matroyshkaId, matroyshkaStatus: doc.matroyshkaStatus }, { $set: doc });
		}

		var removedDuplicates = Meteor.call('matroyshka/nestable/delete-duplicates', doc.matroyshkaId);

		return savedDoc;

	}
});