'use strict';

/**
 * Controller that expose the words.
 */
vocabularyAngularApp.controller('ListCtrl', ["$scope", "wordsDataService", function($scope, wordsDataService) {
	$scope.words = wordsDataService.get();
}]);
