'use strict';

var vocabularyAngularApp = angular.module('vocabularyAngularApp', []);

vocabularyAngularApp.config(function($routeProvider) {
	$routeProvider.when('/quiz', {
		templateUrl: '#quiz',
		onActivate: 'onPageEnter()'
	});
});


