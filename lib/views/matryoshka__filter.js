Template.matryoshka__filter.events({
  'keydown .matryoshka__filter__input, keyup .matryoshka__filter__input': function ( e ) {
    // Check if user pressed esc-key or backspace on an empty input
    var filterValue = $(e.currentTarget).val();
    if ( e.type === 'keydown' && (e.keyCode === 27 || (e.keyCode === 8  && filterValue.length < 1) ) ) {
      Matryoshka.filter.toggle();
      return;
    }
    if ( e.type === 'keyup' )
      Matryoshka.filter.set( filterValue );
  },
  'click .matryoshka__filter__close-button': function ( e ) {
    Matryoshka.filter.toggle();
  }
});
