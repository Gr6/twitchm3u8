var app = angular.module("TwitchApp", ["ngRoute", "ngAnimate"]);
app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when("/", {
		templateUrl: "partials/main_page.html",
		controller: "MainPageController"
	});
	$routeProvider.when("/search-list", {
		templateUrl: "partials/quality_list.html",
		controller: "StreamQualityListController"
	});
	$locationProvider.html5Mode(true);
})
app.controller('MainPageController', function($rootScope, $scope, $http){
	$scope.channelLimit = 0;
	$scope.popularChannelArray = [];
	var showLoading = true;
	$scope.loadPopularStream = function() {
		console.log($scope.channelLimit + 25);
		if($scope.channelLimit + 25 <= 100) {
			$rootScope.showLoadingView(false);
			$http.get("/api/get-popular-channel", {
				params: {
					"limit": $scope.channelLimit
				}
			}).then(function(res) {
				$scope.popularChannelArray = $scope.popularChannelArray.concat(res.data);
				$scope.channelLimit = $scope.channelLimit + 15;
				updateGrid = true;
				console.log(res.data);
			});
		}
	}
	$scope.loadPopularStream();
	$scope.checkChannel = function(name) {
		console.log(name);
		if(name !== null && name !== undefined) {
			showLoading = false;
			$rootScope.streamer = name;
			$rootScope.getHlsStream($rootScope.streamer);
		}
	}
	$scope.substringUrl = function(url) {
		return url.length > 50 ? url.substring(0,50) + "...": url;
	}
	var updateGrid = true;
	$(window).scroll(function() {
		console.log("SCROLL");
	    if(($(window).scrollTop() >= $(document).height() - $(window).height() - 200) && updateGrid && showLoading) {
	    	console.log("BOTTOM");
	    	updateGrid = false;
	    	$scope.loadPopularStream();
	    }
	});
})
app.controller('StreamSearchController', function($rootScope, $scope, $http, $location){
	$rootScope.streamer = null;
	$scope.checkField = function() {
		if($rootScope.streamer !== null ) {
			console.log("Input not empty");
			$scope.getHlsStream($rootScope.streamer.toLowerCase());
		}
	}
	$rootScope.getHlsStream = function(channel) {
		$rootScope.showLoadingView(true);
		$http.get("/api/get-channel", {
			params: {
				"channel": channel
			}
		}).then(function(res) {
			console.log("Received");
			console.log(res);
			$rootScope.streamArray = res.data;
			console.log($rootScope.streamArray);
			$location.path("/search-list");
			$rootScope.showLoadingView(false);
		}, function(err) {
			console.log(err);
			$rootScope.showLoadingView(false);
		});
	}
	$rootScope.showLoadingView = function(show) {
		console.log(show);
		if(show === true) {
			$(".loading").css("display", "block");
			$(".main-view").css("display", "none");
		} else {
			$(".loading").css("display", "none");
			$(".main-view").css("display", "block");
		}
	}
	$(".search-input").keypress(function(e) {
		var key = e.which;
		if(key == 13) {
			$(".search-btn").click();
			return false;
		}
	})
})
app.controller('StreamQualityListController', function($rootScope, $scope, $location){
	$scope.isError = function() {
		if(typeof $rootScope.streamArray != "undefined")
			return $rootScope.streamArray.error;
		else
			$location.path("/");
	}
	$scope.substringUrl = function(url) {
		return url.length > 100 ? url.substring(0,100) + "...": url;
	}
})