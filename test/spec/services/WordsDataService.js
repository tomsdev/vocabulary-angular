'use strict';

describe('Service: WordsDataService', function () {

  // load the service's module
  beforeEach(module('vocabularyAngularApp'));

  // instantiate service
  var WordsDataService;
  beforeEach(inject(function(_WordsDataService_) {
    WordsDataService = _WordsDataService_;
  }));

  describe('get', function() {

	  var words;
	  beforeEach(function () {
		  words = WordsDataService.get();
	  });

	  it('should get 5 words', function () {
		  expect(words.length).toBe(5);
	  });

	  describe('first word object', function() {

		  var word;
		  beforeEach(function () {
			  word = words[0];
		  });

		  it('should have a property w', function () {
			  expect(word.w).toBe("car");
		  });

		  it('should have a property t', function () {
			  expect(word.t).toBe("voiture");
		  });

		  it('should have a property d', function () {
			  expect(word.d).toBe("lorem ipsum un orem ipsum");
		  });
		});
  });
});
