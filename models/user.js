var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var userSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  passwordDigest: { type: String, required: true },
  positions: [{
    symbol: String,
    purchase_date: Date,
    quantity: Number
  }]
});

var User = mongoose.model('User', userSchema);

module.exports = User;
