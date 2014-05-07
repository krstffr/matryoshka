// If you click the focus-on-part element the parent (container)
// of the current nestable will get a focus class attached to it
// which will place it above everything else.
// Other elements which are currently focused will first be un-focused.

Template.matryoshka__nestableSubPartButtons.events({
	"click .focus-on-part": function ( e ) {

		var clickedBtn = $(e.currentTarget);
		var idOfPart = clickedBtn.data('parentId');

		matryoshka__focusOnPagePart(idOfPart);

	},
	"click .hide-part": function ( e ) {

		e.stopImmediatePropagation();

		var clickedBtn = $(e.currentTarget);
		var parentContainer = clickedBtn.closest('.matryoshka__nestable__container');

		parentContainer.toggleClass('matryoshka__nestable__container--hidden');

	}

});
