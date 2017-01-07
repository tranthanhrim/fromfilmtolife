'use strict';

filmApp.controller('accountController', function($scope, $http, $window, $state, $stateParams, FilmService) {
    var vm = this;
    vm.init = init;
    vm.myAccount = {};

    function init() {
        if (angular.isUndefined($window.localStorage['jwtToken']) || angular.isUndefined($window.localStorage['idUser'])) {
            $('#modalAlertMessage').text('Please login first!');
            $state.go('home');
            $('#smallModalAlert').modal();
        }
        var url = 'https://movie2016.herokuapp.com/api/v1/user?user-id='
        var config = {
            headers: {
                "x-access-token": $window.localStorage['jwtToken']
            }
        };
        var url = 'https://movie2016.herokuapp.com/api/v1/users?user-id=' + $window.localStorage['idUser'];
        $http.get(url, config).then(function(res) {
            if (res.data.success === true) {
                vm.myAccount = res.data.data;
                vm.myAccount.phone = vm.myAccount.phone === '' ? '-' : vm.myAccount.phone;
                vm.myAccount.birthday = vm.myAccount.birthday === '' ? '-' : vm.myAccount.birthday;
                vm.myAccount.address = vm.myAccount.address === '' ? '-' : vm.myAccount.address;
            }
        });
    };
});