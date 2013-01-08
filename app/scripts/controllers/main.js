'use strict';

/**
 * Controller that expose things accessible from anywhere in the application.
 */
vocabularyAngularApp.controller('MainCtrl', ["$scope", "wordsDataService", "$navigate", function($scope, wordsDataService, $navigate) {
	$scope.back = function () {
		$navigate('back');
	};
}]);
