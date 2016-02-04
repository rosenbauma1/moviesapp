'use strict';

angular.module('movieApp', [
  'ngRoute',
  'ngResource',
  'ngAnimate',
  'environment'
])
  .config(['$routeProvider', 'envServiceProvider',
    function($routeProvider, envServiceProvider) {
      $routeProvider.
        when('/movies', {
          templateUrl: 'movies/index.html',
          controller: 'moviesIndexCtrl'
        }).
        otherwise({
          redirectTo: '/movies'
        });

      envServiceProvider.config({
        domains: {
          development: ['movies-alr-rcl.cfapps.io/home/'],
          //production:
        },

        vars: {
        
          development: {
              apiEndpoint: '//movies-api.cfapps.io',
          }
          // production: {
          // }
        }
      });

      envServiceProvider.check();
    }]);;'use strict';

angular.module('movieApp').controller('moviesIndexCtrl', ['$scope', '$http', 'Movie', 'Page', 'envService',
  function($scope, $http, Movie, Page, envService) {
    Page.setTitle('Movies');
    $scope.page = 0;
    $scope.pageGroupNumber = 0;
    $scope.totalMovies = 0;
    var getMovies = function(page) {
	    Movie.query({ page: page, size: 5 }).$promise.then((response) => {
	    	$scope.movies = response._embedded.movies;
	    	$scope.totalMovies = response.page.totalElements;
	    	//Pagination
	    	$scope.totalPages = response.page.totalPages - 1;
	        $scope.pageNumber = page;
	        window.scrollTo(0,0);
	        
	        $scope.pages = [];
	        
	        for (var i=1; i <$scope.totalPages + 2; i++) {
	        	$scope.pages.push(i);
	        }
	        $scope.pageGroups = [];
	        for (var s=0; s<$scope.pages.length; s=s+5) {
	        	$scope.pageGroups.push($scope.pages.slice(s,s+5));
	        }
        
	    });
    };
    
    //Query all movies for Google Charts
    Movie.query({ size: $scope.totalMovies }).$promise.then((response) => {
    	var moviesForChart = response._embedded.movies;
    	debugger;
    	//Google Charts
        google.charts.load('current', {'packages':['corechart']});
        donutChart(moviesForChart);
        curveChart(moviesForChart);
    });
    
    getMovies($scope.page);
    $scope.isAdding = false;
    $scope.showEdit = function(movie){
    	return !movie.isEditing && !movie.isDeleting;
    };
    
    //Pagination Functions
    $scope.previousPage = function(pageGroup) {
        getMovies($scope.pageNumber - 1);
        if ($scope.pageGroups[$scope.pageGroupNumber].indexOf($scope.pageNumber - 2) === -1) {
          $scope.pageGroupNumber = $scope.pageGroupNumber - 1;
        }
      };
      $scope.nextPage = function(pageGroup) {
        getMovies($scope.pageNumber + 1);
        if ($scope.pageGroups[$scope.pageGroupNumber].indexOf($scope.pageNumber + 2) === -1) {
          $scope.pageGroupNumber = $scope.pageGroupNumber + 1;
        }
      };
      $scope.choosePage = function(page) {
        getMovies(page-1);
      };
      $scope.firstPage = function() {
        getMovies(0);
        $scope.pageGroupNumber = 0;
      };
      $scope.lastPage = function() {
        getMovies($scope.pages.length - 1);
        $scope.pageGroupNumber = $scope.pageGroups.length - 1;
      };
      $scope.previousPageGroup = function(currentPageGroup) {
        $scope.pageGroupNumber = $scope.pageGroupNumber - 1;
      };
      $scope.nextPageGroup = function(currentPageGroup) {
        $scope.pageGroupNumber = $scope.pageGroupNumber + 1;
      };
    
    $scope.src = function(movie) {
      return movie.imageUrl ? `images/movies/${movie.id}.jpg` : "";
    };
    
    $scope.newMovie = {};

    $scope.create = function() {
      var movie = $scope.newMovie;
      var m = new Movie();

      m.title = movie.title;
      m.rated = movie.rated;
      m.genre = movie.genre;
      m.duration = movie.duration;
      m.releaseDate = movie.releaseDate;
      m.stars = movie.stars;
      m.director = movie.director;
      m.writer = movie.writer;
      m.actors = movie.actors;
      m.description = movie.description;

      m.$save((newMovie) => {
        $scope.isAdding = false;
        $scope.movies.unshift(newMovie);
        $scope.newMovie = {};
      });
    };
    
    $scope.genreColor = function(movie) {
    	if(movie.genre === "Action"){
    		return {'background-color':'#3366CC'};
    	} else if (movie.genre === "Horror") {
    		return {'background-color':'#DC3912'};
    	} else if (movie.genre === "Comedy") {
    		return {'background-color':'#FF9900'};
    	} else if (movie.genre === "Family") {
    		return {'background-color':'#109618'};
    	} else if (movie.genre === "Thriller") {
    		return {'background-color':'#990099'};
    	} else {
    		return {'background-color':'#0099C6'};
    	}
    }

    $scope.update = function(movie) {
    	
    	$http({method: 'PUT', url: `${envService.read('apiEndpoint')}/movies/${movie.id}`, data: {movie: movie} }).then(() => {
    		movie.isEditing = false;
          });
    };

    $scope.delete = function(movie) {
    	$http({method: 'DELETE', url: `${envService.read('apiEndpoint')}/movies/${movie.id}` }).then(() => {
            var index = $scope.movies.indexOf(movie);
            $scope.movies.splice(index, 1);
          }); 
    };
  }
]);
;'use strict';

