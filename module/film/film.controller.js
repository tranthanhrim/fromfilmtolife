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
        // filmSchedule.length = 0;
        // FilmService.getSchedule(codeFilm).then(function (data) {
        // });
        $('#loading').show();
        vm.nameFilmBooking = filmName;
        var url = 'https://movie2016.herokuapp.com' + '/api/v1/schedules?movie-code=' + filmCode;
        $http.get(url).then(function(res) {
            lstCityCode.length = 0;
            scheduleConverted.length = 0;
            scheduleAllDay.length = 0;
            vm.filmSchedule.length = 0;
            vm.typeOfFilm = [];
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
                                break;
                            }
                            if (_.findWhere(vm.typeOfFilm, { id: dataEachDate.prices[0].version_code }) == null) {
                                var tmp6 = {
                                    'id': dataEachDate.prices[0].version_code,
                                    'name': dataEachDate.prices[0].version_name
                                };
                                vm.typeOfFilm.push(angular.copy(tmp6));
                            }
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