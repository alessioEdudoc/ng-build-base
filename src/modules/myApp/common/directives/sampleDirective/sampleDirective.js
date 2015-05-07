
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
    }])


.directive('myCustomer2',function($rootScope2) {
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
    });