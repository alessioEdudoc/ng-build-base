'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider
      .when('/test', {
        controller: 'TestCtrl',
        templateUrl: 'feat/featureA/tmpl/test.html'
      })
      .otherwise({redirectTo: '/test'});
}]);
