filmApp.controller('seatController', function($scope, $window, $http, $state, $stateParams, FilmService) {
    var vm = this;
    vm.init = init;
    vm.bookTicket = bookTicket;
    vm.submitTicket = submitTicket;
    var scheduleCode = 'BFGJ0L';
    vm.scheduleInfo = {};
    var roomInfo = {
        row: 5,
        col: 10
    };
    var allSeat = [];
    var mapSeat = [];
    var listSeatBooked = [];
    var listSeatChoose = [];

    var price = 10; //price
    vm.messageAlert = '';

    function init() {
        if (angular.equals({}, $stateParams.scheduleInfo) || angular.equals({}, $stateParams.roomInfo)) {
            $state.go('film-showing');
        }
        vm.scheduleInfo = $stateParams.scheduleInfo;
        roomInfo = $stateParams.roomInfo;

        price = vm.scheduleInfo.price;
        var seatOfRow = new Array(roomInfo.col + 1).join('a');
        for (var i = 0; i < roomInfo.row; i++) {
            mapSeat.push(seatOfRow);
        }
        FilmService.getSeat(vm.scheduleInfo.code).then(function(data) {
            if (data.length === 0) {
                return;
            }
            // for (var )
            allSeat = data;
            _.each(allSeat, function(seat) {
                if (seat.flag_booked) {
                    var seatName = seat.seat_name;
                    var seatBooked = seatName.charAt(0).charCodeAt(0) - 64 + '_' + seatName.substring(1, seatName.length);
                    listSeatBooked.push(seatBooked);
                }
            });
            var $cart = $('#selected-seats'), //Sitting Area
                $counter = $('#counter'), //Votes
                $total = $('#total'); //Total money

            var sc = $('#seat-map').seatCharts({
                // map: [ //Seating chart
                //     'aaaaaaaaaa',
                //     'aaaaaaaaaa',
                //     '__________',
                //     'aaaaaaaa__',
                //     'aaaaaaaaaa',
                //     'aaaaaaaaaa',
                //     'aaaaaaaaaa',
                //     'aaaaaaaaaa',
                //     'aaaaaaaaaa',
                //     '__aaaaaa__'
                // ],
                map: mapSeat,
                naming: {
                    top: false,
                    getLabel: function(character, row, column) {
                        return column;
                    }
                },
                legend: { //Definition legend
                    node: $('#legend'),
                    items: [
                        ['a', 'available', 'Available'],
                        ['a', 'unavailable', 'Sold'],
                        ['a', 'selected', 'Selected']
                    ]
                },
                click: function() { //Click event
                    if (this.status() == 'available') { //optional seat
                        $('<li>Row' + (this.settings.row + 1) + ' Seat' + this.settings.label + '</li>')
                            .attr('id', 'cart-item-' + this.settings.id)
                            .data('seatId', this.settings.id)
                            .appendTo($cart);

                        $counter.text(sc.find('selected').length + 1);
                        $total.text(recalculateTotal(sc) + price);
                        // var seatCode = '';
                        // $.when(seatCode = convertIntToSeatCode(this.settings.row, this.settings.column + 1))
                        //     .then(function() {
                        //         listSeatChoose.push(seatCode);
                        //     })
                        var seatRow = this.settings.row + 65;
                        var seatCol = this.settings.column + 1;
                        var seatName = String.fromCharCode(seatRow) + seatCol;
                        _.each(allSeat, function(seat) {
                            if (seat.seat_name === seatName) {
                                listSeatChoose.push(seat.seat_code);
                                return true;
                            }
                        });

                        return 'selected';
                    } else if (this.status() == 'selected') { //Checked
                        //Update Number
                        $counter.text(sc.find('selected').length - 1);
                        //update totalnum
                        $total.text(recalculateTotal(sc) - price);

                        //Delete reservation
                        $('#cart-item-' + this.settings.id).remove();

                        var seatRow = this.settings.row + 65;
                        var seatCol = this.settings.column + 1;
                        var seatName = String.fromCharCode(seatRow) + seatCol;
                        _.each(allSeat, function(seat) {
                            if (seat.seat_name === seatName) {
                                listSeatChoose = _.without(listSeatChoose, seat.seat_code);
                                return true;
                            }
                        });

                        //optional
                        return 'available';
                    } else if (this.status() == 'unavailable') { //sold
                        return 'unavailable';
                    } else {
                        return this.style();
                    }
                }
            });
            //sold seat
            // sc.get(['1_2', '4_4', '4_5', '6_6', '6_7', '8_5', '8_6', '8_7', '8_8', '10_1', '10_2']).status('unavailable');
            sc.get(listSeatBooked).status('unavailable');
        });
    }

    function recalculateTotal(sc) {
        var total = 0;
        sc.find('selected').each(function() {
            total += price;
        });

        return total;
    }

    function convertIntToSeatCode(row, col) {
        var seatName = String.fromCharCode(row + 65) + col;
        _.each(allSeat, function(seat) {
            if (seat.seat_name === seatName) {
                return seat.seat_code;
            }
        });
    }

    var bookingCode = '';

    function bookTicket() {
        if (angular.isUndefined($window.localStorage['jwtToken']) || angular.isUndefined($window.localStorage['idUser'])) {
            vm.messageAlert = 'Please login first!';
            $('#modalAlert').modal();
        } else {
            if (listSeatChoose.length === 0) {
                $('#modalAlertMessage').text('Please choose at least one seat!');
                $('#smallModalAlert').modal();
                return;
            }
            $('#loading').show();
            var dataListSeat = [];
            _.each(listSeatChoose, function(item) {
                var obj = {
                    'code': angular.copy(item),
                    'price': vm.scheduleInfo.price
                };
                dataListSeat.push(obj);
            });
            $.ajax({
                type: 'PUT',
                headers: {
                    "x-access-token": $window.localStorage['jwtToken']
                },
                url: 'https://movie2016.herokuapp.com' + '/api/v1/seats',
                data: {
                    'id-user': $window.localStorage['idUser'],
                    'schedule-code': vm.scheduleInfo.code,
                    'seats': dataListSeat
                },
                success: function(data) {
                    if (data.success === true) {
                        bookingCode = data.booking_code;
                        $('#loading').hide();
                        $('#modalSubmitTicket').modal();
                    }

                    // vm.messageAlert = 'Book ticket success!';
                    // $('#modalAlert').modal();
                    // $state.go('film-showing');
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    return;
                }
            });
        }
    }

    function submitTicket() {
        $.ajax({
            type: 'PUT',
            headers: {
                "x-access-token": $window.localStorage['jwtToken']
            },
            url: 'https://movie2016.herokuapp.com' + '/api/v1/ticket-submition',
            data: {
                'booking-code': bookingCode,
                // 'booking-code': 'S7WC0XX8',
                'id-user': $window.localStorage['idUser']
            },
            success: function(data) {
                $('#modalSubmitTicket').modal('hide');
                setTimeout(function() {
                    $state.go('film-showing');
                }, 200);

                if (data.success === true) {
                    $('#modalAlertMessage').text('Your ticket has been successfully booked!');
                } else {
                    $('#modalAlertMessage').text('Session Timeout!');
                }
                setTimeout(function() {
                    $('#smallModalAlert').modal();
                }, 500);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                return;
            }
        });
    }

    // function submitTicket() {}
});