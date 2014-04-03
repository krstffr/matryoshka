Template.matryoshka__fixedButton.helpers({
    conditional: function () {
        if (!this.conditional) return true;
        return this.conditional();
    }
});
