Template.matryoshka__login.created = function () {
    if (typeof Accounts == "undefined") {
        alert('You need to add accounts-base and accounts-password.');
        window.location = "/";
    }
};

Template.matryoshka__login.events({
    "click .matryoshka__button--login, submit form": function ( e ) {

        // Prevent form submission
        e.preventDefault();

        var username = $('#username').val();
        var password = $('#password').val();

        Meteor.loginWithPassword(username, password, function (err, res) {
            if (err) console.log("Error logging in.");
            else Router.go('matryoshka');
        });

    },
    "click .matryoshka__button--create-user": function ( e ) {

        // Prevent form submission
        e.preventDefault();

        if (typeof Accounts == "undefined") throw new Error("Accounts not available");

        // Stop loggin in event.
        e.stopImmediatePropagation();

        var username = $('#username').val();
        var password = $('#password').val();

        Accounts.createUser({ username: username, password: password }, function (err, res) {
            if (err) console.log("Error creating account:", err);
            else Router.go('matryoshka');
        });

    }
});
