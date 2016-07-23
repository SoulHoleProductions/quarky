var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location) {
  $scope.go = function (target) {
    $location.path(target);
  };
});

myApp.controller('RootCtrl', function (auth, $scope) {
  $scope.auth = auth;
});

myApp.controller('LoginCtrl', function (auth, $scope) {
  $scope.auth = auth;

  $scope.login = function() {
    auth.signin({
      responseType: 'token'
    });
  }
});

myApp.controller('LogoutCtrl', function (auth, $window, store) {
  auth.signout();
  store.remove('profile');
  store.remove('token');
  $window.location.href = 'https://samples.auth0.com/v2/logout?returnTo=' + $window.location.origin + $window.location.pathname;
});

myApp.controller('SecureCtrl', function (auth, $window, store) {
  
});
