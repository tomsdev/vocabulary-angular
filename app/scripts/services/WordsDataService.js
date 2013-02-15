'use strict';

/**
 * Data service for the words objects.
 */
vocabularyAngularApp.service('wordsDataService', ['dataStorage', function(dataStorage) {

	var isInit = false,
			dataStore = "wordsdatastore",
			data = {
				words: []
			};

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
				var dataSaved = dataStorage.getObject(dataStore);
				if (dataSaved) {
					data = dataSaved;
				}
				isInit = true;
			}
			return data.words;
		},
		/**
		 * Add the word in the data service.
		 * @param {Word} word
		 */
		add: function(word) {
			data.words.unshift(word);
			this.saveAll();
		},
		/**
		 * Add the words in the data service.
		 * @param {[Word]} newWords
		 */
		addArray: function(newWords) {
			angular.forEach(newWords, function(word) {
				data.words.unshift(word);
			});
			this.saveAll();
		},
		/**
		 * Reset the word success to 1 if it is negative or increment it by one.
		 * @param {Word} word
		 */
		incrementSuccess: function(word) {
			var success = word.infos.success;
			word.infos.success = success < 0 ? 1 : success + 1;
			word.infos.lastQuizDate = getCurrentTimestamp();
			updateWordScore(word);
			this.saveAll();
		},
		/**
		 * Reset the word success to -1 if it is positive or decrement it by one.
		 * @param {Word} word
		 */
		decrementSuccess: function(word) {
			var success = word.infos.success;
			word.infos.success = success > 0 ? -1 : success - 1;
			word.infos.lastQuizDate = getCurrentTimestamp();
			updateWordScore(word);
			this.saveAll();
		},
		/**
		 * Save all changes to the data storage
		 */
		saveAll: function() {
			dataStorage.setObject(dataStore, data);
		}
	};
}]);