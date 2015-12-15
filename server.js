var express        = require('express'),
    server         = express(),
    mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override'),
    User           = require('../models/user'),
    /* required for Heroku to work */
    PORT           = process.env.PORT || 3000,
    MONGOURI       = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    dbname         = "sharetracker";

/************** Server Functions **************/
server.use(express.static('public'));

server.use(bodyParser.urlencoded({
  extended: true
}));

server.use(bodyParser.json());

server.use(methodOverride('_method'));

server.use(session({
   secret: "sharetracker",
   resave: false,
   saveUninitialized: true
 }));

server.use(function (req, res, next) {
  console.log("REQ.BODY", req.body);
  console.log("REQ.PARAMS", req.params);

  // Do these really need to be set every time a route is hit?
  // Perhaps I should move them so they are only set once or when changed.
  res.locals.userId = req.session.userId || "guest";
  res.locals.userName = req.session.userName || "Guest";

  next();
});

/************** CRUD controllers ***************/
server.use('/session', require('./controllers/session.js'));
server.use('/positions', require('./controllers/positions.js'));

/************** Start Everything Up **************/
mongoose.connect(MONGOURI + "/" + dbname);

server.listen(PORT, function () {
  console.log("Server is up on port ", PORT);
});
