'use strict';

/**
 * Filter that allow to paginate an array.
 * todo: add pages with numbers and next/previous
 */
vocabularyAngularApp.filter('pager', function() {
	return function(array, stateProperty, pageSize) {
		if (!(array instanceof Array)) return array;
		if (!stateProperty) {
			throw new Error("Missing pager property");
		}

		var scope = this;
		pageSize = pageSize ? (+pageSize) : 3;

		var paginated = array.slice(0, pageSize);
		return paginated;
	}
});