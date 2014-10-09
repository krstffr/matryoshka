matryoshka__mainMenu__toggleMenu = function() {
	var menuEl = $('.matryoshka__mainMenu__menu-container');
	menuEl.toggleClass('matryoshka__mainMenu__menu-container--visible');
};

Template.matryoshka__mainMenu.events({
	'click .matryoshka__mainMenu__button-show-menu': function (e) {
		matryoshka__mainMenu__toggleMenu();
	},
	'click .matryoshka__mainMenu__button-home': function (e) {
		Matryoshka.currentNestable.reset();
		Router.go('matryoshka__home');
	},
	'click .matryoshka__mainMenu__button-logout': function (e) {
		if (!confirm('Do you really want to log out?')) return;
		Meteor.logout();
		Matryoshka.messages.add({ message: 'You\'re now logged out', type: 'success' });
	},
	'click a': function (e) {
		matryoshka__mainMenu__toggleMenu();
	},
	'click .matryoshka__mainMenu__button-filter': function (e) {
		Matryoshka.filter.toggle();
	},
	'click .matryoshka__mainMenu__button-users': function (e) {
		Router.go('matryoshka__users');
	}
});

Template.matryoshka__mainMenu.helpers({
	activeMenuLink: function () {
		// If the current links _id is the same as the current route, mark it as active
		if (this._id === Router.current().params._id)
			return 'matryoshka__mainMenu__menu-container__col__link--active';
	},
	mainMenuButtons: function () {
		return Matryoshka.UI.UIbuttons.mainMenu;
	},
	menuItems: function () {
		var sort = {};
		sort.matryoshkaName = 1;
		var currentMenuItems = MatryoshkaNestables.find({ type: this.name, matryoshkaStatus: 'editable' }, { sort: sort }).fetch();
		return Matryoshka.filter.filterCollection( currentMenuItems, ['matryoshkaName'] );
	},
	menuKey: function ( context ) {
		return this.matryoshkaName;
	},
	nestables: function() {
		var nestables = _.chain(Matryoshka.nestables[this.name])
		.where({ nestableCreateable: true })
		.sortBy(function(nestable) { return nestable.nestableNameReadable; })
		.value();
		return Matryoshka.filter.filterCollection( nestables, ['nestableNameReadable', 'nestableName'] );
	}
});
