'use strict';

describe('Controller: MainCtrl', function() {

  // load the controller's module
  beforeEach(module('vocabularyAngularApp'));

  var MainCtrl,
	    scope,
	    locationMock;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    locationMock = {
        goBack: jasmine.createSpy()
    };

    MainCtrl = $controller('MainCtrl', {
      $scope: scope= {},
        $location: locationMock
    });
  }));

	describe('back', function() {
		it('should navigate back', function() {
			scope.back();
			expect(locationMock.goBack).toHaveBeenCalled();
		})
	})
});
