var express      = require('express'),
    path         = require('path'),
    favicon      = require('serve-favicon'),
    logger       = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser   = require('body-parser'),
    mongoose     = require('mongoose'),
    passport     = require('passport'),
    /* set universal variables, required for Heroku to work */
    PORT         = process.env.PORT || 3000,
    MONGOURI     = process.env.MONGOLAB_URI || 'mongodb://localhost:27017',
    dbname       = "sharetracker";

require('./models/Users');
require('./config/passport');
mongoose.connect(MONGOURI + "/" + dbname);

var routes = require('./routes/index');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', routes);

module.exports = app;
