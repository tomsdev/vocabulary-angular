'use strict';

//TODO: ajouter des numéros de paginations?

vocabularyAngularApp.filter('pager', function() {
	return function(array, stateProperty, pageSize) {
		if (!(array instanceof Array)) return array;
		if (!stateProperty) {
			throw new Error("Missing pager property");
		}

		var scope = this;
		pageSize = pageSize ? (+pageSize) : 10;

		var paginated = array.slice(0, pageSize);

		console.log(paginated);
		return paginated;
	}
});