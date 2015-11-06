//establish database connection

var Sequelize = require("sequelize");
var heroku;

try {
  heroku = require("./localPWD.js");
} catch (err) {
  console.log(err, "... but s'all good");
  // Capture process.env url during node's start up
  heroku = {
    url: process.env.DATABASE_URL
  };
}

var db = new Sequelize(heroku.url, {
  dialect: "postgres",
  dialectOptions: {
    ssl: true
  }
});

module.exports = db;
