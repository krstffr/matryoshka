Template.matroyshka__mainMenu.helpers({
	menuItems: function () {
		var sort = {};
		sort[ this.menuListKey ] = 1;
		return MatroyshkaNestables.find({ type: this.name, matroyshkaStatus: 'editable' }, { sort: sort });
	},
	 menuKey: function ( context ) {
		return this[ context.menuListKey ];
	}
});