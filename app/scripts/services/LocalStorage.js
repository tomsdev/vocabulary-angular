'use strict';

/**
 * Wrapper of localStorage HTML5 API with methods to add and get
 * simple values or objects via JSON serialization.
 */
vocabularyAngularApp.service('dataStorage', function() {

	// Public API
	return {
		getValue: function(key) {
			return localStorage.getItem(key);
		},
		setValue: function(key, val) {
			//try {
				localStorage.setItem(key, val);
//			catch(e) {
//				console.log("data not saved in local storage, error given: " + e);
//			}
		},
		getObject: function(key) {
			var json = this.getValue(key);
			return JSON.parse(json);
		},
		setObject: function(key, obj) {
			var json = JSON.stringify(obj);
			this.setValue(key, json);
		},
		removeItem: function(key) {
			localStorage.removeItem(key);
		}
	};
});


