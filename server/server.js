var express = require("express");
var bodyParser = require("body-parser"); // request body parsing middleware (json, url)
var morgan = require("morgan"); // log requests to the console
var request = require("request");
var session = require("express-session");
var db = require("../config/database.js"); // connect to database

var path = require("path");
var _ = require('underscore');
// var Twit = require('Twit');
var bcrypt = require("bcrypt-nodejs"); // hashing passwords
var Promise = require("bluebird"); // for promisification
var app = express();
var port = process.env.PORT || 3000;
var ip = "127.0.0.1";
// var io = require('socket.io')(app);

/************************************************************/
// Initialize Database
/************************************************************/

//Import Models(tables)

var User = db.import(path.join(__dirname, "../models/Users"));
var Collection = db.import(path.join(__dirname, "../models/Collections.js"));
var Book = db.import(path.join(__dirname, "../models/Books.js"));
var Rating = db.import(path.join(__dirname, "../models/Ratings.js"));
var Friend = db.import(path.join(__dirname, "../models/Friends.js"));

//Relationships :
//1.User can have many Collections.
//2.Collections have a many to many relationship with Books through junction table collections_to_books

User.hasMany(Collection);
Collection.belongsToMany(Book, {
  through: "collections_to_books"
});
Book.belongsToMany(Collection, {
  through: "collections_to_books"
});


User.hasMany(User);
User.belongsToMany(User, {
  as: "friends",
  through: "users_to_friends"
});

User.hasMany(Rating);
Book.hasMany(Rating);





//Initialize Database

db.sync()
  .then(function(err) {
    console.log("Database is up and running");
  }, function(err) {
    console.log("An error occurred while creating the database:", err);
  });

/************************************************************/
// CONFIGURE SERVER
/************************************************************/

// Logger for dev environment
app.use(morgan("dev"));

app.use(bodyParser.json());
// Express sessions handles sessions in Express
app.use(session({
  secret: "$#%!@#@@#SSDASASDVV@@@@",
  key: "sid",
  saveUninitialized: true,
  resave: true
}));

// serve up static files
app.use(express.static(__dirname + "/../client"));


/************************************************************/
// AUTHENTICATION ROUTES
/************************************************************/

//Signin post request

app.post("/api/signin", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({
    where: {
      user_name: username
    }
  }).then(function(user) {
    if (user) {
      bcrypt.compare(password, user.password, function(err, success) {
        if (err) return console.log("Error ocurred while comparing password: ", err);
        if (success) {
          req.session.regenerate(function() {
            req.session.user = {
              user_name: username
            };
            res.status(201).send({
              id: req.session.id,
              user: req.session.user.user_name
            });
          });
        } else {
          res.status(200).send("Wrong password");
        }
      });
    } else {
      res.status(200).send("User with username: " + username + " does not exist");
    }
  });
});


//Signup post request
//Note : recommended and bestsellers are created when a new user signs up
app.post("/api/signup", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({
    where: {
      user_name: username
    }
  }).then(function(user) {
    if (!user) {
      var hashing = Promise.promisify(bcrypt.hash); // hashing is a promisified version of bcyrpt hash
      hashing(password, null, null).
      then(function(hash) {
        User.create({
          user_name: username,
          password: hash
        }).then(function(user) {
          req.session.regenerate(function() {
            req.session.user = {
              user_name: username
            };
            Collection.create({
              collection: "recommended"
            }).then(function(collection) {
              user.addCollection(collection);
            });
            Collection.create({
              collection: "bestsellers"
            }).then(function(collection) {
              user.addCollection(collection);
            });
            Collection.create({
              collection: "pending"
            }).then(function(collection) {
              user.addCollection(collection);
            });
            res.status(201).send({
              id: req.session.id,
              user: req.session.user.user_name
            });
          });
        });
      });
    } else {
      console.log("User: " + username + " already exists");
      res.status(200).send("Username is already taken");
    }
  });
});


app.post("/api/logout", function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.error(err);
      res.status(201).send("unable to logout user")
    } else {
      console.log("logout success");
      res.status(200).send("logout success");
    }
  });
});

//**************************************************************
// GET and POST Requests
//**************************************************************

//Following GET request displays all the collections for a given user
//getCollection() function uses established relationship between user and collections to return all collections
//Note : _.map function is required to return array of all collections which can be rendered
//Unit Test : Pass (10/28/2015)

app.get("/api/collections", function(req, res) {
  User.findOne({
    where: {
      user_name: req.session.user.user_name
    }
  }).then(function(user) {
    user.getCollections().then(function(collections) {
      collections = _.map(collections, function(item) {
        return item.collection;
      });
      res.send(collections);
    });
  });

});

//POST request CREATE new collection by using req information
//Unit Test : Pass (10/28/2015)

