BoxcmsHandler = function() {

    var that = this;

    that.nestables = {};

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

    that.addValueInObjectBasedOnId = function( context, id, action, key, value ) {

        var stuffToMove = false;

        // We found it
        if (context.id === id) {

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
            _.each(Boxcms.nestables[context.type], function(type, key, list){
            
                if (type.nestableName === context.nestableName) {
                    context = _.extend(context, type);
                }
            
            });
        }

        _.each(Boxcms.nestables, function( actualArrayPart, actualArrayPartKey ){

             // Go at it again
             _.each(context[actualArrayPartKey], function( part, partKey ){

                if (action === 'move' && context[actualArrayPartKey][partKey].id === id) {
                    stuffToMove = {
                        partKey: partKey,
                        type: actualArrayPartKey,
                        currentPosition: partKey
                    };
                }

                context[actualArrayPartKey][partKey] = that.addValueInObjectBasedOnId( part, id, action, key, value );

            });

            // Remove falsy values, which will be what is returned if an element is deleted. And don't add it if it's empty.
            var compactedArray = _(context[actualArrayPartKey]).compact();
            if (compactedArray.length > 0) context[actualArrayPartKey] = compactedArray;
            else context[actualArrayPartKey] = [];

         });

        if (stuffToMove) {

            var maxPos = 0,
                newPos = 0;

            if (key === 'up') {
                maxPos =  context[stuffToMove.type].length;
                newPos = stuffToMove.partKey+1;
                if (newPos < maxPos)
                    context[stuffToMove.type] = Boxcms.moveInArray(context[stuffToMove.type], stuffToMove.partKey, newPos);
            }
            if (key === 'down') {
                newPos = stuffToMove.partKey-1;
                if (newPos >= maxPos)
                    context[stuffToMove.type] = Boxcms.moveInArray(context[stuffToMove.type], stuffToMove.partKey, newPos);
            }

        }

        return context;

    };

    that.setCurrentlySetSelectValues = function( key, value ) {

        var currentlySetSelectValues = Session.get('currentlySetSelectValues');
        if (!currentlySetSelectValues) currentlySetSelectValues = {};
        currentlySetSelectValues[key] = value;
        Session.set('currentlySetSelectValues', currentlySetSelectValues);

    };

    that.init = function() {

    };

    that.init();

};

Boxcms = new BoxcmsHandler();