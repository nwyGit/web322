const fs = require("fs");

var posts = [],
	categories = [];

module.exports.initialize = function () {
	return new Promise((resolve, reject) => {
		fs.readFile(__dirname + "/data/posts.json", "utf8", (err, data) => {
			if (err) reject("unable to read file");
			posts = JSON.parse(data);
			fs.readFile(__dirname + "/data/categories.json", "utf8", (err, data) => {
				if (err) reject("unable to read file");
				categories = JSON.parse(data);
			});
		});
		resolve();
	});
};

module.exports.getAllPosts = function () {
	return new Promise((resolve, reject) => {
		if (posts.length > 0) {
			resolve(posts);
		} else {
			reject("no results returned");
		}
	});
};
module.exports.getPublishedPosts = function () {
	var result = posts.filter((obj) => obj.published === true);
	return new Promise((resolve, reject) => {
		if (result.length > 0) {
			resolve(result);
		} else {
			reject("no result returned");
		}
	});
};
module.exports.getCategories = function () {
	return new Promise((resolve, reject) => {
		if (categories.length > 0) {
			resolve(categories);
		} else {
			reject("no result returned");
		}
	});
};
