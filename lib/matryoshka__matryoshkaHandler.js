MatryoshkaHandler = function () {

  var that = this;

  that.nestables = {};
  that.nestablePart = {};
  that.previewRoute = {};
  that.nestablesCreatable = [];
  that.loginRequired = undefined;

  // The default field types which are allowed
  that.allowedFieldTypes = ['textarea', 'text', 'select', 'locked', 'linkedNestable'];

  // The user can define his/her own fields
  // Define them in this fashion:
  that.userDefinedFields = {};

  that.userDefinedFields.fields = [];

  that.userDefinedFields.add = function ( fieldOptions ) {

    that.userDefinedFields.fields.push( fieldOptions );
    that.allowedFieldTypes.push( fieldOptions.name );

  };

  // Method for requiring login
  // @param {Boolean} require
  that.requireLogin = function(require) {
    if (require)
      if (typeof Accounts === 'undefined')
        throw new Error("Can't find the Accounts package.");
      that.loginRequired = require;
    };

  // Method for setting the previewRoute
  // @param {String} routeUrl
  that.previewRoute.set = function ( routeUrl ) {
    // Make sure routeUrl is a string
    if (typeof routeUrl !== 'string') throw new Error("Type of route should be string!");
    // Set the router
    that.previewRoute.route = routeUrl;
  };

  // Handle login requirement
  that.checkLoginReq = function ( userId ) {
    if (!that.loginRequired) return true;
    if (!userId) return false;
    return true;
  };

  // Method for getting the previewRoute
  that.previewRoute.get = function () {
    return that.previewRoute.route;
  };

  // Method for checking if previewRoute is set
  that.previewRoute.isSet = function () {
    return that.previewRoute.route !== undefined;
  };

  // Method for adding a nestable
  // @param {Object} passedNestable
  that.nestables.add = function( passedNestable ) {

    // Check that the type is actually set.
    if (!passedNestable.type) throw new Error('no "type" was passed for new nestable');
    if (!passedNestable.nestableName) throw new Error('no "nestableName" was passed for new nestable');
    if (!that.nestables[passedNestable.type]) throw new Error('type '+passedNestable.type+' has not been set. You need to set this before creating nestables.');

    var prohibitedFields = _( _.map(passedNestable.fields, function(field){
      if ( that.allowedFieldTypes.indexOf( field.type ) < 0 )
        return field;
    })).compact();

    if (prohibitedFields.length > 0) {
      prohibitedFields.forEach(function (field) {
        console.error(field.name+' (of type: '+passedNestable.type+') has an incorrect field type: '+field.type);
      });
    }

    // Make sure we have somewhere to store fields (even though we don't have them at the time)
    // For example: matryoshkaName which is added to new docs.
    if (!passedNestable.fields) passedNestable.fields = [];

    // Nestables should be nestableCreateable by default
    if (passedNestable.nestableCreateable === undefined) passedNestable.nestableCreateable = true;

    that.nestables[passedNestable.type].push(passedNestable);

  };

  // Method for adding nestables
  that.nestables.addType = function( options ) {

    if (!options.name) throw new Error('no "name" was passed for new nestable');

    // If we pass the createable option then add it to the nestablesCreatable array
    if (options.createable === true) {
      that.nestablesCreatable.push({ name: options.name });
    }

    // Create an array where we later store the actual parts
    that.nestables[ options.name ] = [];

  };

  // Filter methods
  that.filter = {};

  // Method for applying the Matryoshka filter
  that.filter.filterCollection = function ( collection, keys ) {
    // There has to be a filter set
    if (!Session.get('matryoshka__filter'))
      return collection;
    // The regex to use
    var regex = new RegExp(Session.get('matryoshka__filter'), "gi");
    // Iterate over the collection, filter those elements which dont
    // fit in the regex
    var filteredResult = _.filter(collection, function( collectionItem ){
      // By default, we don't want to return the item if it's not in
      // the filter range. So we set the var which we use to filter
      // to false by default.
      var returnOrNot = false;
      // Then we iterate over all the keys, and if one of them "hit"
      // the filter, we set returnOrNot to true (and stop the check
      // on the coming elements ( see the if (!returnOrNot ... ) )
      _.each(keys, function( filterKey ){
        if (!returnOrNot && collectionItem[filterKey])
          if ( collectionItem[filterKey].toString().match(regex) )
            returnOrNot = true;
      });
      return returnOrNot;
    });
    return _(filteredResult).flatten();
  };
  
  // Reset the current filter
  that.filter.reset = function () {
    if (Session.get('matryoshka__filter'))
      matryoska__filter__toggleFilter();
  };

  // Method for moving items inside an array.
  // Was first implemented on the Array object, but that would pollute everything else
  that.moveInArray = function(array, old_index, new_index) {
    if (new_index >= array.length) {
      var k = new_index - array.length;
      while ((k--) + 1) {
        array.push(undefined);
      }
    }
    array.splice(new_index, 0, array.splice(old_index, 1)[0]);
    return array;
  };

  // Method for getting the nestable as defined in the code
  // @param {String} nestableType
  // @param {String} nestableName
  that.nestablePart.getNestablePartData = function ( nestableType, nestableName ) {
    return _( Matryoshka.nestables[ nestableType ] ).findWhere({ nestableName: nestableName });
  };

  that.nestablePart.generateId = function ( extraUnique ) {
    return parseInt(+new Date()+''+new Date().getMilliseconds()+''+Math.floor(Math.random()*250), 10) + Math.floor(Math.random()*250)+'-'+Math.floor(Math.random()*250);
  };

  that.nestablePart.newPart = function( nestablePartType, nestablePartName, passedNestable ) {

    that.nestablePart.resetSessions();

    var newNestablePart = _.where(Matryoshka.nestables[nestablePartType], { nestableName: nestablePartName })[0];

    // If a passedNestable was passed, extend it
    if (passedNestable) {
      newNestablePart = _.extend( newNestablePart, passedNestable );
    }

    // Set an id for the new nestable
    newNestablePart.matryoshkaId = that.nestablePart.generateId();

    // Create the matryoshkaName for the new nestablePart
    newNestablePart.fields = _.reject(newNestablePart.fields, function(field){ return field.name === 'matryoshkaName'; });
    newNestablePart.fields.unshift({ name: 'matryoshkaName', type: 'text' });
    newNestablePart.matryoshkaName = 'New part';

    // Set a create date
    newNestablePart.creationDate = new Date();

    // HACK: There was a bug with the parent ID when creating new parts earlier, therefore we're now saving the new doc
    // right into the DB instead of just setting a new session and then later saving it.

    // //Set the matryoshkaCurrentNestable session to the new nestable
    // Session.set('matryoshkaCurrentNestable', newNestablePart );

    // Save the new part in the DB
    that.nestablePart.save( newNestablePart );

  };

  that.nestablePart.duplicate = function( doc ) {

    doc.matryoshkaId = that.nestablePart.generateId();
    doc.matryoshkaName = doc.matryoshkaName+'-COPY';
    that.nestablePart.save(doc);

  };

  that.nestablePart.resetSessions = function () {
    delete Session.keys.matryoshkaCurrentNestable;
  };

  that.nestablePart.save = function( doc, goLiveBool ) {

    _(that.userDefinedFields.fields).each(function( fieldOptions ) {
      if (typeof fieldOptions.saveMethod === 'function' )
        doc = fieldOptions.saveMethod( doc );
    });

    Meteor.call('matryoshka/nestable/save', doc, goLiveBool, function (error, result) {
      if (error)
        throw new Error(error);
      that.nestablePart.resetSessions();
      // This is a hack for properly resetting the Session, cause else there is a bug with the parent ID passed when setting a value
      window.location = '/matryoshka/edit/'+result.insertedId;
      // window.scrollTo(0, 0);
      // Router.go('matryoshka', { action: 'edit', _id: result.insertedId });
    });

  };

  that.nestablePart.deletePart = function( matryoshkaId ) {

    if (!confirm('Are you sure you want to remove this page and all backups?')) return ;

    Meteor.call('matryoshka/nestable/delete', matryoshkaId, function (error, result) {

      that.nestablePart.resetSessions();
      console.log('removed: '+result);
      Router.go('matryoshka__home');

    });

  };

  that.nestablePart.goLive = function( doc ) {

    that.nestablePart.save( doc, 'goLive' );

  };

  that.addValueInObjectBasedOnId = function( context, matryoshkaId, action, key, value ) {

    var stuffToMove = false;

    // We found it
    if (context.matryoshkaId === matryoshkaId) {

      if (action === 'delete') {
        context = false;
      }

      if (action === 'setCss') {

        var currentlySetCss = _.extend({}, context.matryoshkaCssClasses);

        currentlySetCss[key] = value;

        context.matryoshkaCssClasses = currentlySetCss;

      }

      if (action === 'put') {

        if( typeof value === 'string' || typeof value === 'number' || value === undefined) {
          context[key] = value;
        }
        else {
          if ( typeof context[key] === 'undefined') {
            context[key] = [];
          }
          context[key].push( value );
        }

      }

      // If we've found the ID, we should reset the key and value
      key = false;
      value = false;

    }

    _.each(context.nestedNestables, function( part, partKey ){

      if (action === 'move' && context.nestedNestables[partKey].matryoshkaId === matryoshkaId) {
        stuffToMove = {
          partKey: partKey,
          type: 'nestedNestables',
          currentPosition: partKey
        };
      }

      context.nestedNestables[partKey] = that.addValueInObjectBasedOnId( part, matryoshkaId, action, key, value );

    });

    // Remove falsy values, which will be what is returned if an element is deleted. And don't add it if it's empty.
    var compactedArray = _(context.nestedNestables).compact();
    if (compactedArray.length > 0 || context.nestedNestables) context.nestedNestables = compactedArray;
    // else context[actualArrayPartKey] = [];

    if (stuffToMove) {

      var maxPos = 0,
      newPos = 0;

      if (key === 'up') {
        maxPos =  context[stuffToMove.type].length;
        newPos = stuffToMove.partKey+1;
        if (newPos < maxPos)
          context[stuffToMove.type] = Matryoshka.moveInArray(context[stuffToMove.type], stuffToMove.partKey, newPos);
      }
      if (key === 'down') {
        newPos = stuffToMove.partKey-1;
        if (newPos >= maxPos)
          context[stuffToMove.type] = Matryoshka.moveInArray(context[stuffToMove.type], stuffToMove.partKey, newPos);
      }

    }

    return context;

  };

  that.getCurrentlySetSelectValues = function( key ) {
    if (!Session.get('matryoshkaCurrentlySetSelectValues')) return 'NOT SET YET';
    if (!Session.get('matryoshkaCurrentlySetSelectValues')[key]) return 'NOT SET YET';
    return Session.get('matryoshkaCurrentlySetSelectValues')[key];
  };

  that.setCurrentlySetSelectValues = function( key, value ) {

    var currentlySetSelectValues = Session.get('matryoshkaCurrentlySetSelectValues');
    if (!currentlySetSelectValues) currentlySetSelectValues = {};
    currentlySetSelectValues[key] = value;
    Session.set('matryoshkaCurrentlySetSelectValues', currentlySetSelectValues);

  };

  that.addExtraButton = function ( type, name, faClass, cssClass ) {
    matryoshka__UIbuttons[type].push({
      name: name,
      faIconClass: faClass,
      cssClass: cssClass
    });
  };

  that.init = function () {

  };

  that.init();

};

Matryoshka = new MatryoshkaHandler();
