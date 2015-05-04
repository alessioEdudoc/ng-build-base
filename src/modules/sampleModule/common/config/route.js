angular.module('myApp').config(['$routeProvider', 'T', function($routeProvider, T) {
    "use strict";
    $routeProvider
        .when('/meta', {
            controller: 'MetaCtrl',
            templateUrl: T.sampleModule_meta_templ
        })
        .otherwise({redirectTo: '/meta'});
}]);