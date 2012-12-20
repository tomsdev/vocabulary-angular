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
			  expect(word.d).toBe("");
		  });
		});
  });

	describe('add', function() {

		var actualLength,
				word;
		beforeEach(function () {
			actualLength = WordsDataService.get().length;
			word = {w:"money", t:"argent", d:"", pc:0};
		});

		it('should add the word', function () {
			WordsDataService.add(word);
			expect(WordsDataService.get().length).toBe(actualLength + 1);
		});

		it('should add the word at the beginning', function () {
			WordsDataService.add(word);
			expect(WordsDataService.get()[0].w).toBe("money");
		});
	});

	describe('addArray', function() {

		var actualLength,
				words;
		beforeEach(function () {
			actualLength = WordsDataService.get().length;
			words = [{}, {}];
		});

		it('should add the words', function () {
			WordsDataService.addArray(words);
			expect(WordsDataService.get().length).toBe(actualLength + 2);
		});
	});

	describe('*Success', function() {

		var actualQz,
				word;
		beforeEach(function () {
			actualQz = 123456;
			word = {w:"", t:"", d:"", inf:{qz: actualQz, s: 2}};
		});

		describe('incrementSuccess', function() {

			it('should reset success value to 1 when it is negative', function () {
				word.inf.s = -1;
				WordsDataService.incrementSuccess(word);
				expect(word.inf.s).toBe(1);
			});

			it('should increment success value when it is positive', function () {
				word.inf.s = 1;
				WordsDataService.incrementSuccess(word);
				expect(word.inf.s).toBe(2);
			});

			it('should update the last quiz timestamp value', function () {
				WordsDataService.incrementSuccess(word);
				expect(word.inf.qz).toBeGreaterThan(actualQz);
			});
		});

		describe('decrementSuccess', function() {

			it('should reset success value to -1 when it is positive', function () {
				word.inf.s = 2;
				WordsDataService.decrementSuccess(word);
				expect(word.inf.s).toBe(-1);
			});

			it('should decrement success value when it is negative', function () {
				word.inf.s = -1;
				WordsDataService.decrementSuccess(word);
				expect(word.inf.s).toBe(-2);
			});

			it('should update the last quiz timestamp value', function () {
				WordsDataService.decrementSuccess(word);
				expect(word.inf.qz).toBeGreaterThan(actualQz);
			});
		});
	});
});
