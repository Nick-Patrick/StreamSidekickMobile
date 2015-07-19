(function () {
    'use strict';

    angular.module('movieApp').controller('WatchlistController', ['moviesApi', 'CacheFactory', WatchlistController]);

    function WatchlistController(moviesApi, CacheFactory) {

        var vm = this;
        var shortlistedMovies;
        vm.movies = [];
        var shortlistedMoviesCache = CacheFactory.get('shortlistedMovies');



        vm.initialize = function () {
            shortlistedMovies = vm.getShortlistedMovies();
            vm.getMoviesData();
        };

        vm.getShortlistedMovies = function () {
            var shortlistedMovies = window.localStorage.getItem('angular-cache.caches.shortlistedMovies.keys').split(",");
            for (var i = 0; i < shortlistedMovies.length; i++) {
                shortlistedMovies[i] = shortlistedMovies[i].replace(/([.*+?^=!":${}()|\[\]\/\\])/g, '');
            }
            return shortlistedMovies;
        };

        vm.getMoviesData = function () {
            shortlistedMovies.forEach(function (movie) {
                moviesApi.getMovieDataByTitle(movie)
                    .then(function (response) {
                        console.log(response);
                        vm.movies.push(response);
                    })
            });
        };

        vm.removeFromWatchlist = function (movie, event) {
            $(event.target).closest('.card').addClass('cardRemoved');
            setTimeout(function () {
                $(event.target).closest('.card').css({'height': '0', 'margin': '0'});
            }, 600);
            shortlistedMoviesCache.remove(movie.title);
        };

        vm.initialize();
    }
})();