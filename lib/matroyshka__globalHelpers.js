Handlebars.registerHelper('ifValueEquals', function (val1, val2) {
    // console.log(val1, val2);
    if (val1 === val2)
        return true;
    return false;
});

Handlebars.registerHelper('ifSelectValueEquals', function (id, name, compare) {
    if (!Session.get('matroyshkaCurrentlySetSelectValues')) return false;
    if (!Session.get('matroyshkaCurrentlySetSelectValues')[id+'-'+name]) return false;
    // Convert toString() just to make sure that numbers will work to compare as well as strings
    return Session.get('matroyshkaCurrentlySetSelectValues')[id+'-'+name].toString() === compare.toString();
});