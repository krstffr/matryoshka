Template.matryoshka__login.rendered = function () {
  $('input[type="text"]').focus();
};

Template.matryoshka__login.events({
  "click .matryoshka__button--logout": function( e ) {

    // Prevent form submission
    e.preventDefault();

    Meteor.logout();

    Matryoshka.messages.add({ message: 'You\'re now logged out', type: 'success' });

  },
  "click .matryoshka__button--login, submit form": function ( e ) {

    // Prevent form submission
    e.preventDefault();

    var username = $('#username').val();
    var password = $('#password').val();

    Meteor.loginWithPassword(username, password, function (err, res) {
      if (err) {
        return Matryoshka.messages.add({ message: err.reason, type: 'error' });
      }
      Matryoshka.messages.add({ message: 'Logged in as '+username, type: 'success' });
      Router.go('matryoshka__home');
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

    if (!password || !username) {
      Matryoshka.messages.add({ message: 'Please enter a username and a password', type: 'error' });
    }

    Accounts.createUser({ username: username, password: password }, function (err, res) {
      if (err) {
        return Matryoshka.messages.add({ message: err.reason, type: 'error' });
      }
      Matryoshka.messages.add({ message: 'Created user: '+username, type: 'success' });
      Router.go('matryoshka__home');
    });

  }
});
