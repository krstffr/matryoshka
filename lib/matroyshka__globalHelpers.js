// Just compare two values
Handlebars.registerHelper('ifValueEquals', function (val1, val2) {
    // console.log(val1, val2);
    if (val1 === val2)
        return true;
    return false;
});

// Checks if the value of an <option> inside a <select> is equal to something
Handlebars.registerHelper('ifSelectValueEquals', function (id, name, compare) {
    if (!Session.get('matroyshkaCurrentlySetSelectValues')) return false;
    if (!Session.get('matroyshkaCurrentlySetSelectValues')[id+'-'+name]) return false;
    // Convert toString() just to make sure that numbers will work to compare as well as strings
    return Session.get('matroyshkaCurrentlySetSelectValues')[id+'-'+name].toString() === compare.toString();
});

// Use {{ matroyshkaCurrentNestablePart }} to get the currently select nestable part
Handlebars.registerHelper('matroyshkaCurrentNestablePart', function () {

	// If "this" is the root URL, then it has a yield method (from iron-router)
	if (this.yield) {
        return Session.get('matroyshkaCurrentNestable');
    }

	else return this;
});

Handlebars.registerHelper('nestableCreatable', function () {
    return Matroyshka.nestablesCreatable;
});