'use strict';

vocabularyAngularApp.factory('WordsDataService', function() {

	var words = [
		{w:"car", t:"voiture", d:"lorem ipsum un orem ipsum"},
		{w:"house", t:"maison", d:""},
		{w:"computer", t:"ordinateur", d:""},
		{w:"make a bundle", t:"faire de l'argent", d:"lorem ipsum un orem ipsum"},
		{w:"bike", t:"vélo", d:"lorem ipsum un orem ipsum, lorem ipsum mun orem"}
	];

	// Public API
	return {
		/**
		 * @returns {Word} Words from the json.
		 */
		get: function() {
			return words;
		}
	};
});
