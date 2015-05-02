'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'templates',
  'ngRoute'
]).
config(['$routeProvider', 'T', function($routeProvider, T) {
  $routeProvider
      .when('/test', {
        controller: 'TestCtrl',
        templateUrl: T.featureA_test
      })
      .otherwise({redirectTo: '/test'});
}]);
