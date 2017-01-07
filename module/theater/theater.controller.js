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