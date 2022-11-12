const Sequelize = require("sequelize");
const { gte } = Sequelize.Op; //Using Sequelize's operators

var sequelize = new Sequelize(
	"zytkmhmf",
	"zytkmhmf",
	"SWfN1lowdWxat97UH6daIdVubpX99V77",
	{
		host: "peanut.db.elephantsql.com",
		dialect: "postgres",
		port: 5432,
		dialectOptions: {
			ssl: { rejectUnauthorized: false },
		},
		query: { raw: true },
	}
);

var Post = sequelize.define("Post", {
	body: Sequelize.TEXT,
	title: Sequelize.STRING,
	postDate: Sequelize.DATE,
	featureImage: Sequelize.STRING,
	published: Sequelize.BOOLEAN,
});

var Category = sequelize.define("Category", {
	category: Sequelize.STRING,
});

Post.belongsTo(Category, { foreignKey: "category" });

module.exports.initialize = function () {
	return new Promise((resolve, reject) => {
		sequelize
			.sync()
			.then(() => {
				resolve();
			})
			.catch(() => {
				reject("Unable to sync the database");
			});
	});
};

module.exports.getAllPosts = function () {
	return new Promise((resolve, reject) => {
		Post.findAll()
			.then((data) => {
				resolve(data);
			})
			.catch(() => {
				reject("No results returned");
			});
	});
};

module.exports.getPublishedPosts = function () {
	return new Promise((resolve, reject) => {
		Post.findAll({ where: { published: true } })
			.then((data) => {
				resolve(data);
			})
			.catch(() => {
				reject("No results returned");
			});
	});
};

module.exports.getCategories = function () {
	return new Promise((resolve, reject) => {
		Category.findAll()
			.then((data) => {
				resolve(data);
			})
			.catch(() => {
				reject("No results returned");
			});
	});
};

module.exports.getPostsByCategory = (categoryPara) => {
	return new Promise((resolve, reject) => {
		Post.findAll({ where: { category: categoryPara } })
			.then((data) => {
				resolve(data);
			})
			.catch(() => {
				reject("No results returned");
			});
	});
};

module.exports.getPostsByMinDate = (minDateStr) => {
	return new Promise((resolve, reject) => {
		Post.findAll({ where: { postDate: { [gte]: new Date(minDateStr) } } })
			.then((data) => {
				resolve(data);
			})
			.catch(() => {
				reject("No results returned");
			});
	});
};

module.exports.getPostById = (idPara) => {
	return new Promise((resolve, reject) => {
		Post.findAll({ where: { id: idPara } })
			.then((data) => {
				resolve(data[0]);
			})
			.catch(() => {
				reject("No results returned");
			});
	});
};

module.exports.getPublishedPostsByCategory = (categoryPara) => {
	return new Promise((resolve, reject) => {
		Post.findAll({
			where: { published: true, category: categoryPara },
		})
			.then((data) => {
				resolve(data);
			})
			.catch(() => {
				reject("No results returned");
			});
	});
};

module.exports.addPost = (postData) => {
	return new Promise((resolve, reject) => {
		postData.published = postData.published ? true : false;
		for (var e in postData) if (e === "") postData[i] = null;
		postData.postDate = new Date();
		Post.create({
			body: postData.body,
			title: postData.title,
			postDate: postData.postDate,
			category: postData.category,
			featureImage: postData.featureImage,
			published: postData.published,
		})
			.then(() => {
				resolve("Post created");
			})
			.catch(() => {
				reject("Unable to create post");
			});
	});
};

module.exports.deletePostById = (idPara) => {
	return new Promise((resolve, reject) => {
		Post.destroy({ where: { id: idPara } })
			.then(() => {
				resolve("Post destroyed");
			})
			.catch(() => {
				reject("Unable to Remove Post / Post not found");
			});
	});
};

module.exports.addCategory = (categoryData) => {
	return new Promise((resolve, reject) => {
		for (var e in categoryData) if (e === "") categoryData[i] = null;
		Category.create({ category: categoryData.category })
			.then(() => {
				resolve("Category created");
			})
			.catch(() => {
				reject("Unable to create category");
			});
	});
};

module.exports.deleteCategoryById = (idPara) => {
	return new Promise((resolve, reject) => {
		Category.destroy({ where: { id: idPara } })
			.then(() => {
				resolve("Category destroyed");
			})
			.catch(() => {
				reject("Unable to Remove Category / Category not found");
			});
	});
};
