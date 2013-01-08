'use strict';

describe('Model: Word', function () {

	// load the service's module
	beforeEach(module('vocabularyAngularApp'));

	describe('properties', function() {

		var word;
		beforeEach(function () {
			word = createWord();
		});

		it('should have a property text', function () {
			expect(word.text).toBe("");
		});

		it('should have a property translation', function () {
			expect(word.translation).toBe("");
		});

		it('should have a property description', function () {
			expect(word.description).toBe("");
		});

		it('should have a property infos', function () {
			expect(word.infos).toBeDefined();
		});

		it('should have a property infos.creationDate', function () {
			expect(word.infos.creationDate).toBe(0);
		});

		it('should have a property infos.lastQuizDate', function () {
			expect(word.infos.lastQuizDate).toBe(0);
		});

		it('should have a property infos.success', function () {
			expect(word.infos.success).toBe(0);
		});

		it('should have a property infos.score', function () {
			expect(word.infos.score).toBe(0);
		});
	});
});