app.post("/api/collections", function(req, res) {
  User.findOne({
    where: {
      user_name: req.session.user.user_name
    }
  }).then(function(user) {
    Collection.findOne({
      where: {
        user_id: user.id,
        collection: req.body.collection
      }
    }).then(function(collection) {
      if (!collection) {
        Collection.create({
          collection: req.body.collection
        }).then(function(collection) {
          User.findOne({
            where: {
              user_name: req.session.user.user_name
            }
          }).then(function(user) {
            user.addCollection(collection);
            res.status(201).send("succesfully added collection");
          });
        });
      }
    })
  })
});

app.post("/api/collections/delete", function(req, res) {
  User.findOne({
    where: {
      user_name: req.session.user.user_name
    }
  }).then(function(user) {
    Collection.findOne({
      where: {
        user_id: user.id,
        collection: req.body.collection
      }
    }).then(function(collection) {
      collection.destroy().then(function() {
        console.log("destroyed collection: " + req.body.collection);
        res.send("succesfully deleted collection");
      });
    });
  });
});

app.post("/api/collections/share", function(req, res) {
  User.findOne({
    where: {
      user_name: req.session.user.user_name //currently logged in user
    }
  }).then(function(user) {
    Collection.findOne({
      where: {
        user_id: user.id,
        collection: req.body.collection
      }
    }).then(function(collection) {
      collection.getBooks().then(function(books) {
        User.findOne({
          where: {
            user_name: req.body.user //user you are sharing with
          }
        }).then(function(user) {
          Collection.create({
            collection: req.body.collection
          }).then(function(collection) {
            user.addCollection(collection);
            for (var i = 0; i < books.length; i++) {
              Book.create({
                  title: books[i].title,
                  author: books[i].author
                })
                .then(function(book) {
                  collection.addBook(book);
                });
            }
            res.status(201).send("succesfully shared collection");
          });
        });
      });
    });
  });
});

// POST request to GET all books within a collection instance e.g. /api/collection/bestsellers
// Unit Test : Pass (10/28/2015)
// We have to use POST here, because GET requests do not allow data(collection name) to be sent with a request.

app.post("/api/collection/instance", function(req, res) {
  User.findOne({
    where: {
      user_name: req.session.user.user_name
    }
  }).then(function(user) {
    var user_id = user.id;
    Collection.findOne({
      where: {
        collection: req.body.collection,
        user_id: user_id
      }
    }).then(function(collection) {
      if (collection) {
        collection.getBooks().then(function(books) {
          books = _.map(books, function(item) {
            return {
              title: item.title,
              author: item.author
            };
          });
          res.send(books);
        });
      } else {
        res.send([]);
      }
    });
  });
});

//POST request to CREATE new books within a collection instance e.g. /api/collection/collectionname
//Unit Test : Pass (10/28/2015)

app.post("/api/collection", function(req, res) {

  var myBook;
  var myUser;
  User.findOne({
    where: {
      user_name: req.session.user.user_name
    }
  }).then(function(user) {
    var user_id = user.id;
    myUser = user;
    Collection.findOne({
      where: {
        collection: req.body.collection,
        user_id: user_id
      }
    }).then(function(collection) {
      Book.create(req.body.book)
        .then(function(book) {
          myBook = book;
          collection.addBook(book);
        }).then(function() {
          console.log("myBook", myBook);
            Rating.create({stars:0, review: ""})
            .then(function(rating) {
              myBook.addRating(rating);
              myUser.addRating(rating);
              res.status(201).send("succesfully added book", rating);
            });
          });
        });
    });
});

app.post("/api/collection/delete", function(req, res) {
  // NY Times bestsellers arent stored in the database, theyre an
  // an API call (not stored in the DB). If you try to delete a book
  // from the bestsellers collection, the server will crash. This
  // if statement prevents that from happening.
  if (req.body.collection === "bestsellers") {
    console.log("Cant delete from bestsellers");
    return;
  }
  User.findOne({
    where: {
      user_name: req.session.user.user_name
    }
  }).then(function(user) {
    var user_id = user.id;
    Collection.findOne({
      where: {
        collection: req.body.collection,
        user_id: user_id
      }
    }).then(function(collection) {
      collection.getBooks({
        where: {
          title: req.body.book.title
        }
      }).then(function(books) {
        books[0].destroy().then(function() {
          console.log("successfully deleted book");
          res.send("deleted book");
        })
      });
    });
  });
});

//POST request to SHARE book to another user and places book in Recommended collection
//Unit Test : Pass (11/2/2015)

app.post("/api/collection/share", function(req, res) {
  User.findOne({
    where: {
      user_name: req.body.user
    }
  }).then(function(user) {
    var user_id = user.id;
    Collection.findOne({
      where: {
        collection: "pending",  // change to pending
        user_id: user_id
      }
    }).then(function(collection) {
      Book.create(req.body.book)
        .then(function(book) {
          collection.addBook(book);
          res.send("succesfully shared book");
        });
    });
  });
});

//POST request to RATE book

