(function() {
    'use strict';

    angular
        .module('app')
        .directive('exampleDirective', exampleDirective);

    /* @ngInject */
    function exampleDirective() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/angular/directiveExample.html'
        };

        return directive;
    }

})();