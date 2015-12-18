var express = require('express'),
    session = require('express-session'),
    router  = express.Router(),
    bcrypt  = require('bcrypt'),
    User    = require('../models/user');

router.post('/', function (req, res) {
  var attempt = req.body.user;
  User.findOne({ email: attempt.email }, function (err, user) {
    if (err) {
      console.log(err);
    } else if (user) {
      bcrypt.compare(attempt.password, user.passwordDigest, function (compareError, match) {
        if (match) {
          req.session.userId = user._id;
          req.session.userName = user.name;
          console.log(req.session.userId, req.session.userName);
          // req.session.flash.message = "Thanks for signing in.";
        } else {
          req.session.flash.message = "Username and password combination not found";
          console.log(compareError);
        }
      });
    } else {
      req.session.flash.message = "There was an error of some kind";
    }
  });
});

router.delete('/', function (req, res) {
  delete req.session.userId;
  delete req.session.userName;
  req.session.flash.message = "Thanks for signing out.";
  res.redirect(302, '/');
});

module.exports = router;
