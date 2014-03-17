Handlebars.registerHelper('ifValueEquals', function (val1, val2) {
    // console.log(val1, val2);
    if (val1 === val2)
        return true;
    return false;
});

Handlebars.registerHelper('ifSelectValueEquals', function (id, name, compare) {
    if (!Session.get('currentlySetSelectValues')) return false;
    if (!Session.get('currentlySetSelectValues')[id+'-'+name]) return false;
    // Convert toString() just to make sure that numbers will work to compare as well as strings
    return Session.get('currentlySetSelectValues')[id+'-'+name].toString() === compare.toString();
});