MatryoshkaHandler = function () {

    var that = this;

    that.nestables = {};
    that.nestablePart = {};
    that.nestablesCreatable = [];

    that.nestables.add = function( passedNestable ) {

        // Check that the type is actually set.
        if (!passedNestable.type) throw new Error('no "type" was passed for new nestable');
        if (!passedNestable.nestableName) throw new Error('no "nestableName" was passed for new nestable');
        if (!that.nestables[passedNestable.type]) throw new Error('type '+passedNestable.type+' has not been set. You need to set this before creating nestables.');

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

    that.updateFieldsInTemplate = function() {
        var updatedSession = Matryoshka.addValueInObjectBasedOnId( Session.get('matryoshkaCurrentNestable'), null, 'updateFields' );
        Session.set('matryoshkaCurrentNestable', updatedSession );
    };

    that.nestablePart.generateId = function () {

        return parseInt(+new Date()+''+new Date().getMilliseconds()+''+Math.floor(Math.random()*250), 10);

    };

    that.nestablePart.new = function( nestablePartType, nestablePartName ) {

        that.nestablePart.resetSessions();
        
        var newNestablePart = _.where(Matryoshka.nestables[nestablePartType], { nestableName: nestablePartName })[0];
        
        // Set an id for the new nestable
        newNestablePart.matryoshkaId = that.nestablePart.generateId();

        // Create the matryoshkaName for the new nestablePart
        newNestablePart.fields = _.reject(newNestablePart.fields, function(field){ return field.name === 'matryoshkaName'; });
        newNestablePart.fields.unshift({ name: 'matryoshkaName', type: 'text' });
        newNestablePart.matryoshkaName = 'New part';

        // Set a create date
        newNestablePart.creationDate = new Date();
        
        // Set the matryoshkaCurrentNestable session to the new nestable
        Session.set('matryoshkaCurrentNestable', newNestablePart );

        Router.go('matryoshka');

    };

    that.nestablePart.duplicate = function( doc ) {
        
        doc.matryoshkaId = that.nestablePart.generateId();
        doc.matryoshkaName = doc.matryoshkaName+'-COPY';
        that.nestablePart.save(doc);

    };

    that.nestablePart.resetSessions = function () {
        Session.set('matryoshkaCurrentNestable', false);
    };

    that.nestablePart.save = function( doc, goLiveBool ) {

        Meteor.call('matryoshka/nestable/save', doc, goLiveBool, function (error, result) {
            that.nestablePart.resetSessions();
            window.scrollTo(0, 0);
            Router.go('matryoshka', { action: 'edit', _id: result.insertedId });
        });

    };

    that.nestablePart.delete = function( matryoshkaId ) {

        if (!confirm('Are you sure you want to remove this page and all backups?')) return ;

        Meteor.call('matryoshka/nestable/delete', matryoshkaId, function (error, result) {

            that.nestablePart.resetSessions();
            console.log('removed: '+result);
            Router.go('matryoshka');

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

            if (action === 'put') {

                // console.log('put!', value);

                if( typeof value === 'string') {
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

        if (action === 'updateFields') {

            // Iterate over the different types, find this specific one
            _.each(Matryoshka.nestables[context.type], function(type, key, list){
            
                if (type.nestableName === context.nestableName) {
                    context = _.extend(context, type);
                }
            
            });
        }

        _.each(Matryoshka.nestables, function( actualArrayPart, actualArrayPartKey ){

             // Go at it again
             _.each(context[actualArrayPartKey], function( part, partKey ){

                if (action === 'move' && context[actualArrayPartKey][partKey].matryoshkaId === matryoshkaId) {
                    stuffToMove = {
                        partKey: partKey,
                        type: actualArrayPartKey,
                        currentPosition: partKey
                    };
                }

                context[actualArrayPartKey][partKey] = that.addValueInObjectBasedOnId( part, matryoshkaId, action, key, value );

            });

            // Remove falsy values, which will be what is returned if an element is deleted. And don't add it if it's empty.
            var compactedArray = _(context[actualArrayPartKey]).compact();
            if (compactedArray.length > 0 || context[actualArrayPartKey]) context[actualArrayPartKey] = compactedArray;
            // else context[actualArrayPartKey] = [];

         });

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

    that.init = function () {

    };

    that.init();

};

Matryoshka = new MatryoshkaHandler();