module.exports = function(sequelize, DataTypes) {
	return sequelize.define("User", {
		user_name: DataTypes.STRING,
		password: DataTypes.STRING,
    about_me: DataTypes.STRING,
    location: DataTypes.STRING,
    age: DataTypes.INTEGER,
    fav_book: DataTypes.STRING,
    fav_author: DataTypes.STRING,
    photo_url: DataTypes.STRING
	}, {
		timestamps: false, // no created or update dates
		underscored: true //automatically attributes should be named with _
	});
};
