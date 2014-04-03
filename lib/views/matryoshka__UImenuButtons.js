// Array for holding all menu buttons
matryoshka__UIbuttons = {};


// Holder for main menu
matryoshka__UIbuttons.mainMenu = [];
// Holder for nesatables buttons
matryoshka__UIbuttons.nestablePart = [];


// Main menu buttons
matryoshka__UIbuttons.mainMenu.push({
    name: 'Show main menu',
    faIconClass: "fa-bars",
    cssClass: "matryoshka__mainMenu__button-show-menu"
});
matryoshka__UIbuttons.mainMenu.push({
    name: 'Go home',
    faIconClass: "fa-home",
    cssClass: "matryoshka__mainMenu__button-home"
});


// Nestable buttons
matryoshka__UIbuttons.nestablePart.push({
    name: "Save nestable",
    faIconClass: "fa-save",
    cssClass: "matroyska-nestable-save"
});
matryoshka__UIbuttons.nestablePart.push({
    name: "Delete nestable",
    faIconClass: "fa-trash-o",
    cssClass: "matroyska-nestable-delete"
});
matryoshka__UIbuttons.nestablePart.push({
    name: "Set status to \"live\"",
    faIconClass: "fa-cloud-upload",
    cssClass: "matroyska-nestable-go-live"
});
matryoshka__UIbuttons.nestablePart.push({
    name: "Duplicate nestable",
    faIconClass: "fa-copy",
    cssClass: "matroyska-nestable-duplicate"
});

// Add conditional button
matryoshka__UIbuttons.nestablePart.push({
    name: "Preview nestable",
    faIconClass: "fa-eye",
    cssClass: "matroyska-nestable-preview",
    conditional: function() {
        // Make sure we have a previewable route
        if (!Matryoshka.previewRoute.isSet()) return false;
        // The current nestable
        var currentNestable = Session.get('matryoshkaCurrentNestable');
        // Get the type of the nestable
        var nestablesInType = Matryoshka.nestables[currentNestable.type];
        // Get this particular nestable
        var nestableClass = _.where(nestablesInType, { nestableName: currentNestable.nestableName })[0];
        return nestableClass.previewable === true;
    }
});
