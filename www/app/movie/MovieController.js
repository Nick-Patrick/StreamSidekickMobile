(function () {
    'use strict';

    angular.module('movieApp').controller('MovieController', ['$stateParams', '$state', '$scope', '$ionicLoading', 'moviesApi', 'CacheFactory', MovieController]);

    function MovieController($stateParams, $state, $scope, $ionicLoading, moviesApi, CacheFactory) {
        var vm = this;
        var isTop10List = false;
        var movieName = $stateParams.movieName;
        var currentMovieRank;
        var shortlistedMovies = CacheFactory.get('shortlistedMovies');

        this.initialise = function () {
            $ionicLoading.show({
                template: 'Fetching movie..'
            });
            this.setListStatus();
            vm.loadList(false);
        };

        this.setListStatus = function () {
            if ($stateParams.top10) {
                isTop10List = true;
                currentMovieRank = parseInt($stateParams.rank) || undefined;
            }
        };

        this.getRandomMovieIndex = function () {
            return Math.floor(Math.random() * (40 - 1)) + 1;
        };

        vm.loadInitialMovie = function () {
            if ($stateParams.imdbId) {
                moviesApi.getMovieDataByImdbId($stateParams.imdbId).then(function (response) {
                    vm.movie = response;
                    vm.movie.movieTrailer = "http://youtube.com/watch?v=" + vm.movie.trailers[0].videoKey;
                }).finally(function () {
                    vm.cleanUpResults();
                    $ionicLoading.hide();
                });
            } else {
                vm.navigateToNextMovie(this.getRandomMovieIndex());
            }
        };

        vm.goToYoutubeVideo = function () {
            var youtubeVideo = "http://youtube.com/watch?v=" + vm.movie.trailers[0].videoKey;
            window.open(youtubeVideo, '_system');
            return false;
        };

        vm.cleanUpResults = function () {
            for (var key in vm.movie) {
                if(vm.movie[key] === 'N/A' || 0) {
                    delete vm.movie[key];
                }
            }
        };

        vm.loadList = function () {
            this.loadInitialMovie();
        };

        vm.navigateToNextMovie = function (nextMovieIndex) {
            var nextMovie;
            moviesApi.getMovieByIndex(nextMovieIndex).then(function (movie) {
                nextMovie = movie;
                $state.go('home.movie', {
                    "movieName": nextMovie.title,
                    "rank": currentMovieRank,
                    "previousTitle": movieName,
                    "imdbId": nextMovie.imdbId
                });
            });
        };

        vm.navigateToPreviousMovie = function (previousMovieIndex) {
            moviesApi.getMovieByIndex(previousMovieIndex).then(function (movie) {
                $state.go('home.movie', {
                    "movieName": movie.title,
                    "rank": previousMovieIndex,
                    "previousTitle": movieName,
                    "imdbId": movie.imdbId
                });
            });
        };

        vm.navigateToPreviousMovieByTitle = function (previousMovieTitle) {
            moviesApi.getMovieDataByTitle(previousMovieTitle).then(function (movie) {
                $state.go('home.movie', {
                    "movieName": movie.title,
                    "previousTitle": movieName,
                    "imdbId": movie.imdbId
                });
            });
        };

        vm.swipeLeft = function () {
            currentMovieRank = (parseInt($stateParams.rank) + 1) || 0;
            if (isTop10List) {
                this.navigateToNextMovie(currentMovieRank);
            } else {
                var randomMovieIndex = this.getRandomMovieIndex();
                this.navigateToNextMovie(randomMovieIndex);
            }
        };

        vm.swipeRight = function () {
            currentMovieRank = (parseInt($stateParams.rank) - 1) || 0;
            if (isTop10List) {
                this.navigateToPreviousMovie(currentMovieRank);
            } else if ($stateParams.previousTitle) {
                this.navigateToPreviousMovieByTitle($stateParams.previousTitle);
            }
        };

        vm.toggleShortlistedMovie = function (movieTitle) {
            if (vm.isMovieShortlisted(movieTitle)) {
                shortlistedMovies.remove(movieTitle);
                jQuery('.shortlistMessage').removeClass('shortlisted');
            } else {
                shortlistedMovies.put(movieTitle, {'shortlisted': true});
                jQuery('.shortlistMessage').addClass('shortlisted');
                setTimeout(function () {
                    jQuery('.shortlistMessage').removeClass('shortlisted');
                }, 2000);
            }
        };

        vm.isMovieShortlisted = function (movieTitle) {
            var shortlistedMovie = shortlistedMovies.get(movieTitle);
            if (shortlistedMovie) {
                return shortlistedMovie.shortlisted;
            } else {
                return false;
            }
        };

        vm.convertSentenceToParagraphs = function (sentence) {
            var shortSentence = '<p>';
            var sentenceArray = sentence.split('.');
            for (var i = 0; i < sentenceArray.length - 1; i++) {
                shortSentence += sentenceArray[i];
                if (sentenceArray[i].length > 60) {
                    shortSentence += ".</p><p>";
                }
            }
            return shortSentence.length > 1 ? shortSentence + '</p>' : sentence;
        };

        this.initialise();
    }

})();