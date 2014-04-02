Template.matryoshka__partLooper.helpers({
    savedNestableParts: function() {
        return MatryoshkaNestables.find({ matryoshkaStatus: 'live', nestableName: this.nestableName });
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
    fieldsTypeSpecific: function () {

        // TODO: This is just an EXACT copy of the method above!!!!! F I X    T H I S
        if (this.nestableName) {
            
            var nestablesInType = Matryoshka.nestables[this.type],
                currentNestable = _.where(nestablesInType, { nestableName: this.nestableName });

            if (!currentNestable[0]) return ;

            var fieldsDefinedInCode = currentNestable[0].fieldsTypeSpecific,
                matryoshkaNameFieldInObject = _.where(this.fieldsTypeSpecific, { name: 'matryoshkaName' }),
                matryoshkaNameFieldInCode = _.where(fieldsDefinedInCode, { name: 'matryoshkaName' });
            
            if ( matryoshkaNameFieldInObject.length > 0 && matryoshkaNameFieldInCode.length < 1 ) {
                fieldsDefinedInCode.unshift( matryoshkaNameFieldInObject[0] );
            }

            return fieldsDefinedInCode;
        }

        return this.fieldsTypeSpecific;

    },
    fieldsTypeSpecific__getFields: function( context ) {
        if (this[ context[this.name] ])
            return this[ context[this.name] ];
    },
    fieldsTypeSpecific__hasFieldsBool: function (context) {
        return this[ context[this.name] ] !== undefined;
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
            key = this.name,
            updatedSession = Session.get('matryoshkaCurrentNestable');

        // Check if we're dealing with a selectable from a collection
        if (this.selectableData) {
            if (this.selectableData.type === 'collection') {
                // Get the _id from the selected <option> and get the collection-id from it
                // Save it in the Session!
                var selectedOption = input.find('option:selected'),
                    collectionId = selectedOption.data('collection-id');

                updatedSession = Matryoshka.addValueInObjectBasedOnId( updatedSession, matryoshkaId, 'put', 'collection-id', collectionId );
            }
        }

        updatedSession = Matryoshka.addValueInObjectBasedOnId( updatedSession, matryoshkaId, 'put', key, value );

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