angular.module('movieApp').controller('movieCtrl', ['$scope', '$routeParams', 'Movie', 'Page',
	function($scope, $routeParams, Movie, Page) {
		$scope.movie = Movie.get({id: $routeParams.id}, function(movie) {
      Page.setTitle(movie.title);
    });
	}
]);;'use strict';

angular.module('movieApp').directive('addMovie', function() {
  return {
    restrict: 'E',
    transclude: 'true',
    templateUrl: 'directives/add-movie.html',
    scope: {
      'movie': '=',
      'onAdd': '&'
    }
  };
});;'use strict';

angular.module('movieApp').directive('deleteDialogue', function() {
  return {
    restrict: 'E',
    transclude: 'true',
    templateUrl: 'directives/delete-dialogue.html',
    scope: {
      'content': '=',
      'onCancel': '&',
      'onDelete': '&'
    },
    controller: function($scope) {
      $scope.delete = function() {
        var content = $scope.content;
        $scope.onDelete({content: content});
      };
    }
  };
});;'use strict';

//Pagination Directive
angular.module('movieApp').directive('pagination', function() {
	  return {
	    restrict: 'E',
	    transclude: 'true',
	    templateUrl: 'directives/pagination.html',
	    scope: {
	      'pages': '=',
	      'pageGroup': '=',
	      'pageNumber': '=',
	      'totalPages': '=',
	      'onChoosePage': '&',
	      'onPreviousPage': '&',
	      'onNextPage': '&',
	      'onPreviousPageGroup': '&',
	      'onNextPageGroup': '&',
	      'onFirstPage': '&',
	      'onLastPage': '&'
	    }
	  };
	});;'use strict';

angular.module('movieApp').factory('Movie', ['$resource', 'envService',
  function($resource, envService){
    return $resource(`${envService.read('apiEndpoint')}/movies/:id/`, { id: '@_id' }, {
	    query: { method: 'get', isArray: false, params: { page: '@page', size: '@size' }},
    	update: {
	      method: 'PUT'
	    }
  	});
  }
]);
;'use strict';

angular.module('movieApp').service('Page', function($rootScope){
  return {
    setTitle: function(title){
      $rootScope.title = title;
    }
  };
});

//Google Charts Donut Chart
function donutChart(movies) {
	
	var action = 0;
	var horror = 0;
	var comedy = 0;
	var family = 0;
	var thriller = 0;
	var other = 0;
	angular.forEach(movies, function(value, key){
		if(value.genre === "Action"){
			action++;
		} else if(value.genre === "Horror"){
			horror++;
		} else if(value.genre === "Comedy"){
			comedy++;
		} else if(value.genre === "Family"){
			family++;
		} else if(value.genre === "Thriller"){
			thriller++;
		} else {
			other++;
		}
	});
	var genreCount = {"action":action,
					"horror":horror,
					"comedy":comedy,
					"family":family,
					"thriller":thriller,
					"other":other};
	
	google.charts.setOnLoadCallback(function(){drawChart(genreCount)});
	function drawChart(genreCount) {
	  var data = google.visualization.arrayToDataTable([
	    ['Task', 'Hours per Day'],
	    ['Action', genreCount.action],
	    ['Horror', genreCount.horror],
	    ['Comedy', genreCount.comedy],
	    ['Family', genreCount.family],
	    ['Thriller', genreCount.thriller],
	    ['Other', genreCount.other]
	  ]);
	
	  var options = {
	    title: 'Movies by Genre',
	    pieHole: 0.4,
	    backgroundColor: 'rgb(245,240,235)'
	  };
	
	  var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
	  chart.draw(data, options);
	};
};

//Google Charts Curve Line Chart
function curveChart(movies){
	
	var ten = 0;
	var eleven = 0;
	var twelve = 0;
	var thirteen = 0;
	var fourteen = 0;
	var fifteen = 0;
	var sixteen = 0;
	angular.forEach(movies, function(value, key){
		if(value.releaseDate !== null){
			var movieDate = value.releaseDate.substring(0,4);
			if(movieDate === "2016"){
				sixteen++;
			} else if(movieDate === "2011"){
				eleven++;
			} else if(movieDate === "2012"){
				twelve++;
			} else if(movieDate === "2013"){
				thirteen++;
			} else if(movieDate === "2014"){
				fourteen++;
			} else if(movieDate === "2015"){
				fifteen++;
			} else {
				ten++;
			}
		}
	});
	var movieYearCount = {"ten":ten,
					"eleven":eleven,
					"twelve":twelve,
					"thirteen":thirteen,
					"fourteen":fourteen,
					"fifteen":fifteen,
					"sixteen":sixteen};
	google.charts.setOnLoadCallback(function(){drawChart(movieYearCount)});
	
	function drawChart(movieYearCount) {
	  var data = google.visualization.arrayToDataTable([
	    ['Year', 'Movies'],
	    ['< 2010',  movieYearCount.ten],
	    ['2011',  movieYearCount.eleven],
	    ['2012',  movieYearCount.twelve],
	    ['2013',  movieYearCount.thirteen],
	    ['2014',  movieYearCount.fourteen],
	    ['2015',  movieYearCount.fifteen],
	    ['2016',  movieYearCount.sixteen]
	  ]);
	
	  var options = {
	    title: 'Movie Releases',
	    curveType: 'function',
	    legend: { position: 'bottom' },
	    backgroundColor: 'rgb(245,240,235)'
	  };
	
	  var chart = new 	google.visualization.LineChart(document.getElementById('curve_chart'));
	
	  chart.draw(data, options);
	}
};

function parseJsonDate(jsonDateString){
    return new Date(parseInt(jsonDateString.replace('/Date(', '')));
};
