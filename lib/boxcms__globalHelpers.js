Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
};


Handlebars.registerHelper('eachWithParent', function(context, options) {
    var self = this;
    var contextWithParent = _.map(context,function(p) {
        p.parent = self.id;
        return p;
    });
    return Handlebars._default_helpers.each(contextWithParent, options);
});


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