//build tables

var db = require("./database.js");
var Sequelize = require("sequelize");

var ddl = {};

ddl.users = db.define("users", {

  user_name: {
    type: Sequelize.STRING,
    description: Sequelize.TEXT
  },

  password: {
    type: Sequelize.STRING,
    description: Sequelize.TEXT
  },

  about_me: {
    type: Sequelize.STRING,
    description: Sequelize.TEXT
  },

  facts: {
    type: Sequelize.STRING,
    description: Sequelize.TEXT
  },

  photo_url: {
    type: Sequelize.STRING,
    description: Sequelize.TEXT
  },

  freezeTableName: true
  //prevents sequelize from adding (s) to end of table
});

ddl.friends = db.define("friends", {

  freezeTableName: true

});



ddl.collections = db.define("collections", {

  collection: {
    type: Sequelize.STRING,
    description: Sequelize.TEXT
  },

  freezeTableName: true

});

ddl.books = db.define("books", {

  title: {
    type: Sequelize.STRING,
    description: Sequelize.TEXT
  },

  author: {
    type: Sequelize.STRING,
    description: Sequelize.TEXT
  },

  freezeTableName: true

});





///Set Up Relationships
ddl.users.hasMany(ddl.collections, {as: 'collection'});
ddl.users.hasMany(ddl.friends, {as: 'friends'});
ddl.collections.belongsToMany(ddl.books, {through : 'collections_to_books'});
ddl.books.belongsToMany(ddl.collections, {through : 'collections_to_books'});

module.exports = ddl;

