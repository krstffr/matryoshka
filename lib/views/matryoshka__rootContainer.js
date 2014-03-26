Template.matryoshka__rootContainer.rendered = function () {
    $('body').addClass('matryoshka__body');
};

Template.matryoshka__rootContainer.helpers({
    partIsVisible: function () {
        return Session.get('matryoshkaCurrentNestable');
    }
});

Template.matryoshka__rootContainer.events({
    'click .matryoshka__nestable__container__add-part-container__extra-fader': function (e) {
        $('.matryoshka__nestable__container__add-part-container').hide();
    },
    'click .matroyska-nestable-new-show-list': function (e) {

        var clickedBtn = $(e.currentTarget);

        matryoshka__toggleAddPartOverlay( clickedBtn, 'show' );

    },
    'click .matroyska-nestable-new': function (e) {
        
        var clickedBtn = $(e.currentTarget),
            nestablePartName = this.nestableName,
            nestablePartType = this.type;

        Matryoshka.nestablePart.new( nestablePartType, nestablePartName );

        matryoshka__toggleAddPartOverlay( clickedBtn, 'hide' );
        matryoshka__mainMenu__toggleMenu();

    },
    'click .matroyska-nestable-save': function () {
        Matryoshka.nestablePart.save( this );
    },
    'click .matroyska-nestable-delete': function () {
        Matryoshka.nestablePart.delete( this.matryoshkaId );
    },
    'click .matroyska-nestable-go-live': function () {
        Matryoshka.nestablePart.goLive( this );
    },
    'click .matroyska-nestable-duplicate': function () {
        Matryoshka.nestablePart.duplicate( this );
    }
});