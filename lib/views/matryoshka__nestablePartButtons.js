Template.matryoshka__nestablePartButtons.helpers({
	nestableButtons: function () {
		if (Matryoshka.currentNestable.get() && Matryoshka.currentNestable.get().matryoshkaId)
			return matryoshka__UIbuttons.nestablePart;
	}
});
