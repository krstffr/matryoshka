Template.matryoshka__nestablePartButtons.helpers({
	nestableButtons: function () {
		if (Matryoshka.currentNestable.get())
			return matryoshka__UIbuttons.nestablePart;
	}
});
