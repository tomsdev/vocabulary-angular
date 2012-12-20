'use strict';

describe('Controller: QuizCtrl', function() {

  // load the controller's module
  beforeEach(module('vocabularyAngularApp'));

  var QuizCtrl,
      scope,
	    wordsDataServiceMock;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
	  wordsDataServiceMock = {
		  get: function() {
			  return [{w:"word1", inf:{qz:123, s:2}}, {w:"word2"}];
		  },
		  incrementSuccess: jasmine.createSpy(),
		  decrementSuccess: jasmine.createSpy()
	  };

	  scope = {};
    QuizCtrl = $controller('QuizCtrl', {
      $scope: scope,
	    WordsDataService: wordsDataServiceMock
    });
  }));

	it('should attach the quiz index with value 0', function() {
		expect(scope.quizIndex).toBe(0);
	});

	it('should attach the answer visibility with value false', function() {
		expect(scope.isAnswerVisible).toBe(false);
	});

	it('should attach the quiz end indicator with value false', function() {
		expect(scope.isQuizEnd).toBe(false);
	});

	describe('getCurrentWord', function() {

		it('should return the first word', function() {
			expect(scope.getCurrentWord().w).toBe("word1");
		});

		it('should return the second word', function() {
			scope.quizIndex = 1;
			expect(scope.getCurrentWord().w).toBe("word2");
		});
	});

	describe('goNextWord', function() {

		it('should increment the quiz index', function() {
			scope.goNextWord();
			expect(scope.quizIndex).toBe(1);
		});

		it('should set the answer visibility false', function() {
			scope.isAnswerVisible = true;
			scope.goNextWord();
			expect(scope.isAnswerVisible).toBe(false);
		});

		it('should indicate the end of the quiz when there is no more words', function() {
			scope.goNextWord();
			expect(scope.isQuizEnd).toBe(false);
			scope.goNextWord();
			expect(scope.isQuizEnd).toBe(true);
		});
	});

	describe('showAnswer', function() {

		it('should set the answer visibility to true', function() {
			scope.showAnswer();
			expect(scope.isAnswerVisible).toBe(true);
		});
	});

	describe('markAsKnown', function() {

		it('should increment the number of success of the word', function() {
			var actualWord = scope.getCurrentWord();
			scope.markAsKnown();
			expect(wordsDataServiceMock.incrementSuccess)
				.toHaveBeenCalledWith(actualWord);
		});

		it('should go to next word', function() {
			scope.goNextWord = jasmine.createSpy();
			scope.markAsKnown();
			expect(scope.goNextWord).toHaveBeenCalled();
		});
	});

	describe('markAsUnknown', function() {

		it('should decrement the number of success of the word', function() {
			var actualWord = scope.getCurrentWord();
			scope.markAsUnknown();
			expect(wordsDataServiceMock.decrementSuccess)
				.toHaveBeenCalledWith(actualWord);
		});

		it('should go to next word', function() {
			scope.goNextWord = jasmine.createSpy();
			scope.markAsUnknown();
			expect(scope.goNextWord).toHaveBeenCalled();
		});
	});
});
