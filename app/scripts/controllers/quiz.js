'use strict';

/**
 * Controller for the quiz.
 */
vocabularyAngularApp.controller('QuizCtrl', ["$scope", "wordsDataService", function($scope, wordsDataService) {
	var words = wordsDataService.get();

	/**
	 * Index of the current word in the quiz.
	 * @type {Number}
	 */
	$scope.quizIndex = 0;

	/**
	 * Indicates when there is no more words in the quiz.
	 * @type {Boolean}
	 */
	$scope.isQuizEnd = false;

	$scope.isAnswerVisible = false;

	$scope.getCurrentWord = function() {
		return words[$scope.quizIndex];
	};

	$scope.goNextWord = function() {
		$scope.isAnswerVisible = false;

		if ($scope.quizIndex < words.length - 1) {
			$scope.quizIndex++;
		}
		else {
			$scope.isQuizEnd = true;
		}
	};

	$scope.showAnswer = function() {
		$scope.isAnswerVisible = true;
	};

	$scope.markAsKnown = function() {
		wordsDataService.incrementSuccess($scope.getCurrentWord());
		$scope.goNextWord();
	};

	$scope.markAsUnknown = function() {
		wordsDataService.decrementSuccess($scope.getCurrentWord());
		$scope.goNextWord();
	};
}]);
