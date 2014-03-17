Template.matroyshka__partLooper.helpers({
    selectableData: function() {
        if (this.selectableData.type) {
            if (this.selectableData.type === 'collection')
                if (window[this.selectableData.collectionName])
                    return window[this.selectableData.collectionName].find( this.selectableData.collectionSelector );
        }
        else {
            return this.selectableData;
        }
    },
    fields: function() {
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
    currentPart: function () {
        // If "this" is the root URL, then it has a yield method
        if (this.yield)
            return Session.get('matroyshkaCurrentNestable');
        else return this;
    },
    recurse: function() {
        // Return this template but with the new context
        return Template['matroyshka__partLooper']( this );
    },
    actualNestablesInArray: function() {
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
            id = input.data('parent-id'),
            key = this.name;

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), id, 'put', key, value );

        Session.set('matroyshkaCurrentNestable', updatedSession );

        // Update the currenly selected value to the session which checks these things
        Matroyshka.setCurrentlySetSelectValues( id+'-'+key, value );

    },
    'keyup .matroyshka-save-on-blur': function (e) {

        e.stopImmediatePropagation();

        var input = $(e.currentTarget),
            value = input.val(),
            id = input.data('parent-id'),
            key = this.name;

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), id, 'put', key, value );

        Session.set('matroyshkaCurrentNestable', updatedSession );

    },
    'click .add-part': function (e) {

        e.stopImmediatePropagation();

        var defaultNewObject = {
                id: parseInt(+new Date()+''+Math.floor(Math.random()*250), 10),
                creationDate: new Date()
            },
            clickedBtn = $(e.currentTarget),
            id = clickedBtn.data('parent-id'),
            key = this.type,
            value = _.extend(this, defaultNewObject);

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), id, 'put', key, value );

        Session.set('matroyshkaCurrentNestable', updatedSession );

    },
    'click .delete-part': function (e) {

        e.stopImmediatePropagation();

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), this.id, 'delete' );

        Session.set('matroyshkaCurrentNestable', updatedSession );

    },
    'click .move-part': function (e) {

        e.stopImmediatePropagation();

        var clickedBtn = $(e.currentTarget),
            moveWhere = clickedBtn.data('moveWhere');

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), this.id, 'move', moveWhere );

        Session.set('matroyshkaCurrentNestable', false);

        Meteor.setTimeout(function () {
            Session.set('matroyshkaCurrentNestable', updatedSession );
        }, 1);

    }
});