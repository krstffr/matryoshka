Template.matroyshka__rootContainer.helpers({
    nestableCreatable: function () {
        return Matroyshka.nestablesCreatable;
    },
    partIsVisible: function () {
        return Session.get('matroyshkaCurrentNestable');
    }
});

Template.matroyshka__rootContainer.events({
    'click .matroyska-nestable-new': function (e) {
        
        var nestablePartName = this.toString();

        Matroyshka.nestablePart.new( nestablePartName );

    },
    'click .update-templates': function (e) {

        e.stopImmediatePropagation();

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), null, 'updateFields' );

        Session.set('matroyshkaCurrentNestable', updatedSession );

    },
    'click .add-temp-item': function () {
        Temp.insert({ name: +new Date(), somethingElse: 'WOW' });
    },
    'click .matroyska-nestable-save': function () {
        Matroyshka.nestablePart.save( this );
    },
    'click .matroyska-nestable-delete': function () {
        Matroyshka.nestablePart.delete( this.matroyshkaId );
    },
    'click .matroyska-nestable-go-live': function () {
        Matroyshka.nestablePart.goLive( this );
    },
    'click .matroyska-nestable-duplicate': function () {
        Matroyshka.nestablePart.duplicate( this );
    }
});