matryoska__filter__toggleFilter = function () {

  // Reset the current search
  Session.set('matryoshka__filter', false);

  // Hide or show the filter
  $('.matryoshka__filter').toggleClass('matryoshka__filter--hidden');

  // Toggle the active class for the menu button
  $('.matryoshka__mainMenu__button-filter').toggleClass('matryoshka__mainMenu__button-filter--active');

  // Toggle the filter class for the body tag as well
  $('.matryoshka__body').toggleClass('matryoshka__body--filter-is-active');

  // If we've activated the class, do some things, else dont.
  if ($('.matryoshka__mainMenu__button-filter').hasClass('matryoshka__mainMenu__button-filter--active')) {
    $('.matryoshka__filter__input').val('').focus();
  } else {

  }
};

// This function is for triggering the filter
// using key F
onBodyKeyUpEvents.push(function(e) {
  if (e.keyCode === 70) { matryoska__filter__toggleFilter(); }
});

Template.matryoshka__filter.events({
  'keyup .matryoshka__filter__input': function (e) {
    // Check if user pressed esc-key
    if (e.keyCode === 27) {
      matryoska__filter__toggleFilter();
      return;
    }
    var filterValue = $(e.currentTarget).val();
    Session.set('matryoshka__filter', filterValue);
  },
  'click .matryoshka__filter__close-button': function (e) {
    matryoska__filter__toggleFilter();
  }
});
