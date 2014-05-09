matryoshka__mainMenu__toggleMenu = function() {
	var menuEl = $('.matryoshka__mainMenu__menu-container');
	menuEl.toggleClass('matryoshka__mainMenu__menu-container--visible');
};

// This function is for triggering the filter
// using key M
onBodyKeyUpEvents.push(function(e) {
	if (e.keyCode === 77) { matryoshka__mainMenu__toggleMenu(); }
});

Template.matryoshka__mainMenu.events({
	'click .matryoshka__mainMenu__button-show-menu': function (e) {
		matryoshka__mainMenu__toggleMenu();
	},
	'click .matryoshka__mainMenu__button-home': function (e) {
		Matryoshka.nestablePart.resetSessions();
		Router.go('/matryoshka');
	},
	'click .matryoshka__mainMenu__button-logout': function (e) {
		if (!confirm('Do you really want to log out?')) return;
		Meteor.logout();
	},
	'click a': function (e) {
		matryoshka__mainMenu__toggleMenu();
	},
	'click .matryoshka__mainMenu__button-filter': function (e) {
		matryoska__filter__toggleFilter();
	}
});

Template.matryoshka__mainMenu.helpers({
	mainMenuButtons: function () {
		return matryoshka__UIbuttons.mainMenu;
	},
	menuItems: function () {
		var sort = {};
		sort.matryoshkaName = 1;
		return MatryoshkaNestables.find({ type: this.name, matryoshkaStatus: 'editable', nestableCreateable: true }, { sort: sort });
	},
	menuKey: function ( context ) {
		return this.matryoshkaName;
	},
	nestables: function() {
		return _(Matryoshka.nestables[this.name]).where({ nestableCreateable: true });
	}
});
