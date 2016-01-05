var app = angular.module('StockTracker', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainController',
      resolve: {
        stockPromise: ['stocks', function(stocks){
        return stocks.getAll();
      }]
    }
  })

  .state('login', {
    url: '/login',
    templateUrl: '/login.html',
    controller: 'AuthCtrl',
    onEnter: ['$state', 'auth', function($state, auth){
      if(auth.isLoggedIn()){
        $state.go('home');
      }
    }]
  })
.state('register', {
  url: '/register',
  templateUrl: '/register.html',
  controller: 'AuthCtrl',
  onEnter: ['$state', 'auth', function($state, auth){
    if(auth.isLoggedIn()){
      $state.go('home');
    }
  }]
});

  $urlRouterProvider.otherwise('home');

}])

.factory('auth', ['$http', '$window', function($http, $window){
   var auth = {};

   auth.saveToken = function (token){
     $window.localStorage['stock-tracker-token'] = token;
   };

   auth.getToken = function (){
     return $window.localStorage['stock-tracker-token'];
   };

   auth.isLoggedIn = function(){
     var token = auth.getToken();

     if(token){
       var payload = JSON.parse($window.atob(token.split('.')[1]));

       return payload.exp > Date.now() / 1000;
     } else {
       return false;
     }
   };

   auth.currentUser = function(){
     if(auth.isLoggedIn()){
       var token = auth.getToken();
       var payload = JSON.parse($window.atob(token.split('.')[1]));

       return payload.username;
     }
   };

   // Register a new user
   auth.register = function(user){
     return $http.post('/register', user).success(function(data){
       auth.saveToken(data.token);
     });
   };

   // Log a user in
   auth.logIn = function(user){
     return $http.post('/login', user).success(function(data){
       console.log(user);
       auth.saveToken(data.token);
     });
   };

   // Log a user out
   auth.logOut = function(){
     console.log("trying to log out");
     $http.delete('/login');
     $window.localStorage.removeItem('stock-tracker-token');
   };

   return auth;
}])

// Factory Service for holding list of stocks in memory
.factory('stocks', ['$http', 'auth', function($http, auth) {
  var o = {
    stocks: []
  };

  // Retrieve all stocks from the database
  // rename STOCKS to POSITIONS later
  o.getAll = function() {
    return $http.get('/positions').success(function(stocks){
      stocks.forEach(function(stock, i, array){
        $.ajax({
          type: 'GET',
      		url: 'https://query.yahooapis.com/v1/public/yql?',
          data: {
            q: 'select * from yahoo.finance.quotes' +
            ' where symbol = "' + stock.ticker + '"',
            format: 'json',
            diagnostics: false,
            env: 'http://datatables.org/alltables.env'
          },
      		async: true,
      	}).success(function(yahoo_response){
            stock = yahoo_response.query.results.quote;
            console.log(stock);
            o.stocks.push(stock);
          });
      });
    });
  };

  o.create = function(new_position) {
    return $http.post('/positions', new_position, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data){
      // o.stocks.push(data);
    });
  };

  o.get = function(id) {
    return $http.get('/positions/' + id).then(function(res){
      return res.data;
    });
  };

  return o;
}])

// Main Controller for index and creation of stocks
.controller('MainController', ['stocks', 'auth', '$timeout', function(stocks, auth, $timeout) {
  var controller = this;
  this.stocks = stocks.stocks;
  this.isLoggedIn = auth.isLoggedIn;

  // var updateDOM = $timeout(function(){this.stocks = stocks.stocks;}, 5000);

  this.addStock = function() {
    if(!controller.ticker || controller.ticker === '') {
      console.log('ticker cannot be blank');
      return;
     }
   stocks.create({
    new_position: { purchase_date: controller.purchase_date,
       ticker: controller.ticker,
       quantity: controller.quantity }
  });
    controller.name = '';
    controller.ticker = '';
    // o.getAll();
  };

}])

// remove use of $scope here?
.controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}])

// Navbar controller - remove $scope references?
.controller('NavCtrl', [
'$scope',
'auth',
function($scope, auth){
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);
