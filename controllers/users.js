var express = require('express'),
    router  = express.Router(),
    bcrypt  = require('bcrypt'),
    User    = require('../models/user.js');

// CREATE new user
router.post('/', function (req, res) {
  var userParams = req.body.user;

  if (!userParams.email) {
    req.session.flash.message = "Email cannot be empty.";
    res.redirect(302, '/users/new');
  } else if (!userParams.name) {
    req.session.flash.message = "Name cannot be empty.";
    res.redirect(302, '/users/new');
  } else if (!userParams.password) {
    req.session.flash.message = "Password cannot be empty.";
    res.redirect(302, '/users/new');
  } else if (!userParams.passwordVerification) {
    req.session.flash.message = "You have to verify. I know, I know...";
    res.redirect(302, '/users/new');
  } else if (passwordIsVerified(userParams)) {
    delete userParams.passwordVerification;

    User.findOne({ email: userParams.email }, function (err, user) {
      if (err) {
        console.log(err);
      } else if (user) {
        req.session.flash.message = "Email is already in use";
        res.redirect(302, '/users/new');
      } else {
        bcrypt.genSalt(10, function (saltErr, salt) {
          bcrypt.hash(userParams.password, salt, function (hashErr, hash) {
            var newUser = new User({
              email: userParams.email,
              name: userParams.name,
              passwordDigest: hash
            });

            newUser.save(function (saveErr, savedUser) {
              if (saveErr) {
                console.log(err);
              } else {
                req.session.userId = savedUser._id;
                req.session.userName = savedUser.name;
                console.log(req.session.userId, req.session.userName);
                // res.redirect(302, '/articles');
              }
            });
          });
        });
      }
    });
  } else {
    req.session.flash.message = "Password and verification must match.";
    res.redirect(302, '/users/new');
  }
});

function passwordIsVerified (userParams) {
  return !!userParams.password &&
         (userParams.password === userParams.passwordVerification);
}

// export router
module.exports = router;
