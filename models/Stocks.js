var mongoose = require('mongoose');

var StockSchema = new mongoose.Schema({
  ticker: String,
  // might have to remove this. Added it as an afterthought.
  owner: String,
});

mongoose.model('Stock', StockSchema);
