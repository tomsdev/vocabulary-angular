'use strict';

describe('Controller: ListCtrl', function() {

  // load the controller's module
  beforeEach(module('vocabularyAngularApp'));

  var ListCtrl,
      scope,
	    wordsDataServiceMock;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
	  wordsDataServiceMock = {
		  get: function() {
			  return [{}, {}];
		  }
	  };

    scope = {};
    ListCtrl = $controller('ListCtrl', {
      $scope: scope,
	    WordsDataService: wordsDataServiceMock
    });
  }));

  it('should attach a list of word', function() {
    expect(scope.words.length).toBe(2);
  });
});
