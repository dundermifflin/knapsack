angular.module('knapsack.profile', ["ui.router"])

.controller('ProfileController', ['$scope', '$uibModal', 'Contents', '$state', 'Profile', function($scope, $uibModal, Contents, $state, Profile) {
  $scope.user = {}

  $scope.loadUser = function() {
    Profile.loadUser()
      .then(function(user) {
        $scope.user = user;
      })
  }

  $scope.loadFriends = function() {
    Contents.getFriends()
      .then(function(users) {
        console.log('FRIENDS:', users)
        $scope.friends = users;
      });
  };


  $scope.processFriend = function(friend) {
    Profile.processFriend(friend).then(function(resp) {
      $state.go('friend', {
        user: JSON.stringify(resp)
      })
    })
  }

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
  $scope.loadUser();
  $scope.loadFriends();
}])

var AboutMeController = function($scope, userForm, Profile, $modalInstance) {
  $scope.form = {};
  $scope.submitAbout = function() {
    console.log('USERFORM?', $scope.user)
    if ($scope.form.userForm.$valid) {
      Profile.addAbout($scope.user.about);
    } else {
      console.log("error submitting form")
    }
    $modalInstance.dismiss("submit");
  }
  $scope.cancel = function() {
    $modalInstance.dismiss("cancel");
  };
}

var FactsController = function($scope, userForm, Profile, $modalInstance) {
  $scope.form = {};
  $scope.submitFacts = function() {
    if ($scope.form.userForm.$valid) {
      Profile.addFacts($scope.user);
    } else {
      console.log('error submitting userFacts')
    }
    $modalInstance.dismiss("submit");
  }
  $scope.cancel = function() {
    $modalInstance.dismiss("cancel");
  };
}

//need about me controller
//need fact controller