const fs = require("fs");

var posts = [],
	categories = [];

module.exports.initialize = function () {
	return new Promise((resolve, reject) => {
		fs.readFile(__dirname + "/data/posts.json", "utf8", (err, data) => {
			if (err) reject("unable to read file");
			if (data.length > 0) {
				posts = JSON.parse(data);
			}
			fs.readFile(__dirname + "/data/categories.json", "utf8", (err, data) => {
				if (err) reject("unable to read file");
				if (data.length > 0) {
					categories = JSON.parse(data);
				}
			});
		});
		resolve();
	});
};

module.exports.getAllPosts = function () {
	return returnPromise(posts, "No results returned");
};

module.exports.getPublishedPosts = function () {
	var result = posts.filter((obj) => obj.published === true);
	return returnPromise(result, "No results returned");
};

module.exports.getCategories = function () {
	return returnPromise(categories, "No results returned");
};

module.exports.addPost = (postData) => {
	return new Promise((resolve, reject) => {
		if (postData.published === undefined) {
			postData.published = false;
		} else {
			postData.published = true;
		}
		postData.id = posts.length + 1;
		posts.push(postData);
		if (postData) {
			resolve(postData);
		} else {
			reject("the object is not valid");
		}
	});
};

module.exports.getPostsByCategory = (category) => {
	var result = posts.filter((obj) => obj.category === category);
	return returnPromise(result, "No results returned");
};

module.exports.getPostsByMinDate = (minDateStr) => {
	const date = minDateStr.split("-");
	var result = posts.filter((obj) => {
		const objDate = obj.postDate.split("-");
		return objDate[0] >= date[0] &&
			objDate[1] >= date[1] &&
			objDate[2] >= date[2]
			? true
			: false;
	});
	return returnPromise(result, "No results returned");
};

module.exports.getPostById = (id) => {
	var result = posts.filter((obj) => obj.id === id);
	return returnPromise(result, "No results returned");
};

module.exports.getPublishedPostsByCategory = (category) => {
	var result = posts.filter(
		(obj) => obj.published === true && posts.category === category
	);
	return returnPromise(result, "No results returned");
};

function returnPromise(result, msg) {
	return new Promise((resolve, reject) => {
		if (result.length > 0) {
			resolve(result);
		} else {
			reject(msg);
		}
	});
}
