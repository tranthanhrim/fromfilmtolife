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
            // $("#flexiselDemo1").flexisel({
            //     visibleItems: 5,
            // animationSpeed: 1000,
            // autoPlay: true,
            // autoPlaySpeed: 3000,
            // pauseOnHover: false,
            // enableResponsiveBreakpoints: true,
            // responsiveBreakpoints: {
            //     portrait: {
            //         changePoint: 480,
            //         visibleItems: 2
            //     },
            //     landscape: {
            //         changePoint: 640,
            //         visibleItems: 3
            //     },
            //     tablet: {
            //         changePoint: 800,
            //         visibleItems: 4
            //     }
            // }
            // });
            vm.films = data;
        });
        var urlMarketing = 'https://movie2016.herokuapp.com/api/v1/slider';
        $http.get(urlMarketing).then(function(res) {
            vm.marketing = res.data.data;
            vm.titleMarketing = vm.marketing[1].title;
            vm.descMarketing = vm.marketing[1].description;
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