Template.matryoshka__login.rendered = function () {

  // Focus on an input
  $('input[type="text"]').focus();

  // Check if there are any users currently!
  Meteor.call('matryoshka/users/checkUserCount', function (err, res) {
    // If there are none, show the create user button.
    if (res !== 0)
      return ;
    $('.matryoshka__button--create-user').show();
    $('.matryoshka__button--login').remove();
  });
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
      return Router.go('matryoshka__home');
    });

  },
  "click .matryoshka__button--create-user": function ( e ) {

    // Prevent form submission
    e.preventDefault();

    // Stop loggin in event.
    e.stopImmediatePropagation();

    var newUser = {
      username: $('#username').val(),
      password: $('#password').val()
    };

    Matryoshka.users.createUser( newUser, true, {
      onSuccess: function () {
        Router.go('matryoshka__home');
      },
      onError: function () {
        alert('err!');
      }
    });

  }
});
