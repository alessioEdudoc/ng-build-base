angular.module('sampleDirective', [])
    .directive('myCustomer', function($rootScope) {
        return {
            restrict: 'AE',
            templateUrl: 'my-customer.html'
        };
    });