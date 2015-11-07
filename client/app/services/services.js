angular.module("knapsack.services", [])
  .service("Session", function() {
    this.create = function(sessionId, username) {
      this.id = sessionId;
      this.username = username;
    };
    this.destroy = function() {
      this.id = null;
      this.username = null;
    };
  })
  .factory("Auth", ["$http", "Session", function($http, Session) {
    var signUp = function(user) {
      return $http({
        method: "POST",
        url: "api/signup",
        data: user
      }).then(function succesCallback(resp) {
        console.log("signup resposne", resp.data);
        if (resp.data.constructor === String && resp.data.search("already taken") > 0) {
          return ("already exists");
        } else {
          Session.create(resp.data.id, resp.data.user);
          return resp.data.user;
        }
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed to signup user");
        return resp;
      });
    };

    var signIn = function(user) {
      return $http({
        method: "POST",
        url: "api/signin",
        data: user
      }).then(function succesCallback(resp) {
        if (resp.data === "Wrong password" || resp.data.constructor === String) {
          return resp.data;
        }
        Session.create(resp.data.id, resp.data.user);
        return resp.data.user;
      }, function errorCallback(resp) {
        console.log(resp.status + ": incorrect username or password");
        return resp;
      });
    };

    var logOut = function(user) {
      return $http({
        method: "POST",
        url: "api/logout",
        data: JSON.stringify({
          user: user
        })
      }).then(function succesCallback(resp) {
        Session.destroy();
        return resp;
      }, function errorCallback(resp) {
        console.log(resp.status + ": unable to logout");
        return resp;
      });
    };

    var isAuthenticated = function() {
      return !!Session.username;
    };

    return {
      signIn: signIn,
      signUp: signUp,
      isAuthenticated: isAuthenticated,
      logOut: logOut
    };

  }])

