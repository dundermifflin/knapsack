angular.module("knapsack", [
    "ui.router",
    "ui.bootstrap",
    "smart-table",
    "knapsack.services",
    "knapsack.main",
    "knapsack.sidebar",
    "knapsack.auth",
    "angular.snackbar",
    "knapsack.profile"
  ])
  .controller('AppController', function($scope, $location, Auth, AUTH_EVENTS) {
    $scope.currentUser = null;
    $scope.isAuthenticated = Auth.isAuthenticated;

    $scope.setCurrentUser = function(user) {
      $scope.currentUser = user;
    };

    $scope.$on(AUTH_EVENTS.logoutSuccess, $scope.setCurrentUser(null));
    $scope.$on(AUTH_EVENTS.notAuthenticated, $location.path('/landing'));
    $scope.$on(AUTH_EVENTS.loginFailed, $location.path('/landing'))
  })
  .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouteProvider) {
    $urlRouteProvider.otherwise("/");


    $stateProvider
      .state("landing", {
        url: "/landing",
        views: {
          "main": {
            templateUrl: "app/landing/landing.html",
            controller: "authController"
          }
        }
      })
      .state("dashboard", {
        url: "/",
        views: {
          "main": {
            templateUrl: "app/dashboard/dashboard.html"
          },
          "main_lists@dashboard": {
            templateUrl: "app/main_lists/main.html",
            controller: "MainController"
          },
          "sidebar@dashboard": {
            templateUrl: "app/sidebar/sidebar.html",
            controller: "SidebarController"
          },
          "header@dashboard": {
            templateUrl: "app/auth/header.html",
            controller: "authController"
          }
        }
      })
      .state("friend", {
        url:"/friend", 
        views:{
          "main": {
            templateUrl: "app/profile/friendView.html",
            controller: "ProfileController"
          },
          "friendsearch@friend": {
            templateUrl: "app/dashboard/friendsearch.html",
            controller: "DropdownCtrl"
          },
          "header@friend": {
            templateUrl: "app/auth/header.html",
            controller: "authController"
          }
        }
      })
      .state("profile", {
        url: "/profile",
        views: {
          "main": {
            templateUrl: "app/profile/profile.html",
            controller: "ProfileController"
          },
          "friendsearch@profile": {
            templateUrl: "app/dashboard/friendsearch.html",
            controller: "DropdownCtrl"
          },
          "header@profile": {
            templateUrl: "app/auth/header.html",
            controller: "authController"
          }
        }
      })
      .state("collection", {
        url: "/collection/:collection",
        views: {
          "friendsearch@collection": {
            templateUrl: "app/dashboard/friendsearch.html",
            controller: "DropdownCtrl"
          },
          "main": {
            templateUrl: "app/dashboard/dashboard.html"
          },
          "main_lists@collection": {
            templateUrl: "app/main_lists/main.html",
            controller: "MainController"
          },
          "sidebar@collection": {
            templateUrl: "app/sidebar/sidebar.html",
            controller: "SidebarController",
          },
          "header@collection": {
            templateUrl: "app/auth/header.html",
            controller: "authController",
          }
        }
      });

  }])
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated'
  })
  .run(['$rootScope', '$urlRouter', '$location', '$state', "AUTH_EVENTS", "Auth", function($rootScope, $state, $urlRouter, $location, AUTH_EVENTS, Auth) {
    $rootScope.$on('$stateChangeStart', function(event, next, $state) {
      // event.preventDefault();
      if ($rootScope.currentUser === null) {
        console.log("no logged in user");
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        $location.path('/landing');
      };
    });
  }]);
