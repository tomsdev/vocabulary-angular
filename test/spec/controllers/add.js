'use strict';

describe('Controller: AddCtrl', function() {

  // load the controller's module
  beforeEach(module('vocabularyAngularApp'));

  var AddCtrl,
      scope,
	    wordsDataServiceMock;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
	  wordsDataServiceMock = {
		  add: jasmine.createSpy()
	  };

    scope = {
	    back: jasmine.createSpy()
    };

    AddCtrl = $controller('AddCtrl', {
      $scope: scope,
	    WordsDataService: wordsDataServiceMock
    });
  }));

	it('should attach an empty word', function() {
		expect(scope.newWord.w).toBe("");
		expect(scope.newWord.t).toBe("");
		expect(scope.newWord.d).toBe("");
	});

	describe('addWord', function() {
		var newWord;

		beforeEach(function () {
			newWord = {w:"money", t:"argent", d:"", pc:0};
			scope.newWord = newWord;
		});

		it('should add the word', function () {
			scope.addWord();
			console.log(newWord);
			expect(wordsDataServiceMock.add).toHaveBeenCalledWith(newWord);
		});

		it('should navigate back', function () {
			scope.addWord();
			expect(scope.back).toHaveBeenCalled();
		});
	});
});
