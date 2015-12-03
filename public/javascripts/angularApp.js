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
       auth.saveToken(data.token);
     });
   };

   // Log a user out
   auth.logOut = function(){
     $window.localStorage.removeItem('flapper-news-token');
   };

   return auth;
}])

// Factory Service for holding list of stocks in memory
.factory('stocks', ['$http', 'auth', function($http, auth) {
  var o = {
    stocks: []
  };

  // Retrieve all stocks from the database
  o.getAll = function() {
    return $http.get('/stocks').success(function(data){
      // Make Barchart API call for stock price
      var key = '11160ccd699a7a9e14a5426c1a42ba64';
      data.forEach(function(stock, i, array){
        var url = 'https://marketdata.websol.barchart.com/getQuote.jsonp?key=' +
        key + '&symbols=' + stock.ticker + ',';
        $.ajax({
          type: 'GET',
      		url: url,
      		async: true,
      		contentType: "application/json",
      		dataType: 'jsonp'
      	}).success(function(data){
            stock.price = data.results[0].lastPrice;
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
}])

// Main Controller for index and creation of stocks
.controller('MainController', ['stocks', 'auth', '$timeout', function(stocks, auth, $timeout) {
  var controller = this;
  this.stocks = stocks.stocks;
  this.isLoggedIn = auth.isLoggedIn;

  var updateDOM = $timeout(function(){this.stocks = stocks.stocks;}, 5000);

  this.addStock = function() {
    if(!controller.name || !controller.ticker || controller.name === ''|| controller.ticker === '') {
      console.log('name and ticker cannot be blank');
      return;
     }
   stocks.create({
     name: controller.name,
     ticker: controller.ticker,
     link: controller.link,
    });
    controller.name = '';
    controller.ticker = '';
    updateDOM();
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
