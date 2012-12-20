'use strict';

/**
 * Controller that expose things accessible from anywhere in the application.
 */
vocabularyAngularApp.controller('MainCtrl', ["$scope", "WordsDataService", "$navigate", function($scope, WordsDataService, $navigate) {
	$scope.back = function () {
		$navigate('back');
	};
}]);
