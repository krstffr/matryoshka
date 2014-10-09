MatryoshkaHandler = function () {

  var that = this;

  that.nestables = {};
  that.nestablePart = {};
  that.nestablesCreatable = [];
  that.loginRequired = undefined;

  // CSS classes
  that.cssClasses = {};
  that.cssClasses.body = 'matryoshka__body';

  // The default field types which are allowed
  that.allowedFieldTypes = ['textarea', 'text', 'select', 'locked', 'linkedNestable', 'date'];

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

  // Handle login requirement
  that.userIsPermitted = function ( userId ) {
    if (!that.loginRequired) return true;
    if (Meteor.isServer && that.loginRequired && userId) return true;
    if (Meteor.isClient && that.loginRequired && Meteor.userId()) return true;
    return false;
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

  // Bool for checking if it's active right now or not
  that.filter.isActive = false;

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

  that.filter.set = function (filterValue) {
    Session.set('matryoshka__filter', filterValue);
  };
  
  // Reset the current filter
  that.filter.reset = function () {
    Session.set('matryoshka__filter', false);
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

    that.currentNestable.reset();

    newNestablePart = {
      nestableName: nestablePartName,
      type: nestablePartType,
      matryoshkaId: that.nestablePart.generateId(),
      matryoshkaName: 'New part',
      creationDate: new Date()
    };

    if (context)
      newNestablePart = _.extend(context, newNestablePart);

    that.nestablePart.save( newNestablePart );

  };

  that.nestablePart.duplicate = function( doc ) {

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
          Matryoshka.messages.add({ message: 'Error: ' + error.details + ' must be unique!', type: 'error' });
        return false;
      }

      that.currentNestable.reset();

      if (goLiveBool)
        Matryoshka.messages.add({ message: doc.matryoshkaName + ' is live!', type: 'success' });
      else
        Matryoshka.messages.add({ message: doc.matryoshkaName + ' is saved!', type: 'success' });

      Matryoshka.currentNestable.set( MatryoshkaNestables.findOne({ _id: result.insertedId }) );

      Router.go('matryoshka', { action: 'edit', _id: result.insertedId });

    });

  };

  that.nestablePart.deletePart = function( matryoshkaId ) {

    if (!confirm('Are you sure you want to remove this page and all backups?')) return ;

    Meteor.call('matryoshka/nestable/delete', matryoshkaId, function (error, result) {

      that.currentNestable.reset();

      Matryoshka.messages.add({ message: 'Document is removed!', type: 'success' });

      Router.go('matryoshka__home');

    });

  };

  that.nestablePart.goLive = function( doc ) {

    that.nestablePart.save( doc, 'goLive' );

  };

  that.nestablePart.getValueFromForeignDoc = function ( _id, key ) {
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

  // Methods for handling "focus" of pageParts (from the focus button mainy)
  that.DOMhelpers.focus = {};

  that.DOMhelpers.focus.focusOnPagePart = function ( idOfPart ) {

    if (!idOfPart)
      throw new Error("No idOfPart provided to DOMhelpers.focus.focusOnPagePart( idOfPart )");

    if (!that.bodyOverflowInit)
      that.bodyOverflowInit = $('.'+that.cssClasses.body).css('overflow');

    // If there is a nestable right now, "reset" the focus.
    if (Session.get('matryoshka__focused-nestable'))
      return that.DOMhelpers.focus.reset();

    // Else focus on the part.
    $('.'+that.cssClasses.body).css({ overflow: 'hidden' });
    Session.set('matryoshka__focused-nestable', idOfPart );

    return Session.get('matryoshka__focused-nestable');

  };

  that.DOMhelpers.focus.reset = function () {
    
    $('.'+that.cssClasses.body).css({ overflow: that.bodyOverflowInit });
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
    
    // If there is nothing @ nestable[key] (or it's not an object (array!) )
    if ( typeof value !== 'object' ) {
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

    console.error('Matryoshka.addValueInObjectBasedOnId() is deprecated!!');

    that.nestables.modifyNestableBasedOnId( context, matryoshkaId, action, key, value );

  };

  that.addExtraButton = function ( type, name, faClass, cssClass ) {
    matryoshka__UIbuttons[type].push({
      name: name,
      faIconClass: faClass,
      cssClass: cssClass
    });
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


  that.init = function () {
    that.addPredfinedDefaultParts();
    that.bodyOverflowInit = false;
  };

  that.init();

};

Matryoshka = new MatryoshkaHandler();
