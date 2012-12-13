'use strict';

vocabularyAngularApp.controller('MainCtrl', function($scope, WordsDataService) {
  $scope.words = WordsDataService.get();
});
