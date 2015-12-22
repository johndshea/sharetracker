var app = angular.module('ShareTracker', []);

app.factory('stocks', ['$http', function($http) {
  var o = {
    stocks: []
  };

  // Retrieve all stocks from the database
  o.getAll = function() {
    return $http.get('/positions').success(function(stocks){

      //troubleshooting code
      stocks = ['AAPL', 'MSFT'];
      console.log(stocks);
      //troubleshooting code

      // REPLACE .AJAX WITH $HTTP SO AS TO ELIMINATE JQUERY? YQL DOESNT SEEM TO LIKE $HTTP THOUGH
      stocks.forEach(function(stock, i, array){
        console.log('$http starting for ' + stock);
        // $.ajax({
        //   type: 'GET',
      	// 	url: 'https://query.yahooapis.com/v1/public/yql?',
        //   data: {
        //     q: 'select * from yahoo.finance.quotes' +
        //     ' where symbol = "' + stock + '"',
        //     format: 'json',
        //     diagnostics: false,
        //     env: 'http://datatables.org/alltables.env'
        //   },
      	// 	async: true,
      	// })
        $http({
          method: 'GET',
          url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20%3D%20"' + stock + '"&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
        })
        .success(function(yahoo_response){
            stock = yahoo_response.query.results.quote;
            console.log(stock);
            o.stocks.push(stock);
          });
      });
    });
  };

  o.create = function(stock) {
    return $http.post('/stocks', stock, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      o.stocks.push(data);
    });
  };

  o.get = function(id) {
    return $http.get('/stocks/' + id).then(function(res){
      return res.data;
    });
  };

  return o;
}]);

// Main Controller
app.controller('MainController', ['stocks', function(stocks) {
  var controller = this;
  this.stocks = stocks.stocks;
  stocks.getAll();

  // this.addStock = function() {
  //   if(!controller.name || !controller.ticker || controller.name === ''|| controller.ticker === '') {
  //     console.log('name and ticker cannot be blank');
  //     return;
  //    }
  //  stocks.create({
  //    name: controller.name,
  //    ticker: controller.ticker,
  //    link: controller.link,
  //   });
  //   controller.name = '';
  //   controller.ticker = '';
  //   o.getAll();
  // };

}]);

// User Controller
app.controller('UserController', [function () {
  var controller = this;

  this.login = function () {
    alert('logging in');
  };

  // this.addStock = function() {
  //   if(!controller.name || !controller.ticker || controller.name === ''|| controller.ticker === '') {
  //     console.log('name and ticker cannot be blank');
  //     return;
  //    }
  //  stocks.create({
  //    name: controller.name,
  //    ticker: controller.ticker,
  //    link: controller.link,
  //   });
  //   controller.name = '';
  //   controller.ticker = '';
  //   o.getAll();
  // };

}]);
