

/**
 * @ngdoc directive
 * @name myApp.directive:myCustomer
 * @requires M
 *
 *
 * @description This is the demo application controller
 *
 * 
 */
angular.module('myApp')

.directive('myCustomer', [ '$rootScope', function($rs) {
	"use strict";

        return {
            'restrict': 'AE',
            templateUrl: 'my-customer.html',
            priority : 100,

            scdpe : {
                one : 'sdsd',
                two : 'sdsds'
            }
        };
    }]);