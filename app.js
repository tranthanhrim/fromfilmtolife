var filmApp = angular.module('mtob', ['ngMaterial', 'ui.router']); //ngRoute

filmApp.factory('FilmService', ['$http', function($http) {
    var linkAPI = '';

    return {
        init: init,
        login: login,
        logout: logout,
        register: register,
        getFilm: getFilm,
        getTheater: getTheater,
        getSchedule: getSchedule,
        getSeat: getSeat,
        getTicketPrice: getTicketPrice,
        executeAjaxRequest: executeAjaxRequest
    }

    function init() {
        return $.ajax({
            type: "GET",
            url: "./config.xml",
            dataType: "xml",
            success: function(xml) {
                linkAPI = $(xml).find('api').text();
            }
        });
    }

    function getFilm(status) {
        var url = linkAPI + '/api/v1/films?is-now-showing=';
        url = status === 'showing' ? url + 'true' : url + 'false';
        return $http.get(url).then(function(res) {
            return res.data.data;
        });
    }

    function getTheater() {
        var url = linkAPI + '/api/v1/theaters';
        return $http.get(url).then(function(res) {
            return res.data.data;
        });
    }

    function getSchedule(filmCode) {
        var url = linkAPI + '/api/v1/schedules?movie-code=' + filmCode;
        return $http.get(url).then(function(res) {
            return res.data.data;
        });
    }

    function getSeat(scheduleCode) {
        var url = linkAPI + '/api/v1/seats?schedule-code=' + scheduleCode;
        return $http.get(url).then(function(res) {
            return res.data.data;
        });
    }

    function getTicketPrice(scheduleCode) {
        var url = linkAPI + '/api/v1/ticket-prices?schedule-code' + scheduleCode;
        return $http.get(url).then(function(res) {
            return res.data.data;
        });
    }

    function executeAjaxRequest(type, url, data, callBackFunction) {
        $.ajax({
            type: type,
            // contentType: 'application/json',
            url: url,
            // dataType: 'json',
            data: data,
            success: function(data) {
                callBackFunction(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    }

    function login() {

    }

    function logout() {

    }

    function register() {

    }

}]);

filmApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: './module/home/home.html',
            controller: 'homeController',
            controllerAs: 'vm'
        })
        .state('main', {
            url: '/temp',
            templateUrl: './module/main/main.html',
            controller: 'mainSubController',
            controllerAs: 'vm',
            params: {
                films: null
            }
        })
        .state('film-showing', {
            url: '/film-showing',
            templateUrl: './module/film/film.html',
            controller: 'filmController',
            controllerAs: 'vm',
            params: {
                loadType: 'showing'
            }
        })
        .state('coming-soon', {
            url: '/coming-soon',
            templateUrl: './module/film/film.html',
            controller: 'filmController',
            controllerAs: 'vm',
            params: {
                loadType: 'coming-soon'
            }
        })
        .state('detail-film', {
            url: '/detail-film',
            templateUrl: './module/detail-film/detail-film.html',
            controller: 'detailFilmController',
            controllerAs: 'vm',
            params: {
                film: {}
            }
        })
        .state('seat', {
            url: '/seat',
            templateUrl: './module/seat/seat.html',
            controller: 'seatController',
            controllerAs: 'vm',
            params: {
                scheduleInfo: {},
                roomInfo: {}
            }
        })
        .state('theater', {
            url: '/theater',
            templateUrl: './module/theater/theater.html',
            controller: 'theaterController',
            controllerAs: 'vm'
        })
        .state('account', {
            url: '/account',
            templateUrl: './module/account/account.html',
            controller: 'accountController',
            controllerAs: 'vm'
        })
        .state('ticket', {
            url: '/ticket',
            templateUrl: './module/ticket/ticket.html',
            controller: 'ticketController',
            controllerAs: 'vm',
            params: {
                myTickets: []
            }
        });
});

