angular.module('knapsack.profile', ["ui.router"])

.controller('ProfileController', ['$scope', '$uibModal', 'Contents', '$state', 'Profile', function($scope, $uibModal, Contents, $state, Profile) {
      $scope.user = {}

      $scope.loadUser = function() {
        Profile.loadUser()
          .then(function(user) {
            $scope.user = user;
            console.log('USER', user)
          })
      }


  $scope.getPendingBooks = function() {
    Contents.getBooks("pending")
        .then(function(books) {
          $scope.pending = books;
          $scope.pendingCollection = [].concat(books);
        });
    }

      // $scope.loadFriends = function() {
      //   Contents.getFriends($scope.user.user_name)
      //     .then(function(friends) {
      //       console.log('FRIENDS:', friends)
      //       $scope.friends = friends;
      //     });
      // };

      $scope.getUsers = function() {
        console.log('in get users')
        Contents.getUsers()
          .then(function(users) {
            console.log('USERS:', users)
            $scope.users = users
          })
      }

      $scope.processFriend = function(friend) {
        console.log('friend', friend)
        Profile.processFriend(friend).then(function(resp) {
            $state.go('friend')
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

        $scope.photoOpen = function() {
          var modalInstance = $uibModal.open({
            templateUrl: "app/profile/photo.html",
            controller: PhotoController,
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
        $scope.getPendingBooks();
        // $scope.loadFriends();
      }])

    var AboutMeController = function($scope, userForm, Profile, $modalInstance) {
      $scope.form = {};
      $scope.submitAbout = function() {
        console.log('USER', $scope.user)
        if ($scope.form.userForm.$valid) {
          Profile.addAbout($scope.user.user_name, $scope.user);
        } else {
          console.log("error submitting form")
        }
        $modalInstance.dismiss("submit");
      }
      $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
      };
    }

    var PhotoController = function($scope, userForm, Profile, $modalInstance) {
      $scope.form = {};
      $scope.addPhoto = function() {
        if ($scope.form.userForm.$valid) {
          Profile.addPhoto($scope.user);
        } else {
          console.log('error submitting userFacts')
        }
        $modalInstance.dismiss("submit");
      }

    };

  // $scope.loadUser();
  // $scope.loadFriends();

var AboutMeController = function($scope, userForm, Profile, $modalInstance) {
  $scope.form = {};
  $scope.submitAbout = function() {
    console.log('USER',$scope.user)
    if ($scope.form.userForm.$valid) {
      Profile.addAbout($scope.user.user_name, $scope.user);
    } else {
      console.log("error submitting form")
      $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
      };
    }
  }
};

    //need about me controller
    //need fact controller