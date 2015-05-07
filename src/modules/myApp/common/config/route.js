/**
 * @ngdoc object
 * @name myApp.config:config1
 * @requires M
 *
 *
 * @description This is the demo application controller
 *
 * 
 */
angular.module('myApp').config(['$routeProvider', 'T', function($routeProvider, T) {
	"use strict";
	$routeProvider
		.when('/meta', {
			controller: 'MetaCtrl',
			templateUrl: T.MYAPP_META_TEMPL
		})
		.otherwise({redirectTo: '/meta'});
}]);