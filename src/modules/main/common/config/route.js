app.config(['$routeProvider', 'T', function($routeProvider, T) {
    "use strict";
    $routeProvider
        .when('/test', {
            controller: 'TestCtrl',
            templateUrl: T.main_featureA_template1
        })
        .otherwise({redirectTo: '/test'});
}]);