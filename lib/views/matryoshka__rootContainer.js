Template.matryoshka__rootContainer.helpers({
  userIsPermitted: function () {
    return Matryoshka.userIsPermitted();
  }
});

Template.matryoshka__rootContainer.events({
  'click .matryoshka__nestable__container__add-part-container__extra-fader': function (e) {
    $('.matryoshka__nestable__container__add-part-container').hide();
  },
  'click .matroyska-nestable-new-show-list': function (e) {

    var clickedBtn = $(e.currentTarget);

    matryoshka__toggleAddPartOverlay( clickedBtn, 'show' );

    Matryoshka.filter.hide();

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
    Matryoshka.nestablePart.save( Matryoshka.currentNestable.get() );
  },
  'click .matroyska-nestable-delete': function () {
    Matryoshka.nestablePart.deletePart( Matryoshka.currentNestable.get().matryoshkaId );
  },
  'click .matroyska-nestable-go-live': function () {
    Matryoshka.nestablePart.goLive( Matryoshka.currentNestable.get() );
  },
  'click .matroyska-nestable-duplicate': function () {
    Matryoshka.nestablePart.duplicate( Matryoshka.currentNestable.get() );
  },
  'click .matroyska-nestable-preview': function () {
    var currentNestable = Matryoshka.currentNestable.get();
    var nestableDefinedInCode = Matryoshka.nestablePart.getNestablePartData( currentNestable.type, currentNestable.nestableName );
    if (!nestableDefinedInCode.previewRoute)
      return false;
    window.open( nestableDefinedInCode.previewRoute + Matryoshka.currentNestable.get()._id );
  }
});
