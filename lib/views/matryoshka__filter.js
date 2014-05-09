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

// Function for extracting values from regex
matryoska__filter__filterRegex = function (collection, key, regex) {
  return _.filter(collection, function(obj){
    if (!obj[key]) return false;
    return obj[key].toString().match(regex);}
  );
};


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

Template.matryoshka__filter.helpers({});