Template.matroyshka__rootContainer.helpers({
    partIsVisible: function () {
        return Session.get('matroyshkaCurrentNestable');
    }
});

Template.matroyshka__rootContainer.events({
    'click .matroyshka__nestable__container__add-part-container__extra-fader': function (e) {
        $('.matroyshka__nestable__container__add-part-container').hide();
    },
    'click .matroyska-nestable-new-show-list': function (e) {
        var clickedBtn = $(e.currentTarget),
            parent = $(clickedBtn.parent());

        $('.matroyshka__nestable__container__add-part-container').hide();
        parent.find('.matroyshka__nestable__container__add-part-container, .matroyshka__nestable__container__add-part-container__extra-fader').first().show();
    },
    'click .matroyska-nestable-new': function (e) {
        
        var nestablePartName = this.nestableName,
            nestablePartType = this.type;

        Matroyshka.nestablePart.new( nestablePartType, nestablePartName );

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