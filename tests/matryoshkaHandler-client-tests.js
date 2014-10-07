Tinytest.add('Matryoshka Client - Matryoshka should be set', function (test) {
	test.instanceOf(Matryoshka, MatryoshkaHandler);
});

Tinytest.add('Matryoshka Client - loginRequired should be settable', function (test) {
	Matryoshka.requireLogin( true );
	test.equal( Matryoshka.loginRequired , true);
	Matryoshka.requireLogin( false );
	test.equal( Matryoshka.loginRequired , false);
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