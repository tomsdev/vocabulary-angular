'use strict';

vocabularyAngularApp.factory('WordsDataService', function() {

	var words = [
		{w:"car", t:"voiture", d:"lorem ipsum un orem ipsum", pc:50},
		{w:"house", t:"maison", d:"", pc:40},
		{w:"computer", t:"ordinateur", d:"", pc:60},
		{w:"make a bundle", t:"faire de l'argent", d:"lorem ipsum un orem ipsum", pc:0},
		{w:"bike", t:"vélo", d:"lorem ipsum un orem ipsum, lorem ipsum mun orem", pc:100}
	];

	// Public API
	return {
		/**
		 * @returns {Word} Words from the json.
		 */
		get: function() {
			return words;
		},
		orderBy: function(fn) {
			angular.forEach(words, function(word) {
				var groupName = fn(word);

			});
		},
		orderByKnowledge: function(fn) {
			angular.forEach(words, function(word) {
				var groupName = fn(word);

			});
		},
		orderByAlphabetical: function(fn) {
			angular.forEach(words, function(word) {
				var groupName = fn(word);

			});
		}
	};
});
