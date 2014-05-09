// This is used for storing custom key up events throughout the application
onBodyKeyUpEvents = [];

// Just compare two values
Handlebars.registerHelper('ifValueEquals', function (val1, val2) {
    // console.log(val1, val2);
    if (val1 === val2)
        return true;
    return false;
});

// Checks if the value of an <option> inside a <select> is equal to something
Handlebars.registerHelper('ifSelectValueEquals', function (id, name, compare) {
    if (!compare) return false;
    if (!Session.get('matryoshkaCurrentlySetSelectValues')) return false;
    if (!Session.get('matryoshkaCurrentlySetSelectValues')[id+'-'+name]) return false;
    // Convert toString() just to make sure that numbers will work to compare as well as strings
    return Session.get('matryoshkaCurrentlySetSelectValues')[id+'-'+name].toString() === compare.toString();
});

// Use {{ matryoshkaCurrentNestablePart }} to get the currently select nestable part
Handlebars.registerHelper('matryoshkaCurrentNestablePart', function () {

	// If "this" is the root URL, then it has a yield method (from iron-router)
	if (this.yield) {
        return Session.get('matryoshkaCurrentNestable');
    }

	else return this;
});

Handlebars.registerHelper('nestableCreatable', function () {
    return Matryoshka.nestablesCreatable;
});

// Function for hiding/showing the Add new part-overlay

matryoshka__toggleAddPartOverlay = function ( clickedEl, showOrHide ) {

    var parent = $(clickedEl.parent());

    $('.matryoshka__nestable__container__add-part-container').hide();
    parent.find('.matryoshka__nestable__container__add-part-container, .matryoshka__nestable__container__add-part-container__extra-fader').first()[showOrHide]();

};

matryoshka__focusOnPagePart = function ( idOfPart ) {
  var cssClassOfFocus = 'matryoshka__nestable__container__col--focus';
  var currContainer = $('.matryoshka__nestable__container__col--'+idOfPart).parent();

  // Remove any currently focused elements
  $('.'+cssClassOfFocus).not(currContainer).removeClass(cssClassOfFocus);

  // Add focus to the currently selected element
  currContainer.toggleClass(cssClassOfFocus);
};