app.post("/api/rateBook", function(req, res) {
  console.log("req.body.book: ", req.body.book);
  console.log("req.body.rating: ", req.body.rating);
  User.findOne({
    where: {
      user_name: req.session.user.user_name
    }
  }).then(function(user) {
    var user_id = user.id;
    Rating.findOne({
      where: {
        user_id: user_id,
      }
    }).then(function(rating) {
      console.log("=================== \nfound this rating: " + rating.stars);
      rating.set("stars", req.body.rating).save();
      console.log("+++++++++++++++++++ \nchagned to this rating: " + rating.stars);
      res.send("succesfully changed book rating to " + req.query.rating);
    });
  });
});


//POST request to add about me section to existing user

app.post("/addAbout", function(req, res) {
  console.log("in server addAbout");
  User.findOne({
    where: {
      user_name: req.query.user_name
    }
  }).then(function(user) {
    console.log('user found')
    user.set({
      about_me: req.query.about_me,
      location: req.query.location,
      age: req.query.age,
      fav_book: req.query.fav_book,
      fav_author: req.query.fav_author,
    }).save();
  })
});

app.post('/addPhoto', function(req,res){
  console.log('in server addPhoto');
  User.findOne({
    where:{
      user_name: req.query.user_name
    }
  }).then(function(user){
    user.set({
      photo_url: req.query.photo_url
    }).save();
  })
})

app.post("/processFriend", function(req, res) {
  console.log("in server processFriend")
  console.log('username', req.query.user_name)
  User.findOne({
    where: {
      user_name: req.query.user_name
    }
  }).then(function(user) {
    console.log('PROCESSUSER:', user.dataValues)
    res.send(user.dataValues)
  });
});

//get all friends for current user

app.get("/api/getFriends", function(req, res){
  User.findOne({
    where:{
      user_name: req.session.user.user_name
    }
  }).then(function(user){
     //Find all of the current users friends
      Friend.findAll({
        where: {
          user_id: user.id
        }
      }).then(function(friendsArray){
        //return only the friend name
        friendsArray = _.map(friendsArray, function(friend){
          return friend.friend_name;
        })
        console.log("freinds array: ", friendsArray);
        res.send(friendsArray);
      });
  })
})


  // Friend.findAll({
  //   where: {
  //     user_id: "8"
  //   }
  // }).then(function(friendsArray){
  //   friendsArray = _.map(friendsArray, function(friend){
  //     return friend.friend_id;
  //   })
  //   console.log("freinds array: ", friendsArray);
  // });


//add freind into database
app.post("/api/addFriend", function(req, res){
  User.findOne({
    where: {
      user_name: req.session.user.user_name
    }
  }).then(function(user){
    var userId= user.id
    User.findOne({
      where: {
        //friend name
        user_name: req.query.friend_name
      }
    }).then(function(friend){
      var friendId = friend.id;
      var friendName = friend.user_name;
      Friend.create({
        user_id: userId,
        friend_name: friendName,
        friend_id: friendId
      }).then(function(friendship){
        res.send("we da best")
      })
    })
  })

});

//GET request to get NYTimes bestsellers for default bestsellers list

app.get("/api/collection/nytimes", function(req, res) {
  request("https://api.nytimes.com/svc/books/v3/lists.json?list-name=hardcover-fiction&api-key=b2f850985c69c53458eac07ce2f7a874%3A7%3A65642337",
    function(err, response, body) {
      if (!err && response.statusCode === 200) {
        var bestsellers = JSON.parse(body);
        bestsellers = _.map(bestsellers.results, function(book) {
          var tableData = {};
          var dat = book.book_details[0];
          tableData.title = dat.title;
          tableData.author = dat.author;
          return tableData;
        });
        res.send(bestsellers);
      } else {
        res.send("failed fetching NYTimes bestsellers");
      }
    });
});

//GET request to get friends from the database

app.get("/api/getUsers", function(req, res) {
  console.log('in get users SERVER')
  User.findAll().then(function(users) {
    users = _.map(users, function(user) {
      return user.user_name;
    });
    res.send(users);
  })
});

//this may need to be changed
// app.get("/api/friends", function(req, res) {
//   console.log("in server GET friends")
//   User.findOne({
//       where: {
//         user_name: req.query.id
//       }
//     })
//     .then(function(user) {
//       friends = _.map(user.friends, function(friend) {
//         return [friend.user_name, friend.photo_url];
//       });
//       res.send(friends);
//     });
// });

//GET request to load all properties of current user

app.get("/api/loadUser", function(req, res) {
  console.log("in server loadUser")
  console.log('SESSION', req.session)
  User.findOne({
    where: {
      user_name: req.session.user.user_name
    }
  }).then(function(user) {
    console.log('result', user)
    res.send(user);
  })
});

/************************************************************/
// HANDLE WILDCARD ROUTES - IF ALL OTHER ROUTES FAIL
/************************************************************/

/************************************************************/
// START THE SERVER
/************************************************************/
app.listen(port);
console.log("Knapsack is listening on port " + port);
