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
filmApp.controller('detailFilmController', function($scope, $http, $state, $stateParams, FilmService) {
    var vm = this;
    vm.init = init;
    vm.film = {};
    vm.showTrailer = showTrailer;
    vm.hideTrailer = hideTrailer;
    vm.showModalSchedule = showModalSchedule;
    vm.showDetailFilm = showDetailFilm;
    vm.changeCityShowSchedule = changeCityShowSchedule;
    vm.changeDateShowSchedule = changeDateShowSchedule;
    vm.bookTicket = bookTicket;
    vm.changeFormatFilm = changeFormatFilm;
    vm.films = [];
    vm.theaters = [];
    var linkAPI = '';
    vm.filmSchedule = [];
    vm.scheduleToShow = {
        'date': [],
        'schedule': []
    };
    vm.typeOfFilm = [{
        'id': 'AAA',
        'name': '2D Digital'
    }, {
        'id': 'BBB',
        'name': '3D'
    }, {
        'id': 'CCC',
        'name': 'IMax'
    }];
    var typeOfFilmId = [];
    var formatFilmCurrent = '';

    //use this array to access schedule choose faster
    var tempSchedule = [];

    var theaters = []; //Theaters include city and city code

    var daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    var DetailSchedule = function() {
        return {
            'code': '',
            'time': '',
            'theaterCode': '',
            'theaterName': ''
        }
    };

    vm.nameFilmBooking = '';
    var scheduleConverted = [];
    var lstCityCode = [];
    var scheduleAllDay = [];

    function init() {
        if (angular.equals({}, $stateParams.film)) {
            $state.go('film-showing');
        }
        vm.film = $stateParams.film;
        $('#liHome').removeClass('active');
        $('#liMovies').addClass('active');
        $('#liTheater').removeClass('active');
        $('#loading').hide();
        FilmService.getFilm($stateParams.loadType).then(function(data) {
            vm.films = data;
        });
        FilmService.getTheater().then(function(data) {
            vm.theaters = data;
            theaters = data;
        });
    }

    function showTrailer() {
        $('#ifTrailer').attr('src', vm.film.trailer);
        $('#modalTrailer').modal();
    }

    function hideTrailer() {
        $('#ifTrailer').attr('src', '');
    }

    function showModalSchedule(filmName, filmCode) {
        $('#loading').show();
        vm.nameFilmBooking = filmName;
        var url = 'https://movie2016.herokuapp.com' + '/api/v1/schedules?movie-code=' + filmCode;
        $http.get(url).then(function(res) {
            var flagDataNotNull = false;
            _.each(res.data.data, function(itemData) {
                if (!angular.equals([], itemData.data)) {
                    flagDataNotNull = true;
                    return;
                }
            });
            if (!flagDataNotNull) {
                $('#loading').hide();
                setTimeout(function() {
                    $('#modalAlertMessage').text('Schedule film not found!');
                    $('#smallModalAlert').modal();
                }, 200);
                return;
            }

            lstCityCode.length = 0;
            scheduleConverted.length = 0;
            scheduleAllDay.length = 0;
            vm.filmSchedule.length = 0;
            vm.typeOfFilm.length = 0;
            typeOfFilmId.length = 0;
            var obj = {
                'cityName': 'Ho Chi Minh',
                'cityCode': 'HCM',
                'schedule': []
            };
            _.each(res.data.data, function(itemData) { //data of each date
                if (itemData !== null) {
                    // var obj = new objSchedule();

                    _.forEach(scheduleConverted, function(itemScheduleConverted) {
                        if (itemScheduleConverted !== null && itemScheduleConverted.schedule !== null) {
                            itemScheduleConverted.schedule.length = 0;
                        }
                    });

                    //get Theaters of each date
                    var lstTheaters = [];
                    _.each(itemData.data, function(dataEachDate) {
                        if (_.findWhere(lstTheaters, dataEachDate.theater_code) == null) {
                            lstTheaters.push(dataEachDate.theater_code);
                        }
                    });

                    //create instance data of each theater
                    _.each(lstTheaters, function(item) {
                        var tmp = {
                            'theaterCode': '',
                            'theaterName': '',
                            'AAA': [], //2D
                            'BBB': [], //3D
                            'CCC': [] //3D Imax
                        }
                        tmp.theaterCode = item;
                        // find Theater Name
                        _.each(theaters, function(theater) {
                            _.each(theater.theaters, function(itemTheater) {
                                if (tmp.theaterCode === itemTheater.code) {
                                    tmp.theaterName = itemTheater.name;

                                    if (_.findWhere(lstCityCode, theater.city_code) == null) {
                                        // lstTheaters.push(dataEachDate.theater_code);
                                        lstCityCode.push(theater.city_code);
                                        var tmp3 = {
                                            'cityName': theater.city_name,
                                            'cityCode': theater.city_code,
                                            'schedule': []
                                        };
                                        var tmp4 = {
                                            'theaterCode': itemTheater.code,
                                            'theaterName': itemTheater.name,
                                            'AAA': [], //2D
                                            'BBB': [], //3D
                                            'CCC': [] //3D Imax
                                        };
                                        tmp3.schedule.push(tmp4);
                                        scheduleConverted.push(tmp3);
                                        vm.filmSchedule.push(angular.copy(tmp3));
                                    } else {
                                        var tmp4 = {
                                            'theaterCode': itemTheater.code,
                                            'theaterName': itemTheater.name,
                                            'AAA': [], //2D
                                            'BBB': [], //3D
                                            'CCC': [] //3D Imax
                                        };
                                        for (var i = 0; i < scheduleConverted.length; i++) {
                                            if (scheduleConverted[i].cityCode === theater.city_code) {
                                                scheduleConverted[i].schedule.push(tmp4);
                                                break;
                                            }
                                        }
                                    }
                                    return;
                                }
                                if (tmp.theaterName !== '') {
                                    return;
                                }
                            });
                        });
                        // vm.filmSchedule = scheduleConverted;
                        // objSchedule.data.push(tmp);
                    });

                    // get Schedule of each date (group by theater)
                    _.each(itemData.data, function(dataEachDate) {
                        for (var i = 0; i < scheduleConverted.length; i++) {
                            var match = _.find(scheduleConverted[i].schedule, function(item) {
                                return item.theaterCode === dataEachDate.theater_code;
                            });
                            if (match) {
                                var tmp5 = {
                                    'code': dataEachDate.code,
                                    'time': dataEachDate.time,
                                    'price': dataEachDate.prices[0].price,
                                    'filmName': dataEachDate.film_name,
                                    'date': itemData.date.value,
                                    'period': '',
                                    'roomCode': dataEachDate.room_code
                                };
                                var timeSplit = dataEachDate.time.split(':');
                                tmp5.period = parseInt(timeSplit[0]) < 12 ? 'AM' : 'PM';

                                if (dataEachDate.prices[0].version_code === 'AAA') {
                                    match.AAA.push(tmp5);
                                } else if (dataEachDate.prices[0].version_code === 'BBB') {
                                    match.BBB.push(tmp5);
                                } else {
                                    match.CCC.push(tmp5);
                                }
                                // break;
                            }
                            if (_.findWhere(vm.typeOfFilm, { id: dataEachDate.prices[0].version_code }) == null) {
                                var tmp6 = {
                                    'id': dataEachDate.prices[0].version_code,
                                    'name': dataEachDate.prices[0].version_name
                                };
                                vm.typeOfFilm.push(angular.copy(tmp6));
                            }
                            // if (_.findWhere(typeOfFilmId, dataEachDate.prices[0].version_code) == null) {
                            //     typeOfFilmId.push(dataEachDate.prices[0].version_code);
                            //     var tmp6 = {
                            //         'id': dataEachDate.prices[0].version_code,
                            //         'name': dataEachDate.prices[0].version_name
                            //     };
                            //     vm.typeOfFilm.push(angular.copy(tmp6));
                            // }
                        }
                    });

                    //Wrong if there's have more than 1 city
                    _.each(scheduleConverted, function(itemScheduleConverted) {
                        var objSchedule = {
                            'cityCode': itemScheduleConverted.cityCode,
                            'date': itemData.date.value,
                            'data': angular.copy(itemScheduleConverted.schedule)
                        };

                        scheduleAllDay.push(angular.copy(objSchedule));
                    });
                }
            });

            for (var i = 0; i < vm.filmSchedule.length; i++) {
                vm.filmSchedule[i].schedule.length = 0;
                for (var j = 0; j < scheduleAllDay.length; j++) {
                    if (vm.filmSchedule[i].cityCode === scheduleAllDay[j].cityCode) {
                        vm.filmSchedule[i].schedule.push(scheduleAllDay[j]);
                    }
                }
            }

            //Sort by date
            _.forEach(vm.filmSchedule, function(itemFilmSchedule) {
                itemFilmSchedule.schedule.sort(function(a, b) {
                    var date1Split = a.date.split('/');
                    var date2Split = b.date.split('/');
                    var date1Str = date1Split[1] + '/' + date1Split[0] + '/' + date1Split[2];
                    var date2Str = date2Split[1] + '/' + date2Split[0] + '/' + date2Split[2];
                    var date1 = new Date(date1Str);
                    var date2 = new Date(date2Str);
                    return date1 > date2;
                });
            });

            //Sort by time
            _.forEach(vm.filmSchedule, function(itemFilmSchedule) {
                _.forEach(itemFilmSchedule.schedule, function(schedule) {
                    _.forEach(schedule.data, function(dataSchedule) {
                        _.each(vm.typeOfFilm, function(itemTypeOfFilm) {
                            dataSchedule[itemTypeOfFilm.id].sort(function(a, b) {
                                return a.time > b.time;
                            });
                        });
                    });
                });
            });


            formatFilmCurrent = vm.typeOfFilm[0].id;
            changeCityShowSchedule(vm.filmSchedule[0].cityCode);
            changeDateShowSchedule(vm.filmSchedule[0].schedule[0].date, 0);
            $('#loading').hide();
            $('#modalBooking').modal();
        });
    }

    function showDetailFilm(data) {
        $state.go('detail-film', { film: data });
    }

    function getAllTheater() {
        var url = linkAPI + '/api/v1/theaters';
        $http.get(url).then(function(res) {
            theaters = res.data.data;
        });
    }

    function changeCityShowSchedule(cityCode) {
        vm.scheduleToShow.date.length = 0;
        vm.scheduleToShow.schedule.length = 0;
        tempSchedule.length = 0;

        _.each(vm.filmSchedule, function(itemFilmSchedule) {
            if (cityCode === itemFilmSchedule.cityCode) {

                tempSchedule = angular.copy(itemFilmSchedule.schedule);

                _.each(itemFilmSchedule.schedule, function(itemSchedule) {
                    var detailDate = {
                        'rawDate': '',
                        'dayOfWeek': 'Mon',
                        'day': '',
                        'month': ''
                    }
                    detailDate.rawDate = itemSchedule.date;
                    detailDate.day = itemSchedule.date.substring(0, itemSchedule.date.indexOf('/'));
                    detailDate.month = itemSchedule.date.substring(itemSchedule.date.indexOf('/') + 1, itemSchedule.date.lastIndexOf('/'));
                    var dateSplit = itemSchedule.date.split('/');
                    var dateStr = dateSplit[1] + '/' + dateSplit[0] + '/' + dateSplit[2];
                    detailDate.dayOfWeek = daysOfWeek[(new Date(dateStr)).getDay()];
                    vm.scheduleToShow.date.push(detailDate);
                })
            }
        });
        changeDateShowSchedule(vm.scheduleToShow.date[0].rawDate, 0);
    }

    function changeDateShowSchedule(date, dateId) {
        vm.scheduleToShow.schedule.length = 0;
        vm.dateIdSelected = dateId;
        _.each(tempSchedule, function(itemTempSchedule) {
            if (date === itemTempSchedule.date) {
                _.each(itemTempSchedule.data, function(data) {
                    var obj = {
                        'theaterCode': '',
                        'theaterName': '',
                        'time': []
                    };
                    obj.theaterCode = data.theaterCode;
                    obj.theaterName = data.theaterName;
                    obj.time = data[formatFilmCurrent];
                    vm.scheduleToShow.schedule.push(obj);
                });
            }
        });
    }

    function bookTicket(scheduleInfo) {

        $('#modalBooking').modal('hide');
        var roomInfo = {
            'row': -1,
            'col': -1,
        }
        _.each(theaters, function(itemTheater) {
            _.each(itemTheater.theaters, function(detailTheater) {
                _.each(detailTheater.rooms, function(room) {
                    if (room.code === scheduleInfo.roomCode) {
                        roomInfo.row = roomInfo.row === -1 ? room.number_row : roomInfo.row;
                        roomInfo.col = roomInfo.col === -1 ? room.number_col : roomInfo.col;
                        return;
                    }
                });
            });
        });
        setTimeout(function() {
            $state.go('seat', { scheduleInfo: scheduleInfo, roomInfo: roomInfo });
        }, 500);
        // $state.go('seat', { scheduleInfo: scheduleInfo });
    }

    function changeFormatFilm(id) {
        formatFilmCurrent = id;
        changeCityShowSchedule(vm.filmSchedule[0].cityCode);
        changeDateShowSchedule(vm.filmSchedule[0].schedule[0].date, 0);
    }

    vm.activeFormatFilm = activeFormatFilm;

    function activeFormatFilm(index, idFormat) {
        return vm.typeOfFilm[index].id === idFormat;
    }


});
'use strict';

