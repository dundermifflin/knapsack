angular.module('knapsack.profile', ["ui.router", "twitter.timeline"])

.controller('ProfileController', ['$scope', '$uibModal', 'Collections','Contents', '$state', 'Profile', function($scope, $uibModal, Collections, Contents, $state, Profile) {
    $scope.user = {}



    $scope.loadUser = function() {
        Profile.loadUser()
            .then(function(user) {
                $scope.user = user;
                console.log('USER', user)
            })
    }

    $scope.loadCollections = function() {
        Collections.getAll().then(function(collections){
          $scope.collections= collections;
        })
    }
    $scope.addBook = function(collection, book) {
        Contents.addBook(collection, book)
            .then(function() {
                console.log('in remove book scope')
                $scope.removeBook(book)
            });
        // $scope.newBook.title = "";
    };

    $scope.removeBook = function(book) {
        Contents.removeBook("pending", {
            title: book.title,
            author: book.author
        }).then(function() {
            $scope.getPendingBooks()
        });
    };

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
            console.log('error submitting photo')
        }
        $modalInstance.dismiss("submit");
    }

    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
}

//need about me controller
//need fact controller
