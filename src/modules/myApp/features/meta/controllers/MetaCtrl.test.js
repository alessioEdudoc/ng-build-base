describe('TestCtrl', function () {
    'use strict';

    var scope;

    beforeEach(module('myApp'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();



        $controller('TestCtrl', {
            $scope: scope
        });
    }));


    it('should have a property "name"', function () {

        expect(scope.name).toBeDefined();

    });



});