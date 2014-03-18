Template.matroyshka__rootContainer.helpers({
    partIsVisible: function () {
        return Session.get('matroyshkaCurrentNestable');
    }
});

Template.matroyshka__rootContainer.events({
    'click .matroyska-nestable-new': function (e) {
        var nestablePartName = this.name;
        Matroyshka.nestablePart.new( nestablePartName );
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