filmApp.controller('filmController', function($scope, $http, $state, $stateParams, FilmService) {
    var vm = this;
    vm.init = init;
    vm.showModalSchedule = showModalSchedule;
    vm.showDetailFilm = showDetailFilm;
    vm.changeCityShowSchedule = changeCityShowSchedule;
    vm.changeDateShowSchedule = changeDateShowSchedule;
    vm.bookTicket = bookTicket;
    vm.changeFormatFilm = changeFormatFilm;
    vm.films = [];
    vm.theaters = [];
    var linkAPI = '';
    vm.filmSchedule = [];
    // vm.filmSchedule = [{
    //     'city': 'Tp Hồ Chí Minh',
    //     'cityCode': 'HCM',
    //     'schedule': [{
    //         'date': '30/12/2016',
    //         'data': [{
    //             'theaterCode': '',
    //             'theaterName': 'CGV Hùng Vương Plaza',
    //             '_2D': [{
    //                 'code': '',
    //                 'time': '11:40'
    //             }, {
    //                 'code': '',
    //                 'time': '12:25'
    //             }, {
    //                 'code': '',
    //                 'time': '13:55'
    //             }],
    //             '3Di': [{
    //                 'code': '',
    //                 'time': '11:40'
    //             }, {
    //                 'code': '',
    //                 'time': '15:25'
    //             }]
    //         }]
    //     }]
    // }];
    vm.scheduleToShow = {
        'date': [],
        'schedule': []
    };
    vm.typeOfFilm = [{
        'id': 'AAA',
        'name': '2D Digital'
    }, {
        'id': 'BBB',
        'name': '3D'
    }, {
        'id': 'CCC',
        'name': 'IMax'
    }];
    var typeOfFilmId = [];
    var formatFilmCurrent = '';

    //use this array to access schedule choose faster
    var tempSchedule = [];

    var theaters = []; //Theaters include city and city code

    var daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function init() {
        $('#liHome').removeClass('active');
        $('#liMovies').addClass('active');
        $('#liTheater').removeClass('active');
        $('#loading').hide();
        FilmService.getFilm($stateParams.loadType).then(function(data) {
            vm.films = data;
        });
        FilmService.getTheater().then(function(data) {
            vm.theaters = data;
            theaters = data;
        });
        // getAllTheater();
    };

    var DetailSchedule = function() {
        return {
            'code': '',
            'time': '',
            'theaterCode': '',
            'theaterName': ''
        }
    }

    vm.nameFilmBooking = '';
    var scheduleConverted = [];
    var lstCityCode = [];
    var scheduleAllDay = [];

    function showModalSchedule(filmName, filmCode) {
        $('#loading').show();
        vm.nameFilmBooking = filmName;
        var url = 'https://movie2016.herokuapp.com' + '/api/v1/schedules?movie-code=' + filmCode;
        $http.get(url).then(function(res) {
            var flagDataNotNull = false;
            _.each(res.data.data, function(itemData) {
                if (!angular.equals([], itemData.data)) {
                    flagDataNotNull = true;
                    return;
                }
            });
            if (!flagDataNotNull) {
                $('#loading').hide();
                setTimeout(function() {
                    $('#modalAlertMessage').text('Schedule film not found!');
                    $('#smallModalAlert').modal();
                }, 200);
                return;
            }

            lstCityCode.length = 0;
            scheduleConverted.length = 0;
            scheduleAllDay.length = 0;
            vm.filmSchedule.length = 0;
            vm.typeOfFilm.length = 0;
            typeOfFilmId.length = 0;
            var obj = {
                'cityName': 'Ho Chi Minh',
                'cityCode': 'HCM',
                'schedule': []
            };
            _.each(res.data.data, function(itemData) { //data of each date
                if (itemData !== null) {
                    // var obj = new objSchedule();

                    _.forEach(scheduleConverted, function(itemScheduleConverted) {
                        if (itemScheduleConverted !== null && itemScheduleConverted.schedule !== null) {
                            itemScheduleConverted.schedule.length = 0;
                        }
                    });

                    //get Theaters of each date
                    var lstTheaters = [];
                    _.each(itemData.data, function(dataEachDate) {
                        if (_.findWhere(lstTheaters, dataEachDate.theater_code) == null) {
                            lstTheaters.push(dataEachDate.theater_code);
                        }
                    });

                    //create instance data of each theater
                    _.each(lstTheaters, function(item) {
                        var tmp = {
                            'theaterCode': '',
                            'theaterName': '',
                            'AAA': [], //2D
                            'BBB': [], //3D
                            'CCC': [] //3D Imax
                        }
                        tmp.theaterCode = item;
                        // find Theater Name
                        _.each(theaters, function(theater) {
                            _.each(theater.theaters, function(itemTheater) {
                                if (tmp.theaterCode === itemTheater.code) {
                                    tmp.theaterName = itemTheater.name;

                                    if (_.findWhere(lstCityCode, theater.city_code) == null) {
                                        // lstTheaters.push(dataEachDate.theater_code);
                                        lstCityCode.push(theater.city_code);
                                        var tmp3 = {
                                            'cityName': theater.city_name,
                                            'cityCode': theater.city_code,
                                            'schedule': []
                                        };
                                        var tmp4 = {
                                            'theaterCode': itemTheater.code,
                                            'theaterName': itemTheater.name,
                                            'AAA': [], //2D
                                            'BBB': [], //3D
                                            'CCC': [] //3D Imax
                                        };
                                        tmp3.schedule.push(tmp4);
                                        scheduleConverted.push(tmp3);
                                        vm.filmSchedule.push(angular.copy(tmp3));
                                    } else {
                                        var tmp4 = {
                                            'theaterCode': itemTheater.code,
                                            'theaterName': itemTheater.name,
                                            'AAA': [], //2D
                                            'BBB': [], //3D
                                            'CCC': [] //3D Imax
                                        };
                                        for (var i = 0; i < scheduleConverted.length; i++) {
                                            if (scheduleConverted[i].cityCode === theater.city_code) {
                                                scheduleConverted[i].schedule.push(tmp4);
                                                break;
                                            }
                                        }
                                    }
                                    return;
                                }
                                if (tmp.theaterName !== '') {
                                    return;
                                }
                            });
                        });
                        // vm.filmSchedule = scheduleConverted;
                        // objSchedule.data.push(tmp);
                    });

                    // get Schedule of each date (group by theater)
                    _.each(itemData.data, function(dataEachDate) {
                        for (var i = 0; i < scheduleConverted.length; i++) {
                            var match = _.find(scheduleConverted[i].schedule, function(item) {
                                return item.theaterCode === dataEachDate.theater_code;
                            });
                            if (match) {
                                var tmp5 = {
                                    'code': dataEachDate.code,
                                    'time': dataEachDate.time,
                                    'price': dataEachDate.prices[0].price,
                                    'filmName': dataEachDate.film_name,
                                    'date': itemData.date.value,
                                    'period': '',
                                    'roomCode': dataEachDate.room_code
                                };
                                var timeSplit = dataEachDate.time.split(':');
                                tmp5.period = parseInt(timeSplit[0]) < 12 ? 'AM' : 'PM';

                                if (dataEachDate.prices[0].version_code === 'AAA') {
                                    match.AAA.push(tmp5);
                                } else if (dataEachDate.prices[0].version_code === 'BBB') {
                                    match.BBB.push(tmp5);
                                } else {
                                    match.CCC.push(tmp5);
                                }
                                // break;
                            }
                            if (_.findWhere(vm.typeOfFilm, { id: dataEachDate.prices[0].version_code }) == null) {
                                var tmp6 = {
                                    'id': dataEachDate.prices[0].version_code,
                                    'name': dataEachDate.prices[0].version_name
                                };
                                vm.typeOfFilm.push(angular.copy(tmp6));
                            }
                            // if (_.findWhere(typeOfFilmId, dataEachDate.prices[0].version_code) == null) {
                            //     typeOfFilmId.push(dataEachDate.prices[0].version_code);
                            //     var tmp6 = {
                            //         'id': dataEachDate.prices[0].version_code,
                            //         'name': dataEachDate.prices[0].version_name
                            //     };
                            //     vm.typeOfFilm.push(angular.copy(tmp6));
                            // }
                        }
                    });

                    //Wrong if there's have more than 1 city
                    _.each(scheduleConverted, function(itemScheduleConverted) {
                        var objSchedule = {
                            'cityCode': itemScheduleConverted.cityCode,
                            'date': itemData.date.value,
                            'data': angular.copy(itemScheduleConverted.schedule)
                        };

                        scheduleAllDay.push(angular.copy(objSchedule));
                    });
                }
            });

            for (var i = 0; i < vm.filmSchedule.length; i++) {
                vm.filmSchedule[i].schedule.length = 0;
                for (var j = 0; j < scheduleAllDay.length; j++) {
                    if (vm.filmSchedule[i].cityCode === scheduleAllDay[j].cityCode) {
                        vm.filmSchedule[i].schedule.push(scheduleAllDay[j]);
                    }
                }
            }

            //Sort by date
            _.forEach(vm.filmSchedule, function(itemFilmSchedule) {
                itemFilmSchedule.schedule.sort(function(a, b) {
                    var date1Split = a.date.split('/');
                    var date2Split = b.date.split('/');
                    var date1Str = date1Split[1] + '/' + date1Split[0] + '/' + date1Split[2];
                    var date2Str = date2Split[1] + '/' + date2Split[0] + '/' + date2Split[2];
                    var date1 = new Date(date1Str);
                    var date2 = new Date(date2Str);
                    return date1 > date2;
                });
            });

            //Sort by time
            _.forEach(vm.filmSchedule, function(itemFilmSchedule) {
                _.forEach(itemFilmSchedule.schedule, function(schedule) {
                    _.forEach(schedule.data, function(dataSchedule) {
                        _.each(vm.typeOfFilm, function(itemTypeOfFilm) {
                            dataSchedule[itemTypeOfFilm.id].sort(function(a, b) {
                                return a.time > b.time;
                            });
                        });
                    });
                });
            });


            formatFilmCurrent = vm.typeOfFilm[0].id;
            changeCityShowSchedule(vm.filmSchedule[0].cityCode);
            changeDateShowSchedule(vm.filmSchedule[0].schedule[0].date, 0);
            $('#loading').hide();
            $('#modalBooking').modal();
        });
    }

    function showDetailFilm(data) {
        $state.go('detail-film', { film: data });
    }

    function getAllTheater() {
        var url = linkAPI + '/api/v1/theaters';
        $http.get(url).then(function(res) {
            theaters = res.data.data;
        });
    }

    function changeCityShowSchedule(cityCode) {
        vm.scheduleToShow.date.length = 0;
        vm.scheduleToShow.schedule.length = 0;
        tempSchedule.length = 0;

        _.each(vm.filmSchedule, function(itemFilmSchedule) {
            if (cityCode === itemFilmSchedule.cityCode) {

                tempSchedule = angular.copy(itemFilmSchedule.schedule);

                _.each(itemFilmSchedule.schedule, function(itemSchedule) {
                    var detailDate = {
                        'rawDate': '',
                        'dayOfWeek': 'Mon',
                        'day': '',
                        'month': ''
                    }
                    detailDate.rawDate = itemSchedule.date;
                    detailDate.day = itemSchedule.date.substring(0, itemSchedule.date.indexOf('/'));
                    detailDate.month = itemSchedule.date.substring(itemSchedule.date.indexOf('/') + 1, itemSchedule.date.lastIndexOf('/'));
                    var dateSplit = itemSchedule.date.split('/');
                    var dateStr = dateSplit[1] + '/' + dateSplit[0] + '/' + dateSplit[2];
                    detailDate.dayOfWeek = daysOfWeek[(new Date(dateStr)).getDay()];
                    vm.scheduleToShow.date.push(detailDate);
                })
            }
        });
        changeDateShowSchedule(vm.scheduleToShow.date[0].rawDate, 0);
    }

    function changeDateShowSchedule(date, dateId) {
        vm.scheduleToShow.schedule.length = 0;
        vm.dateIdSelected = dateId;
        _.each(tempSchedule, function(itemTempSchedule) {
            if (date === itemTempSchedule.date) {
                _.each(itemTempSchedule.data, function(data) {
                    var obj = {
                        'theaterCode': '',
                        'theaterName': '',
                        'time': []
                    };
                    obj.theaterCode = data.theaterCode;
                    obj.theaterName = data.theaterName;
                    obj.time = data[formatFilmCurrent];
                    vm.scheduleToShow.schedule.push(obj);
                });
            }
        });
    }

    function bookTicket(scheduleInfo) {

        $('#modalBooking').modal('hide');
        var roomInfo = {
            'row': -1,
            'col': -1,
        }
        _.each(theaters, function(itemTheater) {
            _.each(itemTheater.theaters, function(detailTheater) {
                _.each(detailTheater.rooms, function(room) {
                    if (room.code === scheduleInfo.roomCode) {
                        roomInfo.row = roomInfo.row === -1 ? room.number_row : roomInfo.row;
                        roomInfo.col = roomInfo.col === -1 ? room.number_col : roomInfo.col;
                        return;
                    }
                });
            });
        });
        setTimeout(function() {
            $state.go('seat', { scheduleInfo: scheduleInfo, roomInfo: roomInfo });
        }, 500);
        // $state.go('seat', { scheduleInfo: scheduleInfo });
    }

    function changeFormatFilm(id) {
        formatFilmCurrent = id;
        changeCityShowSchedule(vm.filmSchedule[0].cityCode);
        changeDateShowSchedule(vm.filmSchedule[0].schedule[0].date, 0);
    }

    vm.activeFormatFilm = activeFormatFilm;

    function activeFormatFilm(index, idFormat) {
        return vm.typeOfFilm[index].id === idFormat;
    }
});
filmApp.controller('homeController', function($scope, $http, $state, $stateParams, FilmService) {
    var vm = this;
    vm.init = init;
    vm.detailAdvertisement = detailAdvertisement;
    vm.detailFilm = detailFilm;

    vm.films = [];
    vm.marketing = [];
    var linkAPI = '';
    vm.titleMarketing = '';
    vm.descMarketing = '';

    function init() {
        $('#liMovies').removeClass('active');
        $('#liHome').addClass('active');
        $('#liTheater').removeClass('active');
        FilmService.getFilm('showing').then(function(data) {
            vm.films = data;
        });
        var urlMarketing = 'https://movie2016.herokuapp.com/api/v1/slider';
        $http.get(urlMarketing).then(function(res) {
            vm.marketing = res.data.data;
            // vm.titleMarketing = vm.marketing[1].title;
            // vm.descMarketing = vm.marketing[1].description;
            $('#titleMarketing').text(vm.marketing[0].title);
            $('#descMarketing').text(vm.marketing[0].description);
        });

        $("#carouselHomePage").on('slide.bs.carousel', function(evt) {
            var currentSlide = $(evt.relatedTarget).index();
            $('#titleMarketing').text(vm.marketing[currentSlide].title);
            $('#descMarketing').text(vm.marketing[currentSlide].description);
        });
    }


    function detailAdvertisement() {
        return;
    }

    function detailFilm(data) {
        $state.go('detail-film', { film: data });
    }
});
filmApp.controller('mainSubController', function($scope, $http, $state, $stateParams) {
    var vm = this;
    vm.init = init;

    vm.message = 'mainSubController';

    function init() {}
});
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
        vm.roomInfo = $stateParams.roomInfo;

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
filmApp.controller('theaterController', function($scope, $http, $state, $stateParams, FilmService) {
    var vm = this;
    vm.init = init;
    vm.changeCity = changeCity;
    vm.showTheater = showTheater;
    vm.showMap = showMap;
    // vm.data = {
    //   rawData: [],
    //   city: [],
    //   theater: []
    // };
    vm.data = [];
    vm.theaterToShow = [];
    vm.theaterToShowModal = {};

    var currentCity = '';

    var PrototypeCity = function() {
        return {
            'code': '',
            'name': '',
            'theater': []
        }
    }

    var PrototypeTheater = function() {
        return {
            'code': '',
            'name': ''
        }
    }

    function init() {
        $('#liMovies').removeClass('active');
        $('#liHome').removeClass('active');
        $('#liTheater').addClass('active');
        FilmService.getTheater().then(function(data) {
            vm.data = data;
            vm.data.sort(function(a, b) {
                return a.city_name > b.city_name;
            });
            currentCity = data[0].city_code;
            _.each(data[0].theaters, function(item) {
                var theater = new PrototypeTheater();
                theater.code = item.code;
                theater.name = item.name;
                vm.theaterToShow.push(theater);
            });
        });
    }

    function changeCity(cityCode, cityTab) {
        vm.cityTab = cityTab;
        vm.theaterToShow.length = 0;
        currentCity = cityCode;
        _.each(vm.data, function(city) {
            if (city.city_code === cityCode) {
                _.each(city.theaters, function(item) {
                    var theater = new PrototypeTheater();
                    theater.code = item.code;
                    theater.name = item.name;
                    vm.theaterToShow.push(theater);
                });
                return true;
            }
        })
    }

    function showTheater(theaterCode) {
        _.each(vm.data, function(city) {
            if (city.city_code === currentCity) {
                _.each(city.theaters, function(item) {
                    if (item.code === theaterCode) {
                        vm.theaterToShowModal = item;
                        $('#modalTheater').modal();
                        return true;
                    }
                });
            }
        });
    }

    function showMap() {
        $('#modalMap').modal();
    }
})
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