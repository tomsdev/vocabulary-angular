'use strict';

describe('Service: wordsDataService', function () {

	// load the service's module
	beforeEach(module('vocabularyAngularApp'));

	var mockApp = angular.module('mockApp', []),
			setObjectSpy;

	// Mock a dependency service, by using redefining the implementation.
	mockApp.service('dataStorage', function() {
		return {
			getObject: function() {
				var word1 = createWord();
				word1.text = "a";
				word1.translation = "at";
				word1.description = "ad";
				word1.infos.creationDate = 1355980563534;
				word1.infos.lastQuizDate = 0;
				word1.infos.success = 1;

				var word2 = createWord();
				word2.text = "b";
				word2.translation = "bt";
				word2.infos.creationDate = 1355980563535;
				word2.infos.lastQuizDate = 1355980563536;
				word2.infos.success = 3;

				return {words: [word1, word2]};
			},
			setObject: setObjectSpy = jasmine.createSpy()
		};
	});

	beforeEach(module('mockApp'));

	// instantiate service
	var wordsDataService;
	beforeEach(inject(function(_wordsDataService_) {
		wordsDataService = _wordsDataService_;
	}));

	describe('get', function() {
		var words;
		beforeEach(function () {
			words = wordsDataService.get();
		});

		it('should get the 2 words from dataStorage', function () {
			expect(words.length).toBe(2);
		});

		it('should get the correct first word without modification', function () {
			expect(words[0].text).toBe("a");
			expect(words[0].translation).toBe("at");
			expect(words[0].description).toBe("ad");
			expect(words[0].infos.creationDate).toBe(1355980563534);
			expect(words[0].infos.lastQuizDate).toBe(0);
			expect(words[0].infos.success).toBe(1);
		});
	});

	describe('add', function() {
		var actualLength,
				word,
				text;

		beforeEach(function () {
			actualLength = wordsDataService.get().length;
			word = createWord();
			word.text = text = "test";
			wordsDataService.add(word);
		});

		it('should add the word in memory', function () {
			expect(wordsDataService.get().length).toBe(actualLength + 1);
		});

		it('should add the word at the beginning', function () {
			expect(wordsDataService.get()[0].text).toBe(text);
		});

		it('should add the word to dataStorage', function () {
			expect(setObjectSpy).toHaveBeenCalled();
		});
	});

	describe('addArray', function() {
		var actualLength,
				words;

		beforeEach(function () {
			actualLength = wordsDataService.get().length;
			words = [{}, {}];
			wordsDataService.addArray(words);
		});

		it('should add the words', function () {
			expect(wordsDataService.get().length).toBe(actualLength + 2);
		});

		it('should add the words to dataStorage', function () {
			expect(setObjectSpy).toHaveBeenCalled();
		});
	});

	describe('success methods', function() {
		var actualQuizDate,
				word;
		beforeEach(function () {
			actualQuizDate = 123456;
			word = createWord();
			word.lastQuizDate = actualQuizDate;
			word.success = 2;
		});

		describe('incrementSuccess', function() {
			it('should reset success value to 1 when it is negative', function () {
				word.infos.success = -1;
				wordsDataService.incrementSuccess(word);
				expect(word.infos.success).toBe(1);
			});

			it('should increment success value when it is positive', function () {
				word.infos.success = 1;
				wordsDataService.incrementSuccess(word);
				expect(word.infos.success).toBe(2);
			});

			it('should update the last quiz timestamp value', function () {
				wordsDataService.incrementSuccess(word);
				expect(word.infos.lastQuizDate).toBeGreaterThan(actualQuizDate);
			});
		});

		describe('decrementSuccess', function() {
			it('should reset success value to -1 when it is positive', function () {
				word.infos.success = 2;
				wordsDataService.decrementSuccess(word);
				expect(word.infos.success).toBe(-1);
			});

			it('should decrement success value when it is negative', function () {
				word.infos.success = -1;
				wordsDataService.decrementSuccess(word);
				expect(word.infos.success).toBe(-2);
			});

			it('should update the last quiz timestamp value', function () {
				wordsDataService.decrementSuccess(word);
				expect(word.infos.lastQuizDate).toBeGreaterThan(actualQuizDate);
			});
		});
	});
});
