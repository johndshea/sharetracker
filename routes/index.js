var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var currentUser = 'guest';

/* INDEX all stocks for a given user. */

router.get('/positions', function(req, res, next) {
  console.log("user is: ", currentUser.username, ", fetching positions.");
  User.findOne({ username: currentUser.username }, function (err, user) {
   if (err) { console.log("didn't work"); }
    if (!user) { console.log("user not found"); } else {
      res.json(user.positions);
      console.log("user found: ", user.username, "positions: ", user.positions);
    }
  });
});

/* POST a new stock to the database by containing the position object in req.body.new_position. */

router.post('/positions', auth, function(req, res, next) {
  User.findOne({ username: currentUser.username }, function (err, user) {

    // if there is an error, or user is not found, tell the console
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'no such user' });
    }

    // console.log(req.body);
    user.positions.push( req.body.new_position );
    console.log(req.body.new_position);

    // save the user back to the database
    user.save(function(err, saved_user){
      if(err){ return next(err); }
      // return the user's current positions post-save.
      res.json(saved_user.positions);
    });
  });
});

/* DELETE a single position from the database. */

router.delete('/positions/:position_id', auth, function(req, res, next) {
  User.findOne({ email: "john@test.com" }, function (err, user) {

    // if there is an error, or user is not found, tell the console
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'no such user' });
    }

    // console.log(req.body);
    user.positions.forEach(function(position,index,positions){
      if(position._id == req.params.position_id) {
        positions.splice(index, 1);
      }
    });

    // save the user back to the database
    user.save(function(err, saved_user){
      if(err){ return next(err); }
      // return the user's current positions post-save.
      res.json(saved_user.positions);
    });
  });
});

/* CREATE a new user in the database. */
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function (err){
    if(err){ return next(err); }

    console.log("user is: ", user);
    currentUser = user;
    return res.json({token: user.generateJWT()});
  });
});

/* LOG IN a user */

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      console.log("user is: ", user);
      currentUser = user;
      res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

/* LOG OUT a user */
router.delete('/login', function(req, res, next){
  currentUser = 'guest';
});

module.exports = router;
