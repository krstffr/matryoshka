// If you click the focus-on-part element the parent (container)
// of the current nestable will get a focus class attached to it
// which will place it above everything else.
// Other elements which are currently focused will first be un-focused.

Template.matryoshka__nestableSubPartButtons.events({
	"click .create-new-nestable": function ( e ) {

		if (!confirm('Do you want to create a new part from this?')) return false;

		Matryoshka.nestablePart.newPart( this.type, this.nestableName, this );

	},
	"click .focus-on-part": function ( e ) {

		var clickedBtn = $(e.currentTarget);
		var idOfPart = clickedBtn.data('parentId');

		matryoshka__focusOnPagePart(idOfPart);

	}
});

Template.matryoshka__nestableSubPartButtons.helpers({
	nestableCreateable: function () {
		return _.findWhere( Matryoshka.nestablesCreatable, { name: this.type} );
	}
});
