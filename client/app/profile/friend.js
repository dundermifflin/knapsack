angular.module('knapsack.friend', ["ui.router"])
  .controller('FriendController', ['$scope', '$uibModal', 'Contents', '$state', 'Profile', function($scope, $uibModal, Contents, $state, Profile) {

    $scope.user = Profile.friendDisplay.data;
    $scope.isFriend = false; //if this is true than show the addFriend button in friendView.html

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
        $state.go('friend', {
          user: JSON.stringify(resp)
        }, {
          location: "replace"
        })
      })
    }

    $scope.addFriend = function(friend_name) {
      Profile.addFriend(friend_name).then(function(resp) {
        console.log("hello")
      })
    }

    $scope.getAllFriends = function() {
      Contents.getFriends().then(function(resp) {
        console.log("friends array: ", resp)
        resp.forEach(function(item) {
          if (item === $scope.user.user_name) {
            $scope.isFriend = true;
          }
        });
      });
    }

    $scope.getAllFriends();

  }])
