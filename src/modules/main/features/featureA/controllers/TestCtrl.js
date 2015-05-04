/*jshint strict: false */
/**
 * @ngdoc controller
 * @name myApp.controller:TestCtrl
 * @description This is the demo application controller
 */
angular.module('myApp').controller('TestCtrl',function($scope, M){

    $scope.name = M.name;
});