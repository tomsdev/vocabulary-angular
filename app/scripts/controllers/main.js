'use strict';

/**
 * Controller that expose things accessible from anywhere in the application.
 */
vocabularyAngularApp.controller('MainCtrl', ["$scope", "wordsDataService", "$location", function($scope, wordsDataService, $location) {
	$scope.back = function () {
		$location.goBack();
	};
}]);
