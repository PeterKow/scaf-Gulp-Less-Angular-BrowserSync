(function() {
    'use strict';

    angular
        .module('app.angular')
        .controller('myCont', MyCont);

    /* @ngInject */
    function MyCont($http, $rootScope) {
        var vm = this;
        vm.text = 'Hello';
    }

})();