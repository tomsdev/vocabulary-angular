'use strict';

/**
 * Controller that expose the words.
 */
vocabularyAngularApp.controller('ListCtrl', ["$scope", "WordsDataService", function($scope, WordsDataService) {
	$scope.words = WordsDataService.get();
}]);
