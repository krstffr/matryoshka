matroyshka__mainMenu__toggleMenu = function() {
	var menuEl = $('.matroyshka__mainMenu__menu-container');
	menuEl.toggleClass('matroyshka__mainMenu__menu-container--visible');
};

Template.matroyshka__mainMenu.events({
	'click .matroyshka__mainMenu__button-show-menu': function (e) {
		matroyshka__mainMenu__toggleMenu();
	},
	'click .matroyshka__mainMenu__button-home': function (e) {
		Router.go('/matroyshka');
	}
});

Template.matroyshka__mainMenu.helpers({
	menuItems: function () {
		var sort = {};
		sort.matroyshkaName = 1;
		return MatroyshkaNestables.find({ type: this.name, matroyshkaStatus: 'editable' }, { sort: sort });
	},
	menuKey: function ( context ) {
		return this.matroyshkaName;
	},
	nestables: function() {
		return Matroyshka.nestables[this.name];
	}
});