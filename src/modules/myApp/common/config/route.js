angular.module('myApp').config(['$routeProvider', 'T', function($routeProvider, T) {
    "use strict";
    $routeProvider
        .when('/meta', {
            controller: 'MetaCtrl',
            templateUrl: T.myApp_meta_templ
        })
        .otherwise({redirectTo: '/meta'});
}]);