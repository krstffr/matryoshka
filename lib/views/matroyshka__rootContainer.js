Template.matroyshka__rootContainer.helpers({
    nestableCreatable: function () {
        return Matroyshka.nestablesCreatable;
    }
});

Template.matroyshka__rootContainer.events({
    'click .matroyska-create-new-nestable': function (e) {
        // Create a new nestable, get it from the object in the nestables array
        var newNestable = Matroyshka.nestables[this.toString()][0];
        // Set an id for the new nestable
        newNestable.id = parseInt(+new Date()+''+Math.floor(Math.random()*250), 10);
        // Set the matroyshkaCurrentNestable session to the new nestable
        Session.set('matroyshkaCurrentNestable', newNestable );
    },
    'click .update-templates': function (e) {

        e.stopImmediatePropagation();

        var updatedSession = Matroyshka.addValueInObjectBasedOnId( Session.get('matroyshkaCurrentNestable'), null, 'updateFields' );

        Session.set('matroyshkaCurrentNestable', updatedSession );

    },
    'click .add-temp-item': function() {

        Temp.insert({ name: +new Date(), somethingElse: 'WOW' });

    }
});