Template.matryoshka__nestablePartButtons.helpers({
	nestableButtons: function () {
		if (Session.get('matryoshkaCurrentNestable'))
			return matryoshka__UIbuttons.nestablePart;
	}
});
