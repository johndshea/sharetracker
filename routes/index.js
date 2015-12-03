var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');

var Stock = mongoose.model('Stock');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* INDEX all stocks on home page. */
router.get('/stocks', function(req, res, next) {
  Stock.find(function(err, stocks){
    if(err){ return next(err); }

    res.json(stocks);
  });
});

/* POST a new stock to the database. */
router.post('/stocks', auth, function(req, res, next) {
  var stock = new Stock(req.body);
  // added this on a whim - might not work
  stock.owner = req.payload.username;

  stock.save(function(err, stock){
    if(err){ return next(err); }

    res.json(stock);
  });
});

/* Pre-load stocks objects from the database. */
router.param('stock', function(req, res, next, id) {
  var query = Stock.findById(id);

  query.exec(function (err, stock){
    if (err) { return next(err); }
    if (!stock) { return next(new Error('can\'t find stock')); }

    req.stock = stock;
    return next();
  });
});

/* VIEW a single stock from the database. */
router.get('/stocks/:stock', function(req, res, next) {
  req.stock.populate('notes', function(err, stock) {
    if (err) { return next(err); }

    res.json(stock);
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

    return res.json({token: user.generateJWT()});
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;
