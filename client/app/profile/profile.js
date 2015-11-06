angular.module('knapsack.profile', ["ui.router"])

.controller('ProfileController', ['$scope', '$uibModal', function($scope, $uibModal) {

  $scope.aboutMeOpen = function() {
    var modalInstance = $uibModal.open({
      templateUrl: "app/profile/about-me.html",
      controller: AboutMeController,
      size: "modal-xs",
      scope: $scope,
      resolve: {
        userForm: function() {
          return $scope.userForm;
        }
      }
    });
  };

  $scope.factsOpen = function() {
    var modalInstance = $uibModal.open({
      templateUrl: "app/profile/facts.html",
      controller: FactsController,
      size: "modal-xs",
      scope: $scope,
      resolve: {
        userForm: function() {
          return $scope.userForm;
        }
      }
    });
  };

}])


var AboutMeController = function($scope, userForm, Profile) {
  $scope.form = {};
  $scope.submitForm = function() {
    if ($scope.form.userForm.$valid) {
      Profile.addAbout(userAbout);
    } else {
      console.log("error submitting form")
    }
  }
}

var FactsController = function($scope, userForm, Profile) {
  $scope.form = {};
  var facts = {
    location: $scope.user.location,
    age: $scope.user.age,
    favBook: $scope.user.favBook,
    favAuthor: $scope.user.favAuthor
  };

  if ($scope.form.userForm.$valid) {
    Profile.addFacts(JSON.stringify(facts));
  } else {
    console.log('error submitting userFacts')
  }
}

//need about me controller
//need fact controller