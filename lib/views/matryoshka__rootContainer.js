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

        Matryoshka.nestablePart.newPart( nestablePartType, nestablePartName );

        matryoshka__toggleAddPartOverlay( clickedBtn, 'hide' );
        matryoshka__mainMenu__toggleMenu();

    },
    'click .matroyska-nestable-save': function () {
        Matryoshka.nestablePart.save( Session.get('matryoshkaCurrentNestable') );
    },
    'click .matroyska-nestable-delete': function () {
        Matryoshka.nestablePart.delete( Session.get('matryoshkaCurrentNestable').matryoshkaId );
    },
    'click .matroyska-nestable-go-live': function () {
        Matryoshka.nestablePart.goLive( Session.get('matryoshkaCurrentNestable') );
    },
    'click .matroyska-nestable-duplicate': function () {
        Matryoshka.nestablePart.duplicate( Session.get('matryoshkaCurrentNestable') );
    },
    'click .matroyska-nestable-preview': function () {
        window.open( Matryoshka.previewRoute.get() + Session.get('matryoshkaCurrentNestable')._id );
    }
});
