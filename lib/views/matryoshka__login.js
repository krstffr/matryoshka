Template.matryoshka__login.created = function () {
  Session.set('matryoshka__loginError', false);
};

Template.matryoshka__login.destroyed = function () {
  if (typeof Accounts == "undefined") {
    alert('You need to add accounts-base and accounts-password.');
    window.location = "/";
  }
};

Template.matryoshka__login.helpers({
  loginErrors: function () {
    return Session.get('matryoshka__loginError');
  }
});

Template.matryoshka__login.events({
  "click .matryoshka__button--logout": function( e ) {

    // Prevent form submission
    e.preventDefault();

    Meteor.logout();

  },
  "click .matryoshka__button--login, submit form": function ( e ) {

    // Prevent form submission
    e.preventDefault();

    var username = $('#username').val();
    var password = $('#password').val();

    Meteor.loginWithPassword(username, password, function (err, res) {
      if (err) {
        Session.set('matryoshka__loginError', err.reason);
      }
      else Router.go('matryoshka__home');
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
      Session.set('matryoshka__loginError', 'Please enter a username and a password');
    }

    Accounts.createUser({ username: username, password: password }, function (err, res) {
      if (err) {
        Session.set('matryoshka__loginError', err.reason);
      }
      else Router.go('matryoshka__home');
    });

  }
});
