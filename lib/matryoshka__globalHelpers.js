// MOVE ALL THIS TO THE MATRYOSHKA OBJECT!
Handlebars.registerHelper('matryoshka__getFieldValue', function( context ) {

  // If there is no context, then return nothing
  if (!context) return;

  // If there is a beforeAction, exectute it
  if (this.beforeAction) {

    // Type must be locked!
    if (this.type !== 'locked') {
      return 'error, type must be locked when using beforeAction!';
    }

    // Store the actual vars to pass to the beforeAction method
    // (We get those from the context)
    var varsFromContext = [];
    var toReturn;

    for (var i = 0; i < this.beforeAction.vars.length; i++) {
      varsFromContext.push( context[this.beforeAction.vars[i]] );
    }

    // Here the function is ran using the actual vars (from the context)
    toReturn = window[this.beforeAction.fn].apply(this, varsFromContext );

    // Update the Matryoshka object
    Matryoshka.currentNestable.update( context.matryoshkaId, 'put', this.name, toReturn );

    // Return it to the locked field.
    return toReturn;

  }

  // Return the name field from the context
  return context[ this.name ];

});

// Just compare two values
Handlebars.registerHelper('ifValueEquals', function (val1, val2) {
    // console.log(val1, val2);
    if (val1 === val2)
        return true;
    return false;
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