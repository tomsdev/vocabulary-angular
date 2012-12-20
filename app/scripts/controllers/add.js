'use strict';

/**
 * Controller for the form which add a new word.
 */
vocabularyAngularApp.controller('AddCtrl', ["$scope", "WordsDataService", function($scope, WordsDataService) {

	/**
	 * Instance of the word.
	 * @type {Word}
	 */
	$scope.newWord = createWord();

	/**
	 * Add $scope.newWord in the data service.
	 */
	$scope.addWord = function () {
		WordsDataService.add($scope.newWord);
		$scope.newWord = createWord();
		$scope.back();
	};
}]);
