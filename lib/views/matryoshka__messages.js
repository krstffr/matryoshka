Template.matryoshka__messages.helpers({
	messages: function () {
		return Matryoshka.messages.get();
	}
});

Template.matryoshka__messages.events({
	'click .hide-message': function () {
		Matryoshka.messages.removeMessage( this );
	}
});