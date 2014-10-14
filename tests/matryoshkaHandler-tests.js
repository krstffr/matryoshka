Router.go = function () {
	return true;
};

// Use these for creating/loggin in with the user!
var userUsername = 'test-user';
var userPassword = 'test-password';

// For a non auth user as well!
var nonAuthUserUsername = 'non-auth-user';
var nonAuthUserPassword = 'non-auth-password';

// Method for logging in the user
var loginUser = function ( auth ) {
	if (auth === 'nonAuth')
		return Meteor.loginWithPassword( nonAuthUserUsername, nonAuthUserPassword );
	return Meteor.loginWithPassword( userUsername, userPassword );
};

var logoutUser = function () {
	return Meteor.logout();
};

if (Meteor.isClient) {

	Matryoshka.confirm.toggle( false );

	Tinytest.addAsync('Matryoshka Client Async START - clean up DB', function (test, next) {
		Meteor.call('matryoshkaTests/cleanUpDB', 1, function (error, result) {
			test.equal(result, true);
			next();
		});
	});

	Tinytest.add('Matryoshka Client Startup - Matryoshka should be set', function (test) {
		test.isNotNull(Matryoshka);
	});

	Tinytest.addAsync('Matryoshka Client Main menu - main menu subscription', function (test, next) {
		Meteor.subscribe('matryoshkaNestablePartsForMenu', {
			onReady: function () {
				next();
			}
		});
	});


	// .filter

	Tinytest.add('Matryoshka Client filter - isActive should start out false', function (test) {
		test.equal( Matryoshka.filter.isActive, false );
	});

	Tinytest.add('Matryoshka Client filter - set filter', function (test) {
		test.equal( Matryoshka.filter.set('test-value'), 'test-value' );
	});

	Tinytest.add('Matryoshka Client filter - get filter', function (test) {
		Matryoshka.filter.set('a-new-value');
		test.equal( Matryoshka.filter.get(), 'a-new-value' );
	});

	Tinytest.add('Matryoshka Client filter - reset filter', function (test) {
		test.equal( Matryoshka.filter.reset(), false );
	});

	Tinytest.add('Matryoshka Client filter - filterCollection', function (test) {

		var testCollection = [{
			something: 'Kristoffer Klintberg',
			somethingElse: 'Node js'
		},{
			something: 'Steve McQueen',
			somethingElse: 'Clothes?'
		},{
			something: 'Steven Jobs',
			somethingElse: 'Kris'
		}];

		// Set the filter
		Matryoshka.filter.set('ris');

		// Get the results
		var filteredResult = Matryoshka.filter.filterCollection(testCollection, ['something', 'somethingElse'] );

		test.equal( filteredResult[0].something, testCollection[0].something );
		test.equal( filteredResult[1].somethingElse, testCollection[2].somethingElse );

		var collection2 = [{
			what: 'this is cool'
		},{
			is: 'cool'
		},{
			what: 'hat'
		},{
			chat: 'cat'
		}];

		// Set a new filter
		Matryoshka.filter.set('at');

		var newFilteredResults = Matryoshka.filter.filterCollection( collection2, ['what'] );

		test.equal( newFilteredResults[0].what, collection2[2].what );
		test.equal( newFilteredResults.length, 1 );

		// And a third filter
		Matryoshka.filter.set('t');

		test.equal( Matryoshka.filter.filterCollection( collection2, ['what'] ).length, 2 );

	});


	// .nestablePart

	Tinytest.add('Matryoshka Client nestablePart - nestablePartModifiers.getCurrentIndexOfNestablePart', function (test) {
		var nestables = [
		{ matryoshkaId: 'abc' },
		{ matryoshkaId: 'bcd' },
		{ matryoshkaId: 'cde' },
		{ matryoshkaId: 'def' }
		];
		test.equal( Matryoshka.nestablePartModifiers.getCurrentIndexOfNestablePart(nestables, 'abc'), 0 );
		test.equal( Matryoshka.nestablePartModifiers.getCurrentIndexOfNestablePart(nestables, 'cde'), 2 );
	});

	Tinytest.add('Matryoshka Client nestablePart - nestablePart.generateId() should generate unique ids', function (test) {
		test.notEqual( Matryoshka.nestablePart.generateId(), Matryoshka.nestablePart.generateId() );
		test.notEqual( Matryoshka.nestablePart.generateId(), Matryoshka.nestablePart.generateId() );
		test.notEqual( Matryoshka.nestablePart.generateId(), Matryoshka.nestablePart.generateId() );
		test.notEqual( Matryoshka.nestablePart.generateId(), Matryoshka.nestablePart.generateId() );
	});

	Tinytest.add('Matryoshka Client nestablePart - should be able to add non creatable nestable types', function (test) {
		// create a non createble nestable type
		var nameOfNonCreatebleType = 'nonCreatableType';
		var nonCreatebleType = { name: nameOfNonCreatebleType };
		Matryoshka.nestables.addType( nonCreatebleType );
		// Should be an empty array
		test.equal( _(Matryoshka.nestables[nameOfNonCreatebleType]).isArray(), true );
		// There should be no nestablesCreatable
		test.equal( Matryoshka.nestablesCreatable.length, 0 );
	});

	Tinytest.add('Matryoshka Client nestablePart - should be able to add creatable nestable types', function (test) {
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


	Tinytest.add('Matryoshka Client nestablePart - should NOT be able to add nestable types without name', function (test) {
		// options.name must be set
		var failingTypeOptions = {};
		test.throws(function () {
			Matryoshka.nestables.addType( failingTypeOptions );
		});
	});

	Tinytest.add('Matryoshka Client nestablePart - should be able to add (and get!) nestable', function (test) {

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

	Tinytest.add('Matryoshka Client nestablePart - nestablePart.getNestablePartData should return "undefined" for nestable which does not exist', function (test) {
		var nestablePartWhichDoesNotExist = Matryoshka.nestablePart.getNestablePartData('nonExistingType', 'nonExistingName');
		test.equal( nestablePartWhichDoesNotExist, undefined );
	});

	Tinytest.addAsync('Matryoshka Client nestablePart - creating two new nestables', function (test, next) {

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

	Tinytest.addAsync('Matryoshka Client nestablePart - get a nestable from the DB and set to current nestable', function (test, next) {

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

	Tinytest.add('Matryoshka Client nestablePart - add nested nestables to the current nestable', function (test) {

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

	Tinytest.add('Matryoshka Client nestablePart - update "ordinary" value in current nestable', function (test) {
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

	Tinytest.addAsync('Matryoshka Client nestablePart - remove a saved document from the server', function (test, next) {
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


	// .users

	Tinytest.addAsync('Matryoshka Client Users - clean up users from DB', function (test, next) {
		Meteor.call('matryoshkaTests/cleanUpUsers', 1, function (error, result) {
			test.equal(result, true);
			next();
		});
	});

	Tinytest.add('Matryoshka Client Users - users.loginRequired should be settable', function (test) {
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

	Tinytest.addAsync('Matryoshka Client Users - users.createUser', function (test, next) {
		// Only object's should be creatable
		test.throws(function () {
			Matryoshka.users.createUser('string');
		});
		test.throws(function () {
			Matryoshka.users.createUser({ noUsername: true });
		});
		test.throws(function () {
			Matryoshka.users.createUser({}, 'not a boolean');
		});
		test.throws(function () {
			Matryoshka.users.createUser({}, true, 'not a function');
		});
		Meteor.subscribe('matryoshkaUsers', {
			onReady: function () {
				// How many users are there now? There should be one more soon!
				var currentUsers = Meteor.users.find().count();
				// Call the createUser method
				Matryoshka.users.createUser({ username: userUsername, password: userPassword }, true );
				// Give the test some time to pass
				Meteor.setTimeout(function () {
					// There should be one more user now
					test.equal( Meteor.users.find().count(), currentUsers+1 );
					// The new user should have a profile.matryoshkaLevel
					test.equal( typeof Meteor.users.findOne().profile.matryoshkaLevel, 'string' );
					next();
				}, 250);
			}
		});
	});

	Tinytest.addAsync('Matryoshka Client Users - users.createUser on server (no auto login)', function (test, next) {

		var userIdBefore = Meteor.userId();

		// Let's try creating a new user ON THE SERVER
		Matryoshka.users.createUser({ username: 'a-user-created-on-the-server', password: 'test-password' }, false );

		// Give the time for the creation
		Meteor.setTimeout(function () {
			// Now we should have the same user, not a new one!
			test.equal( Meteor.userId(), userIdBefore );
			next();
		}, 250);

	});

	Tinytest.addAsync('Matryoshka Client Users - users.createUser non authorized user', function (test, next) {

		var userIdBefore = Meteor.userId();

		// Let's try creating a new user ON THE SERVER
		Matryoshka.users.createUser({ username: nonAuthUserUsername, password: nonAuthUserPassword, profile: { matryoshkaLevel: 'unauth' } }, false );

		// Give the time for the creation
		Meteor.setTimeout(function () {
			// Now we should have the same user, not a new one!
			test.equal( Meteor.userId(), userIdBefore );
			next();
		}, 250);

	});

	Tinytest.addAsync('Matryoshka Client Users - login user again', function (test, next) {
		// Log out the current users (if one)
		Meteor.logout();
		Meteor.loginWithPassword( userUsername, userPassword );
		Meteor.setTimeout(function () {
			// There should be a logged in user!
			test.notEqual( Meteor.userId(), null );
			next();
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

	Tinytest.addAsync('Matryoshka Client Users - users.userIsPermitted() should be return correct', function (test, next) {

		// Login is required AND matryoshka level must be set
		Matryoshka.users.requireLogin( true, false );
		test.equal( Matryoshka.users.userIsPermitted(), true);

		Matryoshka.users.requireLogin( true, true );
		test.equal( Matryoshka.users.userIsPermitted(), true);

		loginUser('nonAuth');

		Meteor.setTimeout(function () {

			// Should still be allowed to be logged in!
			Matryoshka.users.requireLogin( true, false );
			test.equal( Matryoshka.users.userIsPermitted(), true );

			// But not when only matryoshka level users are allowed…
			Matryoshka.users.requireLogin( true, true );
			test.equal( Matryoshka.users.userIsPermitted(), false );

			// And not when "logged out"
			logoutUser();
			Meteor.setTimeout(function () {
				test.equal( Matryoshka.users.userIsPermitted(), false);

				// Log in user again.
				loginUser();

				Meteor.setTimeout(function () {

					next();

				}, 250);

			}, 250);

		}, 250);

	});

	Tinytest.add('Matryoshka Client Users - users.getAuthorizedUsers', function (test) {

		// There should at this point be users created!
		test.equal( Matryoshka.users.getAuthorizedUsers().length > 0, true );

	});

	Tinytest.addAsync('Matryoshka Client Users - users.getNonAuthorizedUsers', function (test, next) {

		var usersBeforeCreation = Matryoshka.users.getNonAuthorizedUsers().length;

		// Let's try creating a new user ON THE SERVER
		Matryoshka.users.createUser({ username: 'yet-another-yser', password: 'test-password', profile: { matryoshkaLevel: 'unauth' } }, false );

		// Give the time for the creation
		Meteor.setTimeout(function () {
			// There should at this point be users created!
			test.equal( Matryoshka.users.getNonAuthorizedUsers().length, usersBeforeCreation+1 );
			next();
		}, 250);

	});

	Tinytest.addAsync('Matryoshka Client Users - users.changeUserLevel', function (test, next) {

		var usersBeforePromotion = Matryoshka.users.getNonAuthorizedUsers().length;
		var userId = Matryoshka.users.getNonAuthorizedUsers()[0]._id;
		var newLevel = 'admim';

		test.throws(function () {
			Matryoshka.users.changeUserLevel( userId );
		});
		test.throws(function () {
			Matryoshka.users.changeUserLevel( { not: 'a string' }, newLevel );
		});
		test.throws(function () {
			Matryoshka.users.changeUserLevel( userId, { not: 'a string' } );
		});

		Matryoshka.users.changeUserLevel( userId, newLevel );

		Meteor.setTimeout(function () {
			// There should now be one less unautorized user
			test.equal( Matryoshka.users.getNonAuthorizedUsers().length, usersBeforePromotion-1 );
			// Let's level the user down again
			newLevel = 'unauth';
			Matryoshka.users.changeUserLevel( userId, newLevel );
			Meteor.setTimeout(function () {
				test.equal( Matryoshka.users.getNonAuthorizedUsers().length, usersBeforePromotion );
				next();
			}, 250);
		}, 250);

	});

	Tinytest.addAsync('Matryoshka Client Users - logged out: users.changeUserLevel', function (test, next) {

		// Log out!
		logoutUser();

		Meteor.setTimeout(function () {
			test.throws(function () {
				// Should throw an error since we are now logged out!
				Matryoshka.users.changeUserLevel( 'string', 'string' );
			});
			loginUser();
			Meteor.setTimeout(function () {
				next();
			}, 250);
		}, 250);

	});

	Tinytest.addAsync('Matryoshka Client Users - users.removeUser', function (test, next) {

		var currentUserId = Meteor.userId();

		test.throws(function () {
			Matryoshka.users.deleteUser({ not: 'a string but rather an object' });
		});
		test.throws(function () {
			Matryoshka.users.deleteUser(currentUserId, { not: 'a string, but an object' });
		});
		test.throws(function () {
			Matryoshka.users.deleteUser(currentUserId, 'username', 'no a callback function, but a string');
		});

		// Delte the actual user
		Matryoshka.users.deleteUser(currentUserId);

		// Wait some time
		// Give the time for the creation
		Meteor.setTimeout(function () {
			// Now we should not have a user!
			test.equal( Meteor.userId(), null );
			next();
		}, 250);

	});


	// .DOMhelpers

	Tinytest.add('Matryoshka Client DOMhelpers - focus on part and reset it', function (test) {
				
		test.throws(function () {
			Matryoshka.DOMhelpers.focus.focusOnPagePart();
		});

		test.equal( Matryoshka.DOMhelpers.focus.focusOnPagePart('test'), 'test' );
		test.equal( Matryoshka.DOMhelpers.focus.focusOnPagePart('test'), false );
		test.equal( Matryoshka.DOMhelpers.focus.focusOnPagePart(123), 123 );
		test.equal( Matryoshka.DOMhelpers.focus.reset(), false );
		
	});

	Tinytest.addAsync('Matryoshka Client Async END - clean up DB', function (test, next) {
		Meteor.call('matryoshkaTests/cleanUpDB', 1, function (error, result) {
			test.equal(result, true);
			next();
		});
	});

}

if (Meteor.isServer) {

	Meteor.methods({
		'matryoshkaTests/cleanUpUsers': function () {
			if (typeof Meteor.users.remove({}) === 'number')
				return true;
		},
		'matryoshkaTests/cleanUpDB': function () {
			if (typeof MatryoshkaNestables.remove({}) === 'number' && typeof Meteor.users.remove({}) === 'number')
				return true;
		}
	});

}