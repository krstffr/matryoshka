Template.matryoshka__partLooper.helpers({
    savedNestableParts: function() {
        return MatryoshkaNestables.find({ matryoshkaStatus: 'live', nestableName: this.nestableName });
    },
    selectableData: function () {

        // If we have a selectableData.type declared, it should be a collection and we 
        // should return the collection cursor instead of the selectableData array (which is
        // the case otherwise
        if (this.selectableData.type) {

            // Just doublecheck that it's actually called collection
            // (In the futute we might support more sources of selectData)
            if (this.selectableData.type === 'collection') {
                
                // Make sure there is a collection with the name we've specified
                if (!window[this.selectableData.collectionName]) throw new Error('there is no collection called '+this.selectableData.collectionName);
                if (!this.selectableData.collectionSelector) throw new Error('You have to pass a "collectionSelector" to the selectableData object!');

                // Let's make sure we store the actual field inside a var (for later use)
                var specifiedCollectionField = this.selectableData.collectionField;

                // If no specific field is passed, return the whole cursor
                if (!specifiedCollectionField)
                    return window[this.selectableData.collectionName].find( this.selectableData.collectionSelector, { fields: { matryoshkaName: 1 } });

                // If there was a specifiedCollectionField, we go on!
                var fieldsToReturn = {},
                    nestablesToReturn;

                // This is for the mongo { fields: {} } selector, to only return the actual field we need
                fieldsToReturn[ specifiedCollectionField ] = 1;
                
                // Fetch all the docs which match our collectionSelector selector
                nestablesToReturn = window[this.selectableData.collectionName].find( this.selectableData.collectionSelector, { fields: fieldsToReturn } ).fetch();

                // Loop over all the docs, and store our passed key (field) in a name key instead (cause this is the key which will be outputted in the HTML loop)
                nestablesToReturn = _(nestablesToReturn).map( function( nestable ) {
                    return { name: nestable[specifiedCollectionField] };
                });

                // Retur all the docs
                return nestablesToReturn;
            }
        }
        else {
            // If there was to .type passed, just return the selectableData array
            return this.selectableData;
        }
    },
    name: function() {
        if (this.matryoshkaName)
            return this.matryoshkaName;
        return this.name;
    },
    fields: function () {

        // TODO: This don't work very well as we actually add fields when creating new objects,
        //       for example { matryoshkaName: "New Part" } to new parts.
        //       Maybe combine the fields from this.fields with the fields saved in the actual code?
        //       Probably won't work as we might rename fields at some point. Like imgSrc to imgUrl.
        //       In that example not both fields will show (and which one should?)
        // HACK2:For now, I'll also add the matryoshkaName as it's the only one thing that is actually
        //       added afterwards.

        // HACK: This returns the actual fields which are defined in the code instead of whats saved in
        //       the actual object
        if (this.nestableName) {
            
            // This is what happens:
            // 1. Return an array of all the nestables inside the type (defined in this.type)
            // 2. Only return the ones where nestableName is equal to this specific nestableName
            // 3. It's an array, therefore go into the [0] element and return it's fields array
            // 4. Check if the doc has a matryoshkaName field (and not the actual fields which are return)
            // 5. If there is one in the doc but not in the fields to be returned, add it!

            var nestablesInType = Matryoshka.nestables[this.type],
                currentNestable = _.where(nestablesInType, { nestableName: this.nestableName });

            if (!currentNestable[0]) return ;

            var fieldsDefinedInCode = currentNestable[0].fields,
                matryoshkaNameFieldInObject = _.where(this.fields, { name: 'matryoshkaName' }),
                matryoshkaNameFieldInCode = _.where(fieldsDefinedInCode, { name: 'matryoshkaName' });
            
            if ( matryoshkaNameFieldInObject.length > 0 && matryoshkaNameFieldInCode.length < 1 ) {
                fieldsDefinedInCode.unshift( matryoshkaNameFieldInObject[0] );
            }

            return fieldsDefinedInCode;
        }

        return this.fields;

    },
    fieldsTypeSpecific__getFields: function( context ) {
        if (this[ context[this.name] ])
            return this[ context[this.name] ];
    },
    fieldsTypeSpecific__hasFieldsBool: function (context) {
        return this[ context[this.name] ] !== undefined;
    },
    getFieldValueFromKey: function( context, key ) {
        if (context)
            return context[ key ];
    },
    setActiveSelectValue: function( id, context, name ) {

        var key = id+'-'+name,
            value = context[name];

        // If the value is already set, then don't do anything
        if (Matryoshka.getCurrentlySetSelectValues( key ) === value) return ;

        Matryoshka.setCurrentlySetSelectValues( key, value );

    },
    getFieldValue: function( context ) {
        // console.log(context, this);
        return context[ this.name ];
    },
    getLinkedNestableName: function( context ) {
        var linkedNestable = MatryoshkaNestables.findOne( context.nestableToLinkId );
        if (linkedNestable)
            return linkedNestable.matryoshkaName;
    },
    recurse: function () {
        // Return this template but with the new context
        return Template['matryoshka__partLooper'];
    },
    dataToRecurse: function() {
        return this;
    },
    actualNestablesInArray: function () {

        // Return all the actual arrayPartParts
        var nestableTypeName = this.name,
            specificNestables = this.nestables;

        // If we have specified actual nestables, we will return only those
        if (specificNestables) {
            // Store the nestables in this array
            var templatesToReturn = [];
            // Loop over all the nestables inside the provided type (which we get frmo the nestableTypeName)
            _.each(Matryoshka.nestables[nestableTypeName], function(nestable){
                // If the name of the nestable is found in the specificNestables array, then push it to the array which will be returned
                if (specificNestables.indexOf(nestable.nestableName) > -1) templatesToReturn.push(nestable);
            });
            // Return only the templates which were found in the array
            return templatesToReturn;
        }
        
        // If we did not specify a nestables array, return all templates
        else
            return Matryoshka.nestables[nestableTypeName];

    },
    actualNestables: function( context ) {
        if (!context) return ;
        return context[ this.name ];
    },
    nestableGetCssClasses: function () {
        // This string will be returned
        var cssToReturn = ' ';
        // Loop over all the keys/values and add them to the string which will be returned
        _.each(this.matryoshkaCssClasses, function(value, key, list){
            cssToReturn += 'matryoshkaCssClass--'+key+'--'+value+' ';
        });
        return cssToReturn;
    }
});

Template.matryoshka__partLooper.events({
    'change .matryoshka-save-on-select': function (e) {

        e.stopImmediatePropagation();

        var input = $(e.currentTarget),
            value = input.val(),
            matryoshkaId = input.data('parent-id'),
            key = this.name;

        var updatedSession = Matryoshka.addValueInObjectBasedOnId( Session.get('matryoshkaCurrentNestable'), matryoshkaId, 'put', key, value );

        if (this.cssOutputValueAsClass)
            updatedSession = Matryoshka.addValueInObjectBasedOnId( updatedSession, matryoshkaId, 'setCss', key, value );

        Session.set('matryoshkaCurrentNestable', updatedSession );

        // Update the currenly selected value to the session which checks these things
        Matryoshka.setCurrentlySetSelectValues( matryoshkaId+'-'+key, value );

    },
    'keyup .matryoshka-save-on-blur, blur .matryoshka-save-on-blur': function (e) {

        e.stopImmediatePropagation();

        var input = $(e.currentTarget),
            value = input.val(),
            matryoshkaId = input.data('parent-id'),
            key = this.name;

        // If {number: true} then make sure we store a number
        if (this.number) value = parseInt(value, 10);

        var updatedSession = Matryoshka.addValueInObjectBasedOnId( Session.get('matryoshkaCurrentNestable'), matryoshkaId, 'put', key, value );

        Session.set('matryoshkaCurrentNestable', updatedSession );

    },
    'click .add-predefined-part': function (e) {

        e.stopImmediatePropagation();

        var linkedObject = {
                fields: [{ name: 'nestableToLinkId', type: 'linkedNestable' }],
                matryoshkaId: Matryoshka.nestablePart.generateId(),
                nestableNameReadable: 'Linked part',
                creationDate: new Date(),
                nestableToLinkId: this._id
            },
            clickedBtn = $(e.currentTarget),
            matryoshkaId = clickedBtn.data('parent-id'),
            key = this.type;

        var updatedSession = Matryoshka.addValueInObjectBasedOnId( Session.get('matryoshkaCurrentNestable'), matryoshkaId, 'put', key, linkedObject );

        Session.set('matryoshkaCurrentNestable', updatedSession );

        matryoshka__toggleAddPartOverlay( clickedBtn, 'hide' );

    },
    'click .add-part': function (e) {

        e.stopImmediatePropagation();

        var defaultNewObject = {
                matryoshkaId: Matryoshka.nestablePart.generateId(),
                creationDate: new Date()
            },
            clickedBtn = $(e.currentTarget),
            matryoshkaId = clickedBtn.data('parent-id'),
            key = this.type,
            value = _.extend(this, defaultNewObject);

        var updatedSession = Matryoshka.addValueInObjectBasedOnId( Session.get('matryoshkaCurrentNestable'), matryoshkaId, 'put', key, value );

        Session.set('matryoshkaCurrentNestable', updatedSession );

        matryoshka__toggleAddPartOverlay( clickedBtn, 'hide' );

    },
    'click .delete-part': function (e) {

        e.stopImmediatePropagation();

        var updatedSession = Matryoshka.addValueInObjectBasedOnId( Session.get('matryoshkaCurrentNestable'), this.matryoshkaId, 'delete' );

        Session.set('matryoshkaCurrentNestable', updatedSession );

    },
    'click .move-part': function (e) {

        e.stopImmediatePropagation();

        var clickedBtn = $(e.currentTarget),
            moveWhere = clickedBtn.data('moveWhere');

        var updatedSession = Matryoshka.addValueInObjectBasedOnId( Session.get('matryoshkaCurrentNestable'), this.matryoshkaId, 'move', moveWhere );

        Session.set('matryoshkaCurrentNestable', false);

        Meteor.setTimeout(function () {
            Session.set('matryoshkaCurrentNestable', updatedSession );
        }, 1);

    },
    'click .show-part-list': function (e) {

        var clickedBtn = $(e.currentTarget),
            parent = $(clickedBtn.parent());

        $('.matryoshka__nestable__container__add-part-container').hide();
        parent.find('.matryoshka__nestable__container__add-part-container, .matryoshka__nestable__container__add-part-container__extra-fader').first().show();

    }
});