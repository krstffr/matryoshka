// Array for holding all menu buttons
matryoshka__UIbuttons = {};


// Holder for main menu
matryoshka__UIbuttons.mainMenu = [];
// Holder for nesatables buttons
matryoshka__UIbuttons.nestablePart = [];


// Main menu buttons
matryoshka__UIbuttons.mainMenu.push({
    name: 'Menu',
    faIconClass: "fa-bars",
    cssClass: "matryoshka__mainMenu__button-show-menu"
});
matryoshka__UIbuttons.mainMenu.push({
    name: 'Home',
    faIconClass: "fa-home",
    cssClass: "matryoshka__mainMenu__button-home"
});
matryoshka__UIbuttons.mainMenu.push({
    name: 'Log out',
    faIconClass: "fa-sign-out",
    cssClass: "matryoshka__mainMenu__button-logout"
});
matryoshka__UIbuttons.mainMenu.push({
    name: 'Filter',
    faIconClass: "fa-filter",
    cssClass: "matryoshka__mainMenu__button-filter"
});

// Nestable buttons
matryoshka__UIbuttons.nestablePart.push({
    name: "Save",
    faIconClass: "fa-save",
    cssClass: "matroyska-nestable-save"
});
matryoshka__UIbuttons.nestablePart.push({
    name: "Delete",
    faIconClass: "fa-trash-o",
    cssClass: "matroyska-nestable-delete"
});
matryoshka__UIbuttons.nestablePart.push({
    name: "Go live",
    faIconClass: "fa-cloud-upload",
    cssClass: "matroyska-nestable-go-live"
});
matryoshka__UIbuttons.nestablePart.push({
    name: "Duplicate",
    faIconClass: "fa-copy",
    cssClass: "matroyska-nestable-duplicate"
});

// Add conditional button
matryoshka__UIbuttons.nestablePart.push({
    name: "Preview",
    faIconClass: "fa-eye",
    cssClass: "matroyska-nestable-preview",
    conditional: function() {
        // The current nestable
        var currentNestable = Matryoshka.currentNestable.get();
        var nestableDefinedInCode = Matryoshka.nestablePart.getNestablePartData( currentNestable.type, currentNestable.nestableName );
        // Make sure we have a previewable route
        if (nestableDefinedInCode && nestableDefinedInCode.previewRoute) return true;
        // Else return false
        return false;
    }
});
