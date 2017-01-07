filmApp.controller('ticketController', function($scope, $http, $state, $window, $stateParams, FilmService) {
    var vm = this;
    vm.init = init;
    vm.myTickets = [];

    function init() {
        if (angular.isUndefined($window.localStorage['jwtToken']) || angular.isUndefined($window.localStorage['idUser'])) {
            $('#modalAlertMessage').text('Please login first!');
            $state.go('home');
            $('#smallModalAlert').modal();
        }
        if (angular.equals([], $stateParams.myTickets)) {
            $.ajax({
                type: 'POST',
                headers: {
                    "x-access-token": $window.localStorage['jwtToken']
                },
                url: 'https://movie2016.herokuapp.com/api/v1/tickets',
                data: {
                    'user-id': $window.localStorage['idUser'],
                },
                success: function(res) {
                    if (res.success === true) {
                        var myTickets = res.data;

                        myTickets.sort(function(a, b) {
                            var date1Split = a.date.split('/');
                            var date2Split = b.date.split('/');
                            var date1Str = date1Split[1] + '/' + date1Split[0] + '/' + date1Split[2];
                            var date2Str = date2Split[1] + '/' + date2Split[0] + '/' + date2Split[2];
                            var date1 = new Date(date1Str);
                            var date2 = new Date(date2Str);
                            if (date1 > date2) {
                                return true;
                            } else if (date1 < date2) {
                                return false;
                            } else {
                                return a.time > b.time;
                            }
                        });
                        $state.go('ticket', { myTickets: myTickets });
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    return;
                }
            });
        } else {
            vm.myTickets = $stateParams.myTickets;
        }
    }
});