module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Friend", {}, {
    timestamps: false, // no created or update dates
    underscored: true //automatically attributes should be named with _
  });
};