(function () {
    'use strict';

    angular.module('movieApp').controller('GenreMovieListController', ['$stateParams', '$state', 'moviesApi', 'CacheFactory', GenreMovieListController]);

    function GenreMovieListController($stateParams, $state, moviesApi, CacheFactory) {
        var vm = this;
        var genre = $stateParams.genre;
        var shortlistedMovies = CacheFactory.get('shortlistedMovies');


        vm.genre = genre.name;
        moviesApi.getMoviesByGenre(vm.genre).then(function (response) {
            vm.genreMovies = response;
        });

        vm.selectMovie = function (movie) {
            $state.go("home.genreMovie", {
                "movieName": movie.title,
                "genre": genre
            });
        };

        vm.isMovieShortlisted = function (movieTitle) {
            var shortlistedMovie = shortlistedMovies.get(movieTitle);
            if (shortlistedMovie) {
                return shortlistedMovie.shortlisted;
            } else {
                return false;
            }
        };

        vm.toggleShortlisted = function (movieTitle, toggleBoolean) {
            if (vm.isMovieShortlisted(movieTitle)) {
                shortlistedMovies.put(movieTitle, {'shortlisted': toggleBoolean});
            } else {
                shortlistedMovies.put(movieTitle, {'shortlisted': toggleBoolean});
            }
            vm.isMovieShortlisted(movieTitle);

        };

        vm.isMovieShortlisted = function (movieTitle) {
            var shortlistedMovie = shortlistedMovies.get(movieTitle);
            if (shortlistedMovie) {
                return shortlistedMovie.shortlisted;
            } else {
                return false;
            }
        };
    }

})();