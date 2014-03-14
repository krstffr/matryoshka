Template.boxcms__rootContainer.events({
    'click .create-new-page': function (e) {
        var newPage = Boxcms.arrayParts.page[0];
        newPage.id = parseInt(+new Date()+''+Math.floor(Math.random()*250), 10);
        Session.set('aSession', newPage );
    },
    'click .create-new-grid-part': function (e) {
        var newGridPart = Boxcms.arrayParts.gridPart[0];
        newGridPart.id = parseInt(+new Date()+''+Math.floor(Math.random()*250), 10);
        Session.set('aSession', newGridPart );
    },
    'click .update-templates': function (e) {

        e.stopImmediatePropagation();

        var updatedSession = Boxcms.addValueInObjectBasedOnId( Session.get('aSession'), null, 'updateFields' );

        Session.set('aSession', updatedSession );

    },
    'click .add-temp-item': function() {

        Temp.insert({ name: +new Date() });

    }
});