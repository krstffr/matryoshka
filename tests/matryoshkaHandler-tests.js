// Stub router
Router = {
	go: function () {
		return true;
	}
};

// Stub confirm
confirm = function () {
	return true;
};

if (Meteor.isClient) {

	Tinytest.add('Matryoshka Client - Matryoshka should be set', function (test) {
		test.instanceOf(Matryoshka, MatryoshkaHandler);
	});

	Tinytest.addAsync('Matryoshka Client - main menu subscription', function (test, next) {
		Meteor.subscribe('matryoshkaNestablePartsForMenu', {
			onReady: function () {
				next();
			}
		});
	});

	Tinytest.add('Matryoshka Client - nestablePartModifiers.getCurrentIndexOfNestablePart', function (test) {
		var nestables = [
		{ matryoshkaId: 'abc' },
		{ matryoshkaId: 'bcd' },
		{ matryoshkaId: 'cde' },
		{ matryoshkaId: 'def' }
		];
		test.equal( Matryoshka.nestablePartModifiers.getCurrentIndexOfNestablePart(nestables, 'abc'), 0 );
		test.equal( Matryoshka.nestablePartModifiers.getCurrentIndexOfNestablePart(nestables, 'cde'), 2 );
	});

	Tinytest.add('Matryoshka Client - nestablePart.generateId() should generate unique ids', function (test) {
		test.notEqual( Matryoshka.nestablePart.generateId(), Matryoshka.nestablePart.generateId() );
		test.notEqual( Matryoshka.nestablePart.generateId(), Matryoshka.nestablePart.generateId() );
		test.notEqual( Matryoshka.nestablePart.generateId(), Matryoshka.nestablePart.generateId() );
		test.notEqual( Matryoshka.nestablePart.generateId(), Matryoshka.nestablePart.generateId() );
	});

	Tinytest.add('Matryoshka Client - should be able to add non creatable nestable types', function (test) {
		// create a non createble nestable type
		var nameOfNonCreatebleType = 'nonCreatableType';
		var nonCreatebleType = { name: nameOfNonCreatebleType };
		Matryoshka.nestables.addType( nonCreatebleType );
		// Should be an empty array
		test.equal( _(Matryoshka.nestables[nameOfNonCreatebleType]).isArray(), true );
		// There should be no nestablesCreatable
		test.equal( Matryoshka.nestablesCreatable.length, 0 );
	});

	Tinytest.add('Matryoshka Client - should be able to add creatable nestable types', function (test) {
		// Check how many creatables we have initially (probably 0 but it depends on above tests)
		var numOfCreatableTypes = Matryoshka.nestablesCreatable.length;
		// create a createble nestable type
		var nameOfCreatebleType = 'creatableType';
		var createbleType = { name: nameOfCreatebleType, createable: true };
		Matryoshka.nestables.addType( createbleType );
		// Should be an empty array
		test.equal( _(Matryoshka.nestables[nameOfCreatebleType]).isArray(), true );
		// There should be no nestablesCreatable
		test.equal( Matryoshka.nestablesCreatable.length, numOfCreatableTypes + 1 );
	});


	Tinytest.add('Matryoshka Client - should NOT be able to add nestable types without name', function (test) {
		// options.name must be set
		var failingTypeOptions = {};
		test.throws(function () {
			Matryoshka.nestables.addType( failingTypeOptions );
		});
	});

	Tinytest.add('Matryoshka Client - should be able to add (and get!) nestable', function (test) {

		var typeName = 'page';
		var nestableName = 'normalPage';

		// Add a nestableType
		Matryoshka.nestables.addType({ name: typeName, createable: true });
		// Add a nestable
		Matryoshka.nestables.add({
			nestableName: nestableName,
			nestableNameReadable: 'Normal Page',
			type: typeName
		});

		// Get the nestable
		var nestablePart = Matryoshka.nestablePart.getNestablePartData(typeName, nestableName);

		// Should be an object with some properties
		test.equal( _(nestablePart).isObject(), true );
		test.equal( nestablePart.nestableName, nestableName );
		test.equal( nestablePart.type, typeName );
		test.equal( nestablePart.nestableCreateable, true );

	});

	Tinytest.add('Matryoshka Client - nestablePart.getNestablePartData should return "undefined" for nestable which does not exist', function (test) {
		var nestablePartWhichDoesNotExist = Matryoshka.nestablePart.getNestablePartData('nonExistingType', 'nonExistingName');
		test.equal( nestablePartWhichDoesNotExist, undefined );
	});

	Tinytest.addAsync('Matryoshka Client - creating two new nestables', function (test, next) {

		// This should increase by the end of this sesson by 1
		var docsFromTheStart = MatryoshkaNestables.find().fetch().length;

		var typeName = 'someType';
		var nestableName = 'someNestale';
		
		// Add a nestableType
		Matryoshka.nestables.addType({ name: typeName, createable: true });
		// Add a nestable
		Matryoshka.nestables.add({
			nestableName: nestableName,
			nestableNameReadable: 'Normal Page',
			type: typeName
		});

		Matryoshka.nestablePart.newPart( typeName, nestableName );

		Meteor.setTimeout(function () {
			// Should be one more now
			test.equal( MatryoshkaNestables.find().fetch().length, docsFromTheStart + 1 );
			// Let's add another one
			Matryoshka.nestablePart.newPart( typeName, nestableName );
			Meteor.setTimeout(function () {
				// Should be one more now
				test.equal( MatryoshkaNestables.find().fetch().length, docsFromTheStart + 2 );
				next();
			}, 75);

		}, 75);

	});

	Tinytest.addAsync('Matryoshka Client - get a nestable from the DB and set to current nestable', function (test, next) {

		// There should now be docs in the DB from the tests above
		var randomDocId = MatryoshkaNestables.findOne()._id;

		Meteor.subscribe('matryoshkaNestableFromId', randomDocId, {
			onReady: function () {
				var docToUse = MatryoshkaNestables.findOne(randomDocId);
				Matryoshka.currentNestable.set( docToUse );
				// Now Matryoshka.currentNestable.get() should return the same doc
				test.equal( Matryoshka.currentNestable.get()._id, randomDocId );
				next();
			}
		});
	});

	Tinytest.add('Matryoshka Client - add nested nestables to the current nestable', function (test) {

		// There should be a current nestable
		var currentNestable = Matryoshka.currentNestable.get();
		var nestedNestables;

		if (Matryoshka.currentNestable.get().nestedNestables)
			nestedNestables = Matryoshka.currentNestable.get().nestedNestables.length;
		else
			nestedNestables = 0;

		test.equal( _(currentNestable).isObject(), true );

		var defaultNewObject = {
			matryoshkaId: Matryoshka.nestablePart.generateId(),
			creationDate: new Date(),
			type: 'someType',
			nestableName: 'someName',
			someValueToLaterUpdate: 'change this'
		};

		Matryoshka.currentNestable.update( currentNestable.matryoshkaId, 'put', 'nestedNestables', defaultNewObject );

		test.equal( Matryoshka.currentNestable.get().nestedNestables.length, nestedNestables + 1 );

		// Add a nestedNestable to the nestedNestable
		var anotherNewObject = _.clone(defaultNewObject);
		anotherNewObject.matryoshkaId = Matryoshka.nestablePart.generateId();
		var matryoshkaIdOfNested = Matryoshka.currentNestable.get().nestedNestables[0].matryoshkaId;
		Matryoshka.currentNestable.update( matryoshkaIdOfNested, 'put', 'nestedNestables', anotherNewObject );

		// Now there shoule be a nestable inside the nestable
		test.equal(Matryoshka.currentNestable.get().nestedNestables[0].nestedNestables.length, 1);

	});

	Tinytest.add('Matryoshka Client - update "ordinary" value in current nestable', function (test) {
		// There should be a current nestable
		var currentNestable = Matryoshka.currentNestable.get();
		// Make sure there are nested nestables
		test.equal( currentNestable.nestedNestables.length > 0, true );
		// Get the matryoshkaId of a nested nestable
		var matryoshkaIdToUpdate = currentNestable.nestedNestables[0].matryoshkaId;
		var newValue = 'it is now changed!';
		// Make sure the value is not already the value we are trying to set
		test.notEqual( currentNestable.nestedNestables[0].someValueToLaterUpdate, newValue );
		// Update the value and update the current nestable
		Matryoshka.currentNestable.update( matryoshkaIdToUpdate, 'put', 'someValueToLaterUpdate', newValue );
		currentNestable = Matryoshka.currentNestable.get();
		// Make sure the new value is set
		test.equal( currentNestable.nestedNestables[0].someValueToLaterUpdate, newValue );
	});

	Tinytest.add('Matryoshka Client Users - users.loginRequired should be settable', function (test) {
		test.equal( Matryoshka.users.loginRequired, undefined );
		Matryoshka.users.requireLogin( true );
		test.equal( Matryoshka.users.loginRequired, true);
		Matryoshka.users.requireLogin( false );
		test.equal( Matryoshka.users.loginRequired, false);
	});

	Tinytest.add('Matryoshka Client Users - users.allowAllUsers (bool) should be setable from users.loginRequired', function (test) {
		Matryoshka.users.requireLogin( true, false );
		test.equal( Matryoshka.users.allowAllUsers, true );
		Matryoshka.users.requireLogin( true, true );
		test.equal( Matryoshka.users.allowAllUsers, false );
		Matryoshka.users.requireLogin( false );
		test.equal( Matryoshka.users.allowAllUsers, true );
	});

	Tinytest.add('Matryoshka Client Users - users.userIsPermitted() should be return correct', function (test) {

		// Let's mock the userId and user
		Meteor.userId = function () {
			return true;
		};
		Meteor.user = function () {
			return {
				matryoshkaLevel: 'unauth'
			};
		};

		Matryoshka.users.requireLogin( true );
		test.equal( Matryoshka.users.userIsPermitted(), false);
		Matryoshka.users.requireLogin( false );
		test.equal( Matryoshka.users.userIsPermitted(), true);
		Matryoshka.users.requireLogin( true, false );
		test.equal( Matryoshka.users.userIsPermitted(), false);

		// Now let's pretend we're logged in and authorized
		Meteor.user = function () {
			return {
				matryoshkaLevel: 'admin'
			};
		};

		test.equal( Matryoshka.users.userIsPermitted(), true);

	});

	Tinytest.addAsync('Matryoshka Client Users - users.createUser', function (test, next) {
		test.throws(function () {
			Matryoshka.users.createUser('string');
		});
		Matryoshka.users.createUser({ username: 'test-user', password: 'test-password' });
		// Give the test some time to pass
		Meteor.setTimeout(function () {
			console.log( Meteor.users.find().count() );
			Meteor.subscribe('matryoshkaUsers', {
				onReady: function () {
					console.log( Meteor.users.find().count() );
					next();
				}
			});
		}, 250);
	});

	Tinytest.addAsync('Matryoshka Client Users - matryoshkaAdditionalUserFields subscription', function (test, next) {
		Meteor.subscribe('matryoshkaAdditionalUserFields', {
			onReady: function () {
				next();
			}
		});
	});

	Tinytest.addAsync('Matryoshka Client Users - matryoshkaUsers subscription', function (test, next) {
		Meteor.subscribe('matryoshkaUsers', {
			onReady: function () {
				next();
			}
		});
	});

	Tinytest.add('Matryoshka Client DOMhelpers - focus on part and reset it', function (test) {
		
		test.equal( Session.get('matryoshka__focused-nestable'), undefined || false );
		
		test.throws(function () {
			Matryoshka.DOMhelpers.focus.focusOnPagePart();
		});

		test.equal( Matryoshka.DOMhelpers.focus.focusOnPagePart('test'), 'test' );
		test.equal( Matryoshka.DOMhelpers.focus.focusOnPagePart('test'), false );
		test.equal( Matryoshka.DOMhelpers.focus.focusOnPagePart(123), 123 );
		test.equal( Matryoshka.DOMhelpers.focus.reset(), false );
		
	});

	Tinytest.addAsync('Matryoshka Client Async - remove a saved document from the server', function (test, next) {
		// There should be a current nestable
		var currentNestable = Matryoshka.currentNestable.get();
		var idOfDoc = currentNestable._id;
		var idToRemove = currentNestable.matryoshkaId;
		// There should now be a doc which gets returned by findOne
		test.equal( MatryoshkaNestables.findOne( idOfDoc )._id, idOfDoc );
		Matryoshka.nestablePart.deletePart( idToRemove );
		// Give the delete some time
		Meteor.setTimeout(function () {
			// There should now NOT be a doc which gets returned by findOne
			test.equal( MatryoshkaNestables.findOne( idOfDoc ), undefined );
			next();
		}, 75);
	});

	Tinytest.addAsync('Matryoshka Client Async - clean up DB', function (test, next) {
		Meteor.call('matryoshkaTests/cleanUpDB', 1, function (error, result) {
			test.equal(result, true);
			next();
		});
	});

}

if (Meteor.isServer) {

	Meteor.methods({
		'matryoshkaTests/cleanUpDB': function () {
			if (typeof MatryoshkaNestables.remove({}) === 'number' && typeof Meteor.users.remove({}) === 'number')
				return true;
		}
	});

}