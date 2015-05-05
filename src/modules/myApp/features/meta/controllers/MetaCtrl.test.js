describe('MetaCtrl', function () {
    'use strict';

    var scope;

    beforeEach(module('myApp'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();



        $controller('MetaCtrl', {
            $scope: scope
        });
    }));


    it('should have a property "name"', function () {

        expect(scope.name).toBeDefined();

    });

    it('should have a property "version"', function () {

        expect(scope.version).toBeDefined();

    });

    it('should have a property "description"', function () {

        expect(scope.description).toBeDefined();

    });

});