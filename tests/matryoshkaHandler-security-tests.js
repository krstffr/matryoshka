if (Meteor.isServer) {

	Tinytest.addAsync('Matryoshka Server Security - set login requirement', function (test, next) {
		Matryoshka.users.requireLogin( true, true );
		test.equal( Matryoshka.users.loginRequired, true );
		next();
	});

	Tinytest.addAsync('Matryoshka Server Security - call: matryoshka/users/create', function (test, next) {
		Meteor.call('matryoshka/users/create', function (err, res) {
			// User should not be allowed to do that!
			test.equal( err.error, 403 );
			next();
		});
	});

	Tinytest.addAsync('Matryoshka Server Security - call: matryoshka/users/delete', function (test, next) {
		Meteor.call('matryoshka/users/delete', function (err, res) {
			// User should not be allowed to do that!
			test.equal( err.error, 403 );
			next();
		});
	});

	Tinytest.addAsync('Matryoshka Server Security - call: matryoshka/users/changeLevel', function (test, next) {
		Meteor.call('matryoshka/users/changeLevel', function (err, res) {
			// User should not be allowed to do that!
			test.equal( err.error, 403 );
			next();
		});
	});

	Tinytest.addAsync('Matryoshka Server Security - call: matryoshka/users/checkUserCount', function (test, next) {
		Meteor.call('matryoshka/users/checkUserCount', function (err, res) {
			// User should actually be allowed, since ther are no users
			test.equal( res, 0 );
			next();
		});
	});

	Tinytest.addAsync('Matryoshka Server Security - call: matryoshka/nestable/check-unique-fields', function (test, next) {
		Meteor.call('matryoshka/nestable/check-unique-fields', function (err, res) {
			// User should not be allowed to do that!
			test.equal( err.error, 403 );
			next();
		});
	});

	Tinytest.addAsync('Matryoshka Server Security - call: matryoshka/nestable/delete-duplicates', function (test, next) {
		Meteor.call('matryoshka/nestable/delete-duplicates', function (err, res) {
			// User should not be allowed to do that!
			test.equal( err.error, 403 );
			next();
		});
	});

	Tinytest.addAsync('Matryoshka Server Security - call: matryoshka/nestable/delete', function (test, next) {
		Meteor.call('matryoshka/nestable/delete', function (err, res) {
			// User should not be allowed to do that!
			test.equal( err.error, 403 );
			next();
		});
	});

	Tinytest.addAsync('Matryoshka Server Security - call: matryoshka/nestable/save', function (test, next) {
		Meteor.call('matryoshka/nestable/save', function (err, res) {
			// User should not be allowed to do that!
			test.equal( err.error, 403 );
			next();
		});
	});

	Tinytest.addAsync('Matryoshka Server Security - reset login requirement', function (test, next) {
		Matryoshka.users.requireLogin( false );
		test.equal( Matryoshka.users.loginRequired, false );
		next();
	});

}

if (Meteor.isClient) {

	Tinytest.addAsync('Matryoshka Client Security - set login requirement', function (test, next) {
		Matryoshka.users.requireLogin( true, true );
		test.equal( Matryoshka.users.loginRequired, true );
		next();
	});

	Tinytest.addAsync('Matryoshka Client Security - log out', function (test, next) {
		Meteor.logout(function() {
			next();
		});
	});

	Tinytest.add('Matryoshka Client Security - nestablePart.save()', function (test) {
		test.throws(function () {
			Matryoshka.nestablePart.save({ document: true });
		});
	});

	Tinytest.add('Matryoshka Client Security - nestablePart.deletePart()', function (test) {
		test.throws(function () {
			Matryoshka.nestablePart.deletePart('aNestableId');
		});
	});

	Tinytest.add('Matryoshka Client Security - nestablePart.goLive()', function (test) {
		test.throws(function () {
			Matryoshka.nestablePart.goLive({ document: true });
		});
	});

	Tinytest.add('Matryoshka Client Security - users.deleteUser()', function (test) {
		test.throws(function () {
			Matryoshka.users.deleteUser('userId');
		});
	});

	Tinytest.add('Matryoshka Client Security - users.changeUserLevel()', function (test) {
		test.throws(function () {
			Matryoshka.users.changeUserLevel('userId', 'newLevel');
		});
	});

	Tinytest.add('Matryoshka Client Security - users.getAuthorizedUsers()', function (test) {
		test.throws(function () {
			Matryoshka.users.getAuthorizedUsers();
		});
	});

	Tinytest.add('Matryoshka Client Security - users.getNonAuthorizedUsers()', function (test) {
		test.throws(function () {
			Matryoshka.users.getNonAuthorizedUsers();
		});
	});

	Tinytest.addAsync('Matryoshka Client Security - reset login requirement and log out', function (test, next) {
		Matryoshka.users.requireLogin( false );
		Meteor.logout(function() {
			next();
		});
	});

}