.factory("Profile", function($http, $state) {

    var friendDisplay={
      data:{}
    }

    var loadUser = function() {
      console.log('in service load user')
      return $http({
        method: 'GET',
        url: "api/loadUser"
      }).then(function(resp) {
        console.log('friend data', resp.data)
        return resp.data
      })
    }

    var addAbout = function(name, user) {
      console.log('in addAbout service')
      console.log('NAME:', name)
      console.log('USER', user)
      return $http({
          method: 'POST',
          url: "/addAbout",
          params: {
            user_name: name,
            about_me: user.about_me,
            location: user.location,
            age: user.age,
            fav_book: user.fav_book,
            fav_author: user.fav_author
          }
        })
        // .then(function success(resp){
        //   console.log(resp.status + ':successfully added About section to database');
        // })
    }

    var addFriend = function(currentUser, friend) {
      return $http({
        method: 'POST',
        url: "/addFriend",
        params: {
          currentUser: currentUser,
          friend: friend
        }
      }).then(function(resp){
        console.log('response from add friend: ', resp.data) //possibly change this to resp.header
        return resp.data
      })
    }

    var processFriend = function(friend) {
      console.log('servicesFriend', friend)
      return $http({
        method: 'POST',
        url: "/processFriend",
        params: {
          user_name: friend
        }
      }).then(function(resp) {
        console.log('PROCESS FRIEND SERVICES', resp.data )
        friendDisplay.data = resp.data
        console.log('friendDisplayservices', friendDisplay)
        return resp.data
      })
    }

    var addPhoto = function(user) {
      console.log('in addFact service')
      return $http({
        method: 'POST',
        url: '/addPhoto',
        params: {
          user_name: user.user_name,
          photo_url: user.photo_url,
        }
      })
    }

    return {
      friendDisplay: friendDisplay,
      addAbout: addAbout,
      processFriend: processFriend,
      loadUser: loadUser,
      addPhoto: addPhoto
    }
  })
  .factory("Collections", ["$http", "snackbar", "Utils", function($http, snackbar, Utils) {

    // get all collection names (ex. bestsellers, wine, ...)
    var getAll = function() {
      return $http({
        method: "GET",
        url: "api/collections"
      }).then(function succesCallback(resp) {
        console.log(resp.status + ":successfully fetched all collections");
        return resp.data;
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed fetching collections from server");
      });
    };

    // add a new collection (ex. boats) to the current user
    var addCollection = function(collection) {
      return $http({
        method: "POST",
        url: "api/collections",
        data: JSON.stringify({
          collection: collection
        })
      }).then(function succesCallback(resp) {
        console.log(resp.status + ": succesfully added Collection");
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed adding Collection");
      });
    };

    //remove a collection from the collection list for current user
    var removeCollection = function(collection) {
      return $http({
        method: "POST",
        url: "api/collections/delete",
        data: JSON.stringify({
          collection: collection
        })
      }).then(function succesCallback(resp) {
        console.log(resp.status + ": succesfully deleted Collection");
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed deleting Collection");
      });
    };

    var shareCollection = function(collection, user) {
      return $http({
        method: "POST",
        url: "api/collections/share",
        data: JSON.stringify({
          collection: collection,
          user: user
        })
      }).then(function succesCallback(resp) {
        snackbar.create("Shared " + Utils.properCaps(collection) + " with " + Utils.properCaps(user) + "!", 3000);
        console.log(resp.status + ": succesfully shared collection");
      }, function errorCallback(resp) {
        console.log(resp.status + ": failed sharing collection");
      });
    };

    return {
      getAll: getAll,
      addCollection: addCollection,
      removeCollection: removeCollection,
      shareCollection: shareCollection
    };

  }])
  .factory("Contents", ["$http", "Utils", "snackbar", function($http, Utils, snackbar) {
    //Molly's NYTimes Bestsellers API key / URI.
    //http://api.nytimes.com/svc/books/v3/lists.json?list-name=hardcover-fiction&api-key=b2f850985c69c53458eac07ce2f7a874%3A7%3A65642337

    var getNytimes = function() {
      return $http({
          method: "GET",
          url: "api/collection/nytimes"
        })
        .then(function(resp) {
          return resp.data;
        });
    };

    var getBooks = function(collection) {
      return $http({
          method: "POST",
          url: "/api/collection/instance",
          data: JSON.stringify({
            collection: collection
          })
        })
        .then(function succesCallback(resp) {
          return resp.data;
        }, function errorCallback(resp) {
          console.log(resp.status + ": failed loading books for collection " + collection);
        });
    };

    var addBook = function(collection, book) {
      return $http({
          method: "POST",
          url: "/api/collection",
          data: JSON.stringify({
            collection: collection,
            book: book
          })
        })
        .then(function succesCallback(resp) {
          console.log("succesfully saved book into: " + collection);
        }, function errorCallback(resp) {
          console.log(resp.status + ": failed adding book to collection");
        });
    };

    var removeBook = function(collection, book) {
      return $http({
          method: "POST",
          url: "/api/collection/delete",
          data: JSON.stringify({
            collection: collection,
            book: book
          })
        })
        .then(function succesCallback(resp) {
          console.log("succesfully deleted book from: " + collection);
        }, function errorCallback(resp) {
          console.log("failed deleting book from: " + collection);
        });
    };

    var shareBook = function(collection, book, user) {
      return $http({
          method: "POST",
          url: "/api/collection/share",
          data: JSON.stringify({
            collection: collection,
            book: book,
            user: user
          })
        })
        .then(function succesCallback(resp) {
          snackbar.create("Shared " + Utils.properCaps(book.title) + " with " + Utils.properCaps(user) + "!", 3000);
          console.log("succesfully shared book to user: " + user);
        }, function errorCallback(resp) {
          console.log(resp.status + ": failed sharing book with user: " + user);
        });
    };


    var getUsers = function() {
      return $http({
          method: "GET",
          url: "/api/getUsers"
        })
        .then(function succesCallback(resp) {
          console.log('serviceFriends', resp.data)
          return resp.data;
        }, function errorCallback(resp) {
          console.log(resp.status + ": failed loading friends");
        });
    };

    // var getFriends = function(username) {
    //   return $http({
    //     method: "GET",
    //     url: "/api/friends", 
    //     params:{
    //       name: username
    //     }
    //   }).then(function(resp) {
    //     return resp.data
    //   })
    // }

    return {
      getBooks: getBooks,
      addBook: addBook,
      removeBook: removeBook,
      getNytimes: getNytimes,
      getUsers: getUsers,
      // getFriends: getFriends,
      shareBook: shareBook
    };

  }])
  .factory("Utils", ["$http", "$window", function($http, $window) {

    var properCaps = function(string) {
      var tempArr = string.split(" ");
      var returnArray = [];

      tempArr.forEach(function(word) {
        var tempWord = '';
        tempWord += word.slice(0, 1).toUpperCase();
        tempWord += word.slice(1).toLowerCase();
        returnArray.push(tempWord);
      });
      return returnArray.join(' ');
    };

    return {
      properCaps: properCaps
    };

  }]);