Template.matroyshka__partLooper.helpers({
    savedNestableParts: function() {
        return MatroyshkaNestables.find({ matroyshkaStatus: 'editable', nestableName: this.nestableName });
    },
    selectableData: function () {
        if (this.selectableData.type) {
            if (this.selectableData.type === 'collection')
                if (window[this.selectableData.collectionName])
                    return window[this.selectableData.collectionName].find( this.selectableData.collectionSelector );
        }
        else {
            // console.log(this.selectableData);
            return this.selectableData;
        }
    },
    fields: function () {
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

        Matroyshka.setCurrentlySetSelectValues( key, value );

    },
    getFieldValue: function( context ) {
        return context[ this.name ];
    },
    getLinkedNestableName: function( context ) {
        var linkedNestable = MatroyshkaNestables.findOne( context.nestableToLinkId );
        if (linkedNestable)
            return linkedNestable.matroyshkaName;
    },
    recurse: function () {
        // Return this template but with the new context
        return Template['matroyshka__partLooper']( this );
    },
    actualNestablesInArray: function () {
        // Return all the actual arrayPartParts
        return Matroyshka.nestables[this.name];
    },
    actualNestables: function( context ) {
        return context[ this.name ];
    }
});

Template.matroyshka__partLooper.events({
    'change .matroyshka-save-on-select': function (e) {

        e.stopImmediatePropagation();

        var input = $(e.currentTarget),
            value = input.val(),
            matroyshkaId = input.data('parent-id'),
            key = this.name;

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), matroyshkaId, 'put', key, value );

        Session.set('matroyshkaCurrentNestable', updatedSession );

        // Update the currenly selected value to the session which checks these things
        Matroyshka.setCurrentlySetSelectValues( matroyshkaId+'-'+key, value );

    },
    'keyup .matroyshka-save-on-blur': function (e) {

        e.stopImmediatePropagation();

        var input = $(e.currentTarget),
            value = input.val(),
            matroyshkaId = input.data('parent-id'),
            key = this.name;

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), matroyshkaId, 'put', key, value );

        Session.set('matroyshkaCurrentNestable', updatedSession );

    },
    'click .add-predefined-part': function (e) {

        e.stopImmediatePropagation();

        var linkedObject = {
                fields: [{ name: 'nestableToLinkId', type: 'linkedNestable' }],
                matroyshkaId: Matroyshka.nestablePart.generateId(),
                creationDate: new Date(),
                nestableToLinkId: this._id
            },
            clickedBtn = $(e.currentTarget),
            matroyshkaId = clickedBtn.data('parent-id'),
            key = this.type;

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), matroyshkaId, 'put', key, linkedObject );

        Session.set('matroyshkaCurrentNestable', updatedSession );

    },
    'click .add-part': function (e) {

        e.stopImmediatePropagation();

        var defaultNewObject = {
                matroyshkaId: Matroyshka.nestablePart.generateId(),
                creationDate: new Date()
            },
            clickedBtn = $(e.currentTarget),
            matroyshkaId = clickedBtn.data('parent-id'),
            key = this.type,
            value = _.extend(this, defaultNewObject);

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), matroyshkaId, 'put', key, value );

        Session.set('matroyshkaCurrentNestable', updatedSession );

    },
    'click .delete-part': function (e) {

        e.stopImmediatePropagation();

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), this.matroyshkaId, 'delete' );

        Session.set('matroyshkaCurrentNestable', updatedSession );

    },
    'click .move-part': function (e) {

        e.stopImmediatePropagation();

        var clickedBtn = $(e.currentTarget),
            moveWhere = clickedBtn.data('moveWhere');

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), this.matroyshkaId, 'move', moveWhere );

        Session.set('matroyshkaCurrentNestable', false);

        Meteor.setTimeout(function () {
            Session.set('matroyshkaCurrentNestable', updatedSession );
        }, 1);

    },
    'click .show-part-list': function (e) {

        var clickedBtn = $(e.currentTarget),
            parent = $(clickedBtn.parent());

        $('.matroyshka__nestable__container__add-part-container').hide();
        parent.find('.matroyshka__nestable__container__add-part-container, .matroyshka__nestable__container__add-part-container__extra-fader').first().show();

    }
});