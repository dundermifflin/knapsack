module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Rating", {
    stars: DataTypes.INTEGER,
    review: DataTypes.TEXT
  }, {
    timestamps: false, // no created or update dates
    underscored: true //automatically attributes should be named with _
  });
};