MatryoshkaHandler = function () {

  var that = this;

  that.nestables = {};
  that.nestablePart = {};
  that.nestablesCreatable = [];

  // CSS classes
  that.cssClasses = {};
  that.cssClasses.body = 'matryoshka__body';
  that.cssClasses.bodyOFhidden = that.cssClasses.body + '--overflow-hidden';

  // The default field types which are allowed
  that.allowedFieldTypes = ['textarea', 'text', 'select', 'locked', 'linkedNestable', 'date'];


  // The user can define his/her own fields
  // Define them in this fashion:
  that.userDefinedFields = {};

  that.userDefinedFields.fields = [];

  that.userDefinedFields.add = function ( fieldOptions ) {

    // CHECK ONLY WORKS AFTER METEOR STARTUP, WHICH IS AFTER THIS!
    // Therefore these checks are not done using check().
    if (typeof fieldOptions.name !== 'string')
      throw new Error('fieldOptions.name should be a string, is: ' + typeof fieldOptions.name);

    if (typeof fieldOptions.templateFileName !== 'string')
      throw new Error('fieldOptions.templateFileName should be a string, is: ' + typeof fieldOptions.templateFileName);

    if (fieldOptions.initMethod && typeof fieldOptions.initMethod !== 'function')
      throw new Error('fieldOptions.initMethod should be a function, is: ' + typeof fieldOptions.initMethod);

    if (fieldOptions.saveMethod) {
      if (typeof fieldOptions.saveMethod !== 'function')
        throw new Error('fieldOptions.saveMethod should be a function, is: ' + typeof fieldOptions.saveMethod);
      var resultOfSaveMethod = fieldOptions.saveMethod({ test: 'this is a test-object' });
      if (typeof resultOfSaveMethod !== 'object')
        throw new Error('the result of fieldOptions.saveMethod( doc ) must be an object, is: ' + typeof resultOfSaveMethod);
    }

    // Add the checked user defined field to the userDefinedFields.fields array
    that.userDefinedFields.fields.push( fieldOptions );
    // Add the name to the allowedFieldTypes array
    that.allowedFieldTypes.push( fieldOptions.name );

  };


  // Method for adding a nestable
  // @param {Object} passedNestable
  that.nestables.add = function( passedNestable ) {

    // Check passed data CURRENTLY NOT WORKING ON SERVER?
    // check( passedNestable.type, String );
    // check( passedNestable.nestableName, String );

    // Check that the type is actually set.
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

    if (typeof options.name !== 'string')
      throw new Error('options.name should be of type string.');

    // If we pass the createable option then add it to the nestablesCreatable array
    if (options.createable === true) {
      that.nestablesCreatable.push({ name: options.name });
    }

    // Create an array where we later store the actual parts
    that.nestables[ options.name ] = [];

  };

  // Filter methods
  that.filter = {};

  // Bool for checking if it's active right now or not
  that.filter.isActive = false;

  // Method for applying the Matryoshka filter
  that.filter.filterCollection = function ( collection, keys ) {

    if (!collection)
      return false;

    // Make sure user passed an array of objects
    check( collection, Array );
    if (collection.length > 0)
      check( collection[0], Object );

    // Make sure keys is an array of strings
    check( keys, Array );
    if (keys.length > 0)
      check( keys[0], String );

    // There has to be a filter set
    if (!that.filter.get())
      return collection;
    // The regex to use
    var regex = new RegExp( that.filter.get(), "gi");
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

  that.filter.get = function () {
    return Session.get('matryoshka__filter');
  };

  that.filter.set = function (filterValue) {
    Session.set('matryoshka__filter', filterValue);
    return that.filter.get();
  };
  
  // Reset the current filter
  that.filter.reset = function () {
    that.filter.set( false );
    return that.filter.get();
  };

  that.filter.toggle = function () {

    // Reset the current search
    that.filter.reset();

    if (that.filter.isActive) {
      $('.matryoshka__filter').addClass('matryoshka__filter--hidden');
      $('.matryoshka__mainMenu__button-filter').removeClass('matryoshka__mainMenu__button-filter--active');
      $('.'+that.cssClasses.body).removeClass( that.cssClasses.body + '--filter-is-active' );
    } else {
      $('.matryoshka__filter').removeClass('matryoshka__filter--hidden');
      $('.matryoshka__mainMenu__button-filter').addClass('matryoshka__mainMenu__button-filter--active');
      $('.'+that.cssClasses.body).addClass(that.cssClasses.body+'--filter-is-active');
      $('.matryoshka__filter__input').val('').focus();
    }

    that.filter.isActive = !that.filter.isActive;
    
  };

  that.filter.hide = function () {
    if (that.filter.isActive) {
      that.filter.reset();
      that.filter.toggle();
    }
  };

  // Method for moving items inside an array.
  // Was first implemented on the Array object, but that would pollute everything else
  that.moveInArray = function(array, old_index, new_index) {

    check( array, Array );
    check( old_index, Number );
    check( new_index, Number );

    // Don't move it out of the array!
    if (new_index > array.length)
      new_index = array.length;
    if (new_index < 0)
      new_index = 0;

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

  that.nestablePart.generateId = function () {
    return Meteor.uuid();
  };

  that.nestablePart.newPart = function( nestablePartType, nestablePartName, context ) {

    check( nestablePartType, String );
    check( nestablePartName, String );

    that.currentNestable.reset();

    newNestablePart = {
      nestableName: nestablePartName,
      type: nestablePartType,
      matryoshkaId: that.nestablePart.generateId(),
      matryoshkaName: 'New part',
      creationDate: new Date()
    };

    if (context) {
      check( context, Object );
      newNestablePart = _.extend(context, newNestablePart);
    }

    that.nestablePart.save( newNestablePart );

  };

  that.nestablePart.duplicate = function( doc ) {

    check( doc, Object );

    doc.matryoshkaId = that.nestablePart.generateId();
    doc.matryoshkaName += '-COPY';

    // Add "-COPY" to all fields which must be unique as well!
    var nestableDefinedInCode = that.nestablePart.getNestablePartData( doc.type, doc.nestableName );
    uniqueFields = _.where(nestableDefinedInCode.fields, { unique: true });
    _.each(uniqueFields, function( field ) {
      doc[field.name] += '-COPY';
    });

    that.nestablePart.save(doc);

  };

  that.nestablePart.save = function( doc, goLiveBool ) {

    check( doc, Object );

    // Make sure user is logged in
    if (!that.users.userIsPermitted())
      throw new Error('You must be logged in as an authorized user.');

    // Make sure all "unique" fields are unique
    var nestableDefinedInCode = that.nestablePart.getNestablePartData( doc.type, doc.nestableName );

    // Execute all user defined fields save metohods on the document
    _(that.userDefinedFields.fields).each(function( fieldOptions ) {
      if (typeof fieldOptions.saveMethod === 'function' )
        doc = fieldOptions.saveMethod( doc );
    });

    Meteor.call('matryoshka/nestable/save', doc, goLiveBool, nestableDefinedInCode, function (error, result) {

      if (error) {
        if (error.reason === 'Some fields are not unique')
          that.messages.add({ message: 'Error: ' + error.details + ' must be unique!', type: 'error' });
        return false;
      }

      that.currentNestable.reset();

      // This is for making sure the currentNestable actually gets reset!
      Meteor.setTimeout(function () {

        if (goLiveBool)
          that.messages.add({ message: doc.matryoshkaName + ' is live!', type: 'success' });
        else
          that.messages.add({ message: doc.matryoshkaName + ' is saved!', type: 'success' });

        Matryoshka.currentNestable.set( MatryoshkaNestables.findOne({ _id: result.insertedId }) );

        Router.go('matryoshka', { action: 'edit', _id: result.insertedId });
        
      }, 0);

    });

  };

  that.nestablePart.deletePart = function( matryoshkaId ) {

    check( matryoshkaId, String );

    // Make sure user is logged in
    if (!that.users.userIsPermitted())
      throw new Error('You must be logged in as an authorized user.');

    if (!that.confirm.confirm('Are you sure you want to remove this page and all backups?')) return ;

    Meteor.call('matryoshka/nestable/delete', matryoshkaId, function (error, result) {

      that.currentNestable.reset();

      that.messages.add({ message: 'Document is removed!', type: 'success' });

      Router.go('matryoshka__home');

    });

  };

  that.nestablePart.goLive = function( doc ) {

    check( doc, Object );

    return that.nestablePart.save( doc, 'goLive' );

  };

  that.nestablePart.getValueFromForeignDoc = function ( _id, key ) {

    check( _id, String );
    check( key, String );

    var linkedNestable = MatryoshkaNestables.findOne( _id );
    if (linkedNestable)
      return linkedNestable[ key ];
  };

  that.nestablePart.findAndModifyNestablePart = function ( nestable, matryoshkaPartId, cb ) {

    if (nestable.matryoshkaId === matryoshkaPartId)
      nestable = cb( nestable );

    // Remove all falsy values!
    nestable.nestedNestables = _.compact( nestable.nestedNestables );

    nestable.nestedNestables = _.map(nestable.nestedNestables, function( nestablePart, partKey ){
      return that.nestablePart.findAndModifyNestablePart( nestablePart, matryoshkaPartId, cb );
    });

    // Remove all falsy values!
    nestable.nestedNestables = _.compact(nestable.nestedNestables);

    return nestable;

  };

  // Methods for manipulating the DOM
  that.DOMhelpers = {};

  // For modifying the <body>
  that.DOMhelpers.body = {};

  that.DOMhelpers.body.addMainClass = function () {
    if (!$('body').hasClass( that.cssClasses.body ))
      $('body').removeClass().addClass( that.cssClasses.body );
    return true;
  };

  that.DOMhelpers.body.toggleHiddenOverflow = function ( showOrHide ) {
    if (showOrHide)
      $('.'+that.cssClasses.body).addClass( that.cssClasses.bodyOFhidden );
    else
      $('.'+that.cssClasses.body).removeClass( that.cssClasses.bodyOFhidden );
  };

  // Methods for handling "focus" of pageParts (from the focus button mainy)
  that.DOMhelpers.focus = {};

  that.DOMhelpers.focus.focusOnPagePart = function ( idOfPart ) {

    check( idOfPart, String );

    // If there is a nestable right now, "reset" the focus.
    if (Session.get('matryoshka__focused-nestable'))
      return that.DOMhelpers.focus.reset();

    // Else focus on the part.
    that.DOMhelpers.body.toggleHiddenOverflow( true );
    Session.set('matryoshka__focused-nestable', idOfPart );

    return Session.get('matryoshka__focused-nestable');

  };

  that.DOMhelpers.focus.reset = function () {

    that.DOMhelpers.body.toggleHiddenOverflow( false );

    Session.set('matryoshka__focused-nestable', false );

    return Session.get('matryoshka__focused-nestable');

  };

  that.nestablePartModifiers = {};

  that.nestablePartModifiers.getCurrentIndexOfNestablePart = function ( nestables, matryoshkaIdToFind ) {
    return _( nestables ).map( function( nestedNestable ) {
      return nestedNestable.matryoshkaId;
    }).indexOf( matryoshkaIdToFind );
  };

  that.nestablePartModifiers.move = function ( nestableParent, matryoshkaPartId, key, value, placeAfterMatryoshkaId ) {
    // Get current position of nestable
    currentPosition = that.nestablePartModifiers.getCurrentIndexOfNestablePart( nestableParent[key], placeAfterMatryoshkaId );
    var moveTo = 1;
    if (value === 'down')
      moveTo = -1;
    // Move it!
    nestableParent[key] = that.moveInArray( nestableParent[key], currentPosition, (currentPosition + moveTo) );
    return nestableParent;
  };

  that.nestablePartModifiers.delete = function () {
    return false;
  };

  that.nestablePartModifiers.put = function ( nestable, matryoshkaPartId, key, value, placeAfterMatryoshkaId ) {

    // If the value has a nested .matryoshkaId, it is a nested nestable!
    if ( !value.matryoshkaId ) {
      nestable[key] = value;
      return nestable;
    }

    // Turn it into an array if it's not already.
    if (!nestable[key])
      nestable[key] = [];

    // Where to put the new element
    var newPos = nestable[key].length;
    
    if (placeAfterMatryoshkaId)
      newPos = that.nestablePartModifiers.getCurrentIndexOfNestablePart( nestable[key], placeAfterMatryoshkaId ) + 1;

    // Put the value in the array
    nestable[key].splice( newPos, 0, value );

    return nestable;

  };

  that.nestables.modifyNestableBasedOnId = function ( nestable, matryoshkaPartId, action, key, value, placeAfterMatryoshkaId ) {

    // findAndModifyNestablePart returns the passed nestable, with the callback applied to the one which
    // matches the matryoshkaId
    return that.nestablePart.findAndModifyNestablePart( nestable, matryoshkaPartId, function ( foundNestable ) {
      return that.nestablePartModifiers[action]( foundNestable, matryoshkaPartId, key, value, placeAfterMatryoshkaId );
    });

  };

  that.addValueInObjectBasedOnId = function( context, matryoshkaId, action, key, value ) {

    var warningMessage = 'Matryoshka.addValueInObjectBasedOnId() is deprecated!';
    that.messages.add({ message: warningMessage, type: 'error' });

    that.nestables.modifyNestableBasedOnId( context, matryoshkaId, action, key, value );

  };

  // UI stuff
  that.UI = {};

  // Array for holding all menu buttons
  that.UI.UIbuttons = {};

  // Holder for main menu
  that.UI.UIbuttons.mainMenu = [];
  // Holder for nesatables buttons
  that.UI.UIbuttons.nestablePart = [];

  that.UI.UIbuttons.addExtraButton = function ( type, name, faClass, cssClass ) {
    that.UI.UIbuttons[type].push({
      name: name,
      faIconClass: faClass,
      cssClass: cssClass
    });
  };

  that.UI.UIbuttons.setupDefaultButtons = function () {
    // Main menu buttons
    that.UI.UIbuttons.mainMenu.push({
      name: 'Menu',
      faIconClass: "fa-bars",
      cssClass: "matryoshka__mainMenu__button-show-menu"
    });
    that.UI.UIbuttons.mainMenu.push({
      name: 'Home',
      faIconClass: "fa-home",
      cssClass: "matryoshka__mainMenu__button-home"
    });
    that.UI.UIbuttons.mainMenu.push({
      name: 'Log out',
      faIconClass: "fa-sign-out",
      cssClass: "matryoshka__mainMenu__button-logout"
    });
    that.UI.UIbuttons.mainMenu.push({
      name: 'Filter',
      faIconClass: "fa-filter",
      cssClass: "matryoshka__mainMenu__button-filter"
    });

    // Nestable buttons
    that.UI.UIbuttons.nestablePart.push({
      name: "Save",
      faIconClass: "fa-save",
      cssClass: "matroyska-nestable-save"
    });
    that.UI.UIbuttons.nestablePart.push({
      name: "Delete",
      faIconClass: "fa-trash-o",
      cssClass: "matroyska-nestable-delete"
    });
    that.UI.UIbuttons.nestablePart.push({
      name: "Go live",
      faIconClass: "fa-cloud-upload",
      cssClass: "matroyska-nestable-go-live"
    });
    that.UI.UIbuttons.nestablePart.push({
      name: "Duplicate",
      faIconClass: "fa-copy",
      cssClass: "matroyska-nestable-duplicate"
    });

    // Add preview button
    that.UI.UIbuttons.nestablePart.push({
      name: "Preview",
      faIconClass: "fa-eye",
      cssClass: "matroyska-nestable-preview",
      conditional: function() {
        // The current nestable
        var currentNestable = Matryoshka.currentNestable.get();
        var nestableDefinedInCode = Matryoshka.nestablePart.getNestablePartData( currentNestable.type, currentNestable.nestableName );
        // Make sure we have a previewable route
        if (nestableDefinedInCode && nestableDefinedInCode.previewRoute) return true;
        // Else return false
        return false;
      }
    });
  };

  that.addExtraButton = function ( type, name, faClass, cssClass ) {
    console.log('Matryoshka.addExtraButton() is deprecated, use Matryoshka.UI.UIbuttons.addExtraButton()!');
    return that.UI.UIbuttons.addExtraButton( type, name, faClass, cssClass );
  };

  that.addPredfinedDefaultParts = function () {
    that.nestables.addType({ name: 'matryoshkaLinkedPart' });
    that.nestables.add({
      nestableName: 'matryoshkaLinkedPartNestable',
      type: 'matryoshkaLinkedPart',
      nestableNameReadable: 'Linked part',
      fields: [{ name: 'nestableToLinkId', type: 'linkedNestable' }],
      hideByDefault: true
    });
  };

  // Handling for the current editable nestable
  that.currentNestable = {};

  that.currentNestable.setToFalse = function () {
    that.currentNestable.set( false );
  };

  that.currentNestable.reset = function () {
    that.currentNestable.set({});
  };

  that.currentNestable.set = function ( doc ) {
    Session.set('matryoshkaCurrentNestable', doc );
  };

  that.currentNestable.get = function () {
    return Session.get('matryoshkaCurrentNestable');
  };

  that.currentNestable.update = function ( matryoshkaPartId, action, key, value, placeAfterMatryoshkaId ) {
    var updatedSession = that.nestables.modifyNestableBasedOnId( that.currentNestable.get(), matryoshkaPartId, action, key, value, placeAfterMatryoshkaId );
    that.currentNestable.set( updatedSession );
  };


  // Handling of messages
  that.messages = {};

  that.messages.add = function ( msg ) {
    Msgs.addMessage( msg.message, msg.type, 'matryoshka' );
  };


  // Handling of part overlay
  // More stuff can be moved here!

  that.partOverlay = {};

  // Show the overlay.
  // action is optional, now only used for "update" of existing nestables
  // matryoshkaId is required when updating existing
  that.partOverlay.show = function ( context, action, matryoshkaId ) {

    var sessionObject = {
      nestableName: context.nestableName,
      type: context.type,
      matryoshkaId: context.matryoshkaId
    };

    if (action && matryoshkaId) {
      sessionObject.action = action;
      sessionObject.actionMatryoshkaId = matryoshkaId;
    }

    Session.set('matryoshka__addPartOverlay', sessionObject );

    Matryoshka.filter.hide();

    $('.matryoshka__nestable__container__add-part-container--general').show();

  };

  // Users
  that.users = {};

  that.users.loginRequired = undefined;
  that.users.allowAllUsers = true;

  // deprecated old method, to be thrown out eventually!
  that.requireLogin = function ( require ) {
    console.log('Matryoshka.requireLogin() is deprecated, use Matryoshka.users.requireLogin()!');
    return that.users.requireLogin( require, false );
  };

  // Method for requiring login
  // @param {Boolean} require
  // @param {Boolean} matryoskhaOnly: should only specific matryoshka users have access?
  that.users.requireLogin = function( require, matryoskhaOnly ) {

    check( require, Boolean );
    
    if (!require) {
      that.users.loginRequired = false;
      that.users.allowAllUsers = true;
      return true;
    }
    
    // The Accounts-package must be available
    if (typeof Accounts === 'undefined')
      throw new Error("Can't find the Accounts package.");

    // If matryoskhaOnly is true, then set allowAllUsers to false
    // Meaning: all users are not allowed, only specific Matryoshka users.
    that.users.allowAllUsers = !matryoskhaOnly;

    if (Meteor.isClient)
      that.UI.UIbuttons.addExtraButton('mainMenu', 'Users', 'fa-user', 'matryoshka__mainMenu__button-users');

    that.users.loginRequired = require;

  };

  // Handle login requirement
  that.users.userIsPermitted = function ( userId ) {
    
    if (!that.users.loginRequired) return true;
    
    if (Meteor.isServer && typeof userId !== 'string') return false;

    // IMPROVE THE SEC ON SERVER!
    if (Meteor.isClient) {
      if (!that.users.allowAllUsers) {
        if (!Meteor.user()) return false;
        if (!Meteor.user().profile) return false;
        if (!Meteor.user().profile.matryoshkaLevel) return false;
        if (Meteor.user().profile.matryoshkaLevel === 'unauth') return false;
      }
      if (!Meteor.userId() || !Meteor.user()) return false;
    }

    return true;

  };

  // Delete a user
  that.users.deleteUser = function ( userId, username, cb ) {

    if (!that.users.userIsPermitted())
      throw new Error('You must be logged in as an authorized user.');

    check( userId, String );

    if (username)
      check( username, String );

    if (cb)
      check( cb, Object );

    Meteor.call('matryoshka/users/delete', userId, function (err, res) {
      if (err) {
        that.messages.add({ message: err.reason, type: 'error' });
        if (cb && cb.onError)
          return cb.onError( err );
      } else {
        that.messages.add({ message: 'User "'+username+'" deleted!', type: 'success' });
        if (cb && cb.onSuccess)
          return cb.onSuccess();
      }
    });

  };

  // Create a new user
  that.users.createUser = function ( newUser, autoLogin, cb ) {

    // Sometimes you don't need to be logged in…
    // if (!that.users.userIsPermitted())
    //   throw new Error('You must be logged in as an authorized user.');

    // Check the passed data
    check(newUser, Object);
    check(newUser.username, String);
    check(newUser.password, String);
    check(autoLogin, Boolean);

    if (cb)
      check(cb, Object);
    
    newUser.profile = newUser.profile || {};

    newUser.profile.matryoshkaLevel = newUser.profile.matryoshkaLevel || 'admin';

    // The callback on user creation
    var userCreatedCallback = function (err) {
      if (err) {
        that.messages.add({ message: err.reason, type: 'error' });
        if (cb && cb.onError)
          return cb.onError();
      } else {
        that.messages.add({ message: 'User "'+newUser.username+'" created!', type: 'success' });
        if (cb && cb.onSuccess)
          return cb.onSuccess();
      }
    };

    if (!autoLogin)
      Meteor.call('matryoshka/users/create', newUser, userCreatedCallback );
    else
      Accounts.createUser( newUser, userCreatedCallback );

  };

  // Change user level
  that.users.changeUserLevel = function ( userId, newLevel ) {

    if (!that.users.userIsPermitted())
      throw new Error('You must be logged in as an authorized user.');

    check( userId, String );
    check( newLevel, String );
    
    Meteor.call('matryoshka/users/changeLevel', userId, newLevel, function (err, res) {
      if (err)
        return that.messages.add({ message: err.reason, type: 'error' });
      return that.messages.add({ message: 'User level changed!', type: 'success' });
    });

  };

  // Get lists of users
  that.users.getAuthorizedUsers = function () {
    
    if (!that.users.userIsPermitted())
      throw new Error('You must be logged in as an authorized user.');

    if (that.users.allowAllUsers)
      return Meteor.users.find().fetch();

    var users = Meteor.users.find({ 'profile.matryoshkaLevel': { $exists: true } }).fetch();
    users = _.filter(users, function(user) { return user.profile.matryoshkaLevel !== 'unauth'; });
    return that.filter.filterCollection(users, ['username']);
    
  };

  that.users.getNonAuthorizedUsers = function () {

    if (!that.users.userIsPermitted())
      throw new Error('You must be logged in as an authorized user.');

    if (that.users.allowAllUsers)
      return false;

    var users = Meteor.users.find({ $or: [{ 'profile.matryoshkaLevel': { $exists: false } }, { 'profile.matryoshkaLevel': 'unauth' }] }).fetch();
    return that.filter.filterCollection(users, ['username']);

  };

  // Confirm stub
  that.confirm = {};
  // By default the confirm should be active
  that.confirm.active = true;
  // Method for disabling the that.confirm (making it return true automatically)
  that.confirm.toggle = function ( bool ) {
    if ( typeof bool === 'boolean' )
      that.confirm.active = bool;
    else
      that.confirm.active = !that.confirm.active;
  };
  // The actual confirm method
  that.confirm.confirm = function ( whatToConfirm ) {
    if (that.confirm.active)
      return confirm(whatToConfirm);
    return true;
  };

  that.init = function () {
    that.addPredfinedDefaultParts();
    that.UI.UIbuttons.setupDefaultButtons();
  };

  that.init();

};

Matryoshka = new MatryoshkaHandler();
