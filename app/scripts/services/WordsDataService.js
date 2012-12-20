'use strict';

/**
 * Data service for the words objects.
 */
vocabularyAngularApp.service('WordsDataService', function() {

	var isInit = false,
			words = [
				// ad: timestamp date added; qz: timestamp date last time quized; s: nb of quiz sucess without fail
				{w:"car", t:"voiture", d:"", inf:{ad:1355980563534, qz:0, s:1}},
				{w:"house", t:"maison", d:"", inf:{ad:1355980563534, qz:0, s:0}},
				{w:"computer", t:"ordinateur", d:"", inf:{ad:1355980563534, qz:0, s:2}},
				{w:"make a bundle", t:"faire de l'argent", d:"Microsoft made a bundle on Windows 8", inf:{ad:1355980563534, qz:0, s:-1}},
				{w:"bike", t:"vélo", d:"", inf:{ad:1355980563534, qz:0, s:-2}}
			];

	function getCurrentTimestamp() {
		return Date.now();
	}

	// Public API
	return {
		/**
		 * Get the word from the data service.
		 * @returns {Word} Words in json.
		 */
		get: function() {
			if (!isInit) {
				angular.forEach(words, function(word) {
					computeWordScore(word);
				});
				isInit = true;
			}

			return words;
		},
		/**
		 * Add the word in the data service.
		 * @param {Word} word
		 */
		add: function(word) {
			words.unshift(word);
		},
		/**
		 * Add the words in the data service.
		 * @param {[Word]} newWords
		 */
		addArray: function(newWords) {
			angular.forEach(newWords, function(word) {
				words.unshift(word);
			});
		},
		/**
		 * Reset the word success to 1 if it is negative or increment it by one.
		 * @param {Word} word
		 */
		incrementSuccess: function(word) {
			var s = word.inf.s;
			word.inf.s = s < 0 ? 1 : s + 1;
			word.inf.qz = getCurrentTimestamp();
		},
		/**
		 * Reset the word success to -1 if it is positive or decrement it by one.
		 * @param {Word} word
		 */
		decrementSuccess: function(word) {
			var s = word.inf.s;
			word.inf.s = s > 0 ? -1 : s - 1;
			word.inf.qz = getCurrentTimestamp();
		}
	};
});
