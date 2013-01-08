'use strict';

describe('Controller: MainCtrl', function() {

  // load the controller's module
  beforeEach(module('vocabularyAngularApp'));

  var MainCtrl,
	    scope,
	    navigateMock;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
	  navigateMock = jasmine.createSpy();

    MainCtrl = $controller('MainCtrl', {
      $scope: scope= {},
	    $navigate: navigateMock
    });
  }));

	describe('back', function() {
		it('should navigate back', function() {
			scope.back();
			expect(navigateMock).toHaveBeenCalledWith('back');
		})
	})
});
