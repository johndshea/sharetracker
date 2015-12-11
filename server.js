var express        = require('express'),
    server         = express(),
    mongoose       = require('mongoose'),
    Schema         = mongoose.Schema,
    bodyParser     = require('body-parser'),
    methodOverride = require('method-override');

/************** User Schema ***************/
var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_digest: String,
  positions: [{
    symbol: String,
    purchase_date: Date,
    quantity: Number
  }]
});

var User = mongoose.model('User', userSchema);

mongoose.connect('mongodb://localhost:27017');

/************** Server **************/
server.use(express.static('public'));
server.use(bodyParser.urlencoded({
  extended: true
}));
server.use(bodyParser.json());
server.use(methodOverride('_method'));

server.use(function (req, res, next) {
  console.log("REQ.BODY", req.body);
  console.log("REQ.PARAMS", req.params);

  next();
});

server.listen(3000, function () {
  console.log("Up on port 3000");
});
