
angular.module('myApp').directive('myCustomer', function($rootScope) {
	"use strict";

        return {
            'restrict': 'AE',
            templateUrl: 'my-customer.html'
        };
    });