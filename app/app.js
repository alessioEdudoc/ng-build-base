'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'ui.bootstrap'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider
      .when('/test', {
        controller: 'TestCtrl',
        templateUrl: 'feat/layoutTools/tmpl/test.html'
      })
      .otherwise({redirectTo: '/view1'});
}]);
