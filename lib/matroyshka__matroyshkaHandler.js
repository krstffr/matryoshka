MatroyshkaHandler = function () {

    var that = this;

    that.nestables = {};
    that.nestablePart = {};

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
        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), null, 'updateFields' );
        Session.set('matroyshkaCurrentNestable', updatedSession );
    };

    that.nestablePart.generateId = function () {

        return parseInt(+new Date()+''+new Date().getMilliseconds()+''+Math.floor(Math.random()*250), 10);

    };

    that.nestablePart.new = function( nestablePartType, nestablePartName ) {

        that.nestablePart.resetSessions();
        
        var newNestablePart = _.where(Matroyshka.nestables[nestablePartType], { nestableName: nestablePartName })[0];
        
        // Set an id for the new nestable
        newNestablePart.matroyshkaId = that.nestablePart.generateId();

        // Create the matroyshkaName for the new nestablePart
        newNestablePart.fields = _.reject(newNestablePart.fields, function(field){ return field.name === 'matroyshkaName'; });
        newNestablePart.fields.unshift({ name: 'matroyshkaName', type: 'text' });
        newNestablePart.matroyshkaName = 'New part';

        // Set a create date
        newNestablePart.creationDate = new Date();
        
        // Set the matroyshkaCurrentNestable session to the new nestable
        Session.set('matroyshkaCurrentNestable', newNestablePart );

        Router.go('matroyshka');

    };

    that.nestablePart.duplicate = function( doc ) {
        
        doc.matroyshkaId = that.nestablePart.generateId();
        doc.matroyshkaName = doc.matroyshkaName+'-COPY';
        that.nestablePart.save(doc);

    };

    that.nestablePart.resetSessions = function () {
        Session.set('matroyshkaCurrentNestable', false);
    };

    that.nestablePart.save = function( doc, goLiveBool ) {

        Meteor.call('matroyshka/nestable/save', doc, goLiveBool, function (error, result) {
            that.nestablePart.resetSessions();
            window.scrollTo(0, 0);
            Router.go('matroyshka', { action: 'edit', _id: result.insertedId });
        });

    };

    that.nestablePart.delete = function( matroyshkaId ) {

        if (!confirm('Are you sure you want to remove this page and all backups?')) return ;

        Meteor.call('matroyshka/nestable/delete', matroyshkaId, function (error, result) {

            that.nestablePart.resetSessions();
            console.log('removed: '+result);
            Router.go('matroyshka');

        });

    };

    that.nestablePart.goLive = function( doc ) {

        that.nestablePart.save( doc, 'goLive' );

    };

    that.addValueInObjectBasedOnId = function( context, matroyshkaId, action, key, value ) {

        var stuffToMove = false;

        // We found it
        if (context.matroyshkaId === matroyshkaId) {

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
            _.each(Matroyshka.nestables[context.type], function(type, key, list){
            
                if (type.nestableName === context.nestableName) {
                    context = _.extend(context, type);
                }
            
            });
        }

        _.each(Matroyshka.nestables, function( actualArrayPart, actualArrayPartKey ){

             // Go at it again
             _.each(context[actualArrayPartKey], function( part, partKey ){

                if (action === 'move' && context[actualArrayPartKey][partKey].matroyshkaId === matroyshkaId) {
                    stuffToMove = {
                        partKey: partKey,
                        type: actualArrayPartKey,
                        currentPosition: partKey
                    };
                }

                context[actualArrayPartKey][partKey] = that.addValueInObjectBasedOnId( part, matroyshkaId, action, key, value );

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
                    context[stuffToMove.type] = Matroyshka.moveInArray(context[stuffToMove.type], stuffToMove.partKey, newPos);
            }
            if (key === 'down') {
                newPos = stuffToMove.partKey-1;
                if (newPos >= maxPos)
                    context[stuffToMove.type] = Matroyshka.moveInArray(context[stuffToMove.type], stuffToMove.partKey, newPos);
            }

        }

        return context;

    };

    that.setCurrentlySetSelectValues = function( key, value ) {

        var currentlySetSelectValues = Session.get('matroyshkaCurrentlySetSelectValues');
        if (!currentlySetSelectValues) currentlySetSelectValues = {};
        currentlySetSelectValues[key] = value;
        Session.set('matroyshkaCurrentlySetSelectValues', currentlySetSelectValues);

    };

    that.init = function () {

    };

    that.init();

};

Matroyshka = new MatroyshkaHandler();