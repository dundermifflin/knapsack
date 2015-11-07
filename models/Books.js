module.exports = function(sequelize, DataTypes) {
	return sequelize.define("Book", {
		title: DataTypes.STRING,
		author: DataTypes.STRING,
    photo_url: DataTypes.STRING,
    summary: DataTypes.TEXT
	}, {
		timestamps: false, // no created or update dates
		underscored: true //automatically attributes should be named with _
	});
};