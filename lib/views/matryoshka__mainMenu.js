matryoshka__mainMenu__toggleMenu = function() {
	var menuEl = $('.matryoshka__mainMenu__menu-container');
	menuEl.toggleClass('matryoshka__mainMenu__menu-container--visible');
};

Template.matryoshka__mainMenu.events({
	'click .matryoshka__mainMenu__button-show-menu': function (e) {
		matryoshka__mainMenu__toggleMenu();
	},
	'click .matryoshka__mainMenu__button-home': function (e) {
		Router.go('/matryoshka');
	}
});

Template.matryoshka__mainMenu.helpers({
	menuItems: function () {
		var sort = {};
		sort.matryoshkaName = 1;
		return MatryoshkaNestables.find({ type: this.name, matryoshkaStatus: 'editable' }, { sort: sort });
	},
	menuKey: function ( context ) {
		return this.matryoshkaName;
	},
	nestables: function() {
		return Matryoshka.nestables[this.name];
	}
});