filmApp.controller('mainController', function($scope, $http, $state, $window, FilmService) {
    var vm = this;
    vm.isLogin = false;
    vm.isLoginByGoogle = false;
    vm.init = init;
    // vm.register = register;
    // vm.login = login;
    vm.logout = logout;
    vm.detailAccount = detailAccount;
    vm.showMyTicket = showMyTicket;
    vm.findCode = findCode;
    vm.navigate = navigate;
    vm.checkUsername = checkUsername;
    vm.showModalLogin = showModalLogin;
    vm.homePage = homePage;
    vm.films = {
        'showing': [],
        'commingSoon': []
    }
    var linkAPI = '';
    var idUser = '';
    var tokenUser = ''

    var PrototypeUserInfo = function() {
        return {
            'username': '',
            'password': '',
            'birthday': '',
            'email': '',
            'phone': '',
            'name': '',
            'address': ''
        }
    };

    var PrototypeUserInfoLogin = function() {
        return {
            'username': '',
            'password': ''
        }
    };
    vm.userInfo = new PrototypeUserInfo();
    vm.userInfoLogin = new PrototypeUserInfoLogin();
    vm.userInfoDetail = {};

    var IsInvalidPrototype = function() {
        return {
            'username': false,
            'password': false,
            'email': false,
            'fullname': false,
            'usernameExisted': false,
            'passwordMatched': false,
            'usernameShort': false,
            'usernameLong': false,
            'usernameFormat': false,
            'usernameLogin': false,
            'passwordLogin': false,
            'usernamePassword': false
        }
    };
    vm.isInvalid = new IsInvalidPrototype();

    function init() {
        $('#loading').hide();
        $('#loading-image-login').hide();
        $("#labelUsernameIncorrect").hide();
        $('#labelUsernameExist').hide();
        $('#dateOfBirth').datepicker({ dateFormat: 'dd/mm/yy' });
        FilmService.init().then(function() {
            FilmService.getFilm('showing').then(function(data) {
                vm.films.showing = data;
            });
            FilmService.getFilm('comming-soon').then(function(data) {
                vm.films.commingSoon = data;
            });
        });

        if (!angular.isUndefined($window.localStorage['jwtToken']) &&
            !angular.isUndefined($window.localStorage['idUser'])) {
            var config = {
                headers: {
                    "x-access-token": $window.localStorage['jwtToken']
                }
            };
            var url = 'https://movie2016.herokuapp.com/api/v1/users?user-id=' + $window.localStorage['idUser'];
            $http.get(url, config).then(function(res) {
                if (res.data.success === true) {
                    vm.isLogin = true;
                    vm.userInfoDetail = res.data.data;
                }
            });
        }
    };

    function navigate(location) {
        if (location === 'home') {
            vm.tabNavSelected = 0;
            $state.go('home');
        } else if (location === 'film-showing') {
            vm.tabNavSelected = 1;
            $state.go('film-showing');
        } else if (location === 'film-coming-soon') {
            vm.tabNavSelected = 1;
            $state.go('coming-soon');
        } else if (location === 'theater') {
            vm.tabNavSelected = 2;
            $state.go('theater');
        }
    }

    $scope.register = function() {
        vm.isInvalid = new IsInvalidPrototype();
        $('#labelUsernameExist').hide();
        vm.isInvalid.username = this.formRegister.userName.$invalid ? true : false;
        vm.isInvalid.email = (this.formRegister.userEmail.$invalid || !this.formRegister.userEmail.$dirty) ? true : false;
        vm.isInvalid.password = this.formRegister.password.$invalid ? true : false;
        vm.isInvalid.fullname = this.formRegister.userFullname.$invalid ? true : false;
        vm.isInvalid.passwordMatched = vm.passwordConfirm !== vm.userInfo.password ? true : false;
        vm.isInvalid.usernameFormat = (vm.userInfo.username.match(/^[a-zA-Z0-9]([._](?![._])|[a-zA-Z0-9]){6,18}[a-zA-Z0-9]$/g) === null) ? true : false;

        if (vm.isInvalid.username || vm.isInvalid.email || vm.isInvalid.password ||
            vm.isInvalid.fullname || vm.isInvalid.usernameExisted || vm.isInvalid.passwordMatched ||
            vm.isInvalid.usernameShort || vm.isInvalid.usernameLong ||
            vm.isInvalid.usernameFormat) {
            return;
        }
        executeAjaxRequest('PUT', 'https://movie2016.herokuapp.com/api/v1/users', vm.userInfo, function(res) {
            if (res.success === true) {
                vm.userInfo = new PrototypeUserInfo();
                vm.passwordConfirm = '';
                vm.isInvalid.userEmail = false;
                vm.isInvalid.email = false;
                vm.isInvalid.password = false;
                $('#modalLogin').modal('hide');

                $('#modalAlertMessage').text('Your account has been successfully created');
                setTimeout(function() {
                    $('#smallModalAlert').modal();
                }, 500);

            } else {
                if (res.message.username === "Username already exists") {
                    vm.isInvalid.usernameExisted = true;
                    $('#labelUsernameExist').show();
                }
            }
        });
    }

    function checkUsername() {
        if (vm.userInfo.username.length < 6) {
            vm.isInvalid.usernameShort = true;
            vm.isInvalid.usernameLong = false;
        } else if (vm.userInfo.username.length > 18) {
            vm.isInvalid.usernameShort = false;
            vm.isInvalid.usernameLong = true;
        } else {
            vm.isInvalid.usernameShort = false;
            vm.isInvalid.usernameLong = false;
        }
    }

    $scope.login = function() {
        $('#loading-image-login').show();
        vm.isInvalid = new IsInvalidPrototype();
        vm.isInvalid.usernameLogin = this.formLogin.usernameLogin.$invalid ? true : false;
        vm.isInvalid.passwordLogin = this.formLogin.passwordLogin.$invalid ? true : false;

        if (vm.isInvalid.usernameLogin || vm.isInvalid.passwordLogin) {
            $('#loading-image-login').hide();
            return;
        }
        executeAjaxRequest('POST', 'https://movie2016.herokuapp.com/api/v1/users', vm.userInfoLogin, function(data) {
            $('#loading-image-login').hide();
            if (!data.success) {
                vm.isInvalid.usernamePassword = true;
                $("#labelUsernameIncorrect").show();
            } else {
                vm.isLoginByGoogle = false;
                vm.isLogin = true;
                vm.isInvalid.usernamePassword = false;
                $("#labelUsernameIncorrect").hide();
                $window.localStorage['jwtToken'] = data.token;
                $window.localStorage['idUser'] = data.id_user;
                if (vm.isRememberAccount) {
                    $window.localStorage['username_mtob'] = vm.userInfoLogin.username;
                    $window.localStorage['password_mtob'] = vm.userInfoLogin.password;
                } else {
                    $window.localStorage.removeItem('username_mtob');
                    $window.localStorage.removeItem('password_mtob');
                }
                vm.userInfoLogin = new PrototypeUserInfoLogin();
                var config = {
                    headers: {
                        "x-access-token": data.token
                    }
                };
                var url = 'https://movie2016.herokuapp.com/api/v1/users?user-id=' + data.id_user;
                $http.get(url, config).then(function(res) {
                    if (res.data.success === true) {
                        vm.userInfoDetail = res.data.data;
                    }
                });
                $('#modalLogin').modal('hide');
            }
        });
    }

    function executeAjaxRequest(type, url, data, callBackFunction) {
        $.ajax({
            type: type,
            // contentType: 'application/json',
            url: url,
            // dataType: 'json',
            data: data,
            success: function(data) {
                callBackFunction(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        });
    }

    function logout() {
        vm.isLogin = false;
        $window.localStorage.removeItem('jwtToken');
        vm.userInfoDetail = new PrototypeUserInfo();

        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
            // console.log('User signed out.');
        });
        vm.isLoginByGoogle = false;
        vm.isLogin = false;
    }

    function detailAccount() {
        // $state.go('account', { idUser: idUser });
        $state.go('account');
    }

    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        // console.log('Name: ' + profile.getName());
        // console.log('Image URL: ' + profile.getImageUrl());
        // console.log('Email: ' + profile.getEmail());
        var userGoogleInfo = new PrototypeUserInfo();
        userGoogleInfo.username = profile.getEmail();
        userGoogleInfo.password = profile.getId();
        userGoogleInfo.email = profile.getEmail();
        userGoogleInfo.name = profile.getName();
        var temp = {
            'username': profile.getEmail(),
            'check': 'true'
        };

        executeAjaxRequest('POST', 'https://movie2016.herokuapp.com/api/v1/users', temp, function(res) {
            if (res.success === true) {
                vm.userInfoLogin.username = userGoogleInfo.username;
                vm.userInfoLogin.password = userGoogleInfo.password;
                var avatar = 'url(' + profile.getImageUrl() + ')';
                // document.getElementById('div-avatar').style.backgroundImage = 'url(https://lh3.googleusercontent.com/-BQovJQPw6Nw/AAAAAAAAAAI/AAAAAAAAAHk/paY4_MeEJc4/s96-c/photo.jpg)';
                document.getElementById('div-avatar').style.backgroundImage = avatar;
                executeAjaxRequest('POST', 'https://movie2016.herokuapp.com/api/v1/users', vm.userInfoLogin, function(data) {
                    if (data.success) {
                        $window.localStorage['jwtToken'] = data.token;
                        $window.localStorage['idUser'] = data.id_user;
                        vm.isLoginByGoogle = true;
                        vm.isLogin = true;
                        var config = {
                            headers: {
                                "x-access-token": data.token
                            }
                        };
                        var url = 'https://movie2016.herokuapp.com/api/v1/users?user-id=' + data.id_user;
                        $http.get(url, config).then(function(res) {
                            if (res.data.success === true) {
                                vm.userInfoDetail = res.data.data;
                            }
                        });
                        $('#modalLogin').modal('hide');
                    }
                });

            } else {
                //register
                executeAjaxRequest('PUT', 'https://movie2016.herokuapp.com/api/v1/users', userGoogleInfo, function(res) {
                    return;
                });
            }
        });
    }

    window.onSignIn = onSignIn;

    function signOut() {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function() {
            console.log('User signed out.');
        });
    }

    function findCode() {
        var url = linkAPI + '/api/v1/tickets?booking-code=' + vm.yourCode;
        $http.get(url).then(function(res) {
            if (data.success === true) {
                //go state
            } else {

            }
        });
    }

    function showMyTicket() {
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
    }

    function showModalLogin() {
        vm.userInfo = new PrototypeUserInfo();
        vm.userInfoLogin = new PrototypeUserInfoLogin();
        vm.isInvalid = new IsInvalidPrototype();
        if (!angular.isUndefined($window.localStorage['username_mtob']) &&
            !angular.isUndefined($window.localStorage['password_mtob'])) {
            vm.userInfoLogin.username = $window.localStorage['username_mtob'];
            vm.userInfoLogin.password = $window.localStorage['password_mtob'];
        }
        $('#modalLogin').modal();
    }

    function homePage() {
        $state.go('home');
    }
});