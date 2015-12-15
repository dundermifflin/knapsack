angular.module('knapsack.profile', ["ui.router", "twitter.timeline", "knapsack.main"])

.controller('ProfileController', ['$scope', '$uibModal', 'Contents', 'Collections', '$state', 'Profile', function($scope, $uibModal, Contents, Collections, $state, Profile) {
  $scope.user = {};

  $scope.loadUser = function() {
    Profile.loadUser()
      .then(function(user) {
        $scope.user = user;
        console.log('USER', user)
      }).then(function(){
        $scope.getFriends();
      })
  }

  $scope.getPendingBooks = function() {
    console.log('in pending controller')
    Contents.getBooks("pending")
      .then(function(books) {
        $scope.pending = books;
        $scope.pendingCollection = [].concat(books);
      });
  }

  // $scope.loadFriends = function() {
  //   Contents.getFriends($scope.user.user_name)
  //     .then(function(friends) {
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

  $scope.getFriends = function() {
    console.log('in get friendssss')
    Contents.getFriends($scope.user.user_name)
      .then(function(friends) {
        $scope.friends = friends;
      });
  };

  $scope.loadUser();

  $scope.getPendingBooks();

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
  }
  $scope.loadCollections = function() {
    Collections.getAll().then(function(collections) {
      $scope.collections = collections;
    })
  }
  $scope.addBook = function(collection, book) {
    Contents.addBook(collection, book)
      .then(function() {
        console.log('in remove book scope')
        $scope.removeBook(book)
      });
  };

  $scope.removeBook = function(book) {
    Contents.removeBook("pending", {
      title: book.title,
      author: book.author
    }).then(function() {
      $scope.getPendingBooks()
    });
  };
}])


var AboutMeController = function($scope, userForm, Profile, $modalInstance) {
  $scope.form = {};
  $scope.submitAbout = function() {
    console.log('USER', $scope.user)
    if ($scope.form.userForm.$valid) {
      Profile.addAbout($scope.user.user_name, $scope.user);
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
      console.log('error submitting photo')
    }
    $modalInstance.dismiss("submit");
  }

  $scope.cancel = function() {
    $modalInstance.dismiss("cancel");
  };
};
