/**********************************************************************************
 * WEB322 – Assignment 06*
 * I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 * No part  of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 * Name: Wai Yan Ng Student ID: 149637217 Date: 29 Nov 2022
 * Online (Cyclic) Link: red-prickly-prawn.cyclic.app
 *********************************************************************************/

var express = require("express");
var blog_service = require("./blog-service");
var app = express();
var HTTP_PORT = process.env.PORT || 8080;
var path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const upload = multer(); // no {storage:storage} since we are not using disk storage
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const authData = require("./auth-service");
const clientSessions = require("client-sessions");
// handling .hbs extension file
app.engine(
	".hbs",
	exphbs.engine({
		extname: ".hbs",
		helpers: {
			navLink: function (url, options) {
				return (
					"<li" +
					(url == app.locals.activeRoute ? ' class="active" ' : "") +
					'><a href="' +
					url +
					'">' +
					options.fn(this) +
					"</a></li>"
				);
			},
			equal: function (lvalue, rvalue, options) {
				if (arguments.length < 3)
					throw new Error("Handlebars Helper equal needs 2 parameters");
				if (lvalue != rvalue) {
					return options.inverse(this);
				} else {
					return options.fn(this);
				}
			},
			safeHTML: function (context) {
				return stripJs(context);
			},
			formatDate: function (dateObj) {
				let year = dateObj.getFullYear();
				let month = (dateObj.getMonth() + 1).toString();
				let day = dateObj.getDate().toString();
				return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
			},
		},
	})
);
app.set("view engine", ".hbs");

// cloudinary config
cloudinary.config({
	cloud_name: "dyao5bri8",
	api_key: "894474498621689",
	api_secret: "gHlkiAz8phpffKrDOFRHktQBzNc",
	secure: true,
});
// port
function onHttpStart() {
	console.log("Express http server listening on: " + HTTP_PORT);
}
// middleware
app.use(express.static("public"));
app.use(
	clientSessions({
		cookieName: "session",
		secret: "a6_web322",
		duration: 2 * 60 * 1000,
		activeDuration: 1000 * 60,
	})
);
app.use(function (req, res, next) {
	res.locals.session = req.session;
	next();
});
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
	let route = req.path.substring(1);
	app.locals.activeRoute =
		"/" +
		(isNaN(route.split("/")[1])
			? route.replace(/\/(?!.*)/, "")
			: route.replace(/\/(.*)/, ""));
	app.locals.viewingCategory = req.query.category;
	next();
});

// login helper function
function ensureLogin(req, res, next) {
	if (!req.session.user) {
		res.redirect("/login");
	} else {
		next();
	}
}

// routes
// main routes
app.get("/", (req, res) => {
	res.redirect("/blog");
});

app.get("/about", (req, res) => {
	res.render("about");
});

app.get("/blog", async (req, res) => {
	// Declare an object to store properties for the view
	let viewData = {};

	try {
		// declare empty array to hold "post" objects
		let posts = [];

		// if there's a "category" query, filter the returned posts by category
		if (req.query.category) {
			// Obtain the published "posts" by category
			posts = await blog_service.getPublishedPostsByCategory(
				req.query.category
			);
		} else {
			// Obtain the published "posts"
			posts = await blog_service.getPublishedPosts();
		}

		// sort the published posts by postDate
		posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

		// get the latest post from the front of the list (element 0)
		let post = posts[0];

		// store the "posts" and "post" data in the viewData object (to be passed to the view)
		viewData.posts = posts;
		viewData.post = post;
	} catch (err) {
		viewData.message = "no results";
	}

	try {
		// Obtain the full list of "categories"
		let categories = await blog_service.getCategories();

		// store the "categories" data in the viewData object (to be passed to the view)
		viewData.categories = categories;
	} catch (err) {
		viewData.categoriesMessage = "no results";
	}

	// render the "blog" view with all of the data (viewData)
	res.render("blog", { data: viewData });
});

app.get("/posts", ensureLogin, (req, res) => {
	var error = { message: "" };
	var category = Number(req.query.category);
	var minDate = req.query.minDate;
	if (!category && !minDate) {
		blog_service
			.getAllPosts()
			.then((data) => {
				if (data.length > 0) {
					res.render("posts", { data: data });
				} else {
					res.render("posts", { message: "No results" });
				}
			})
			.catch((err) => {
				error.message = err;
				res.render("posts", error);
			});
	} else if (Number.isInteger(category)) {
		blog_service
			.getPostsByCategory(category)
			.then((data) => {
				if (data.length > 0) {
					res.render("posts", { data: data });
				} else {
					res.render("posts", { message: "No results" });
				}
			})
			.catch((err) => {
				error.message = err;
				res.render("posts", error);
			});
	} else if (minDate) {
		blog_service
			.getPostsByMinDate(minDate)
			.then((data) => {
				if (data.length > 0) {
					res.render("posts", { data: data });
				} else {
					res.render("posts", { message: "No results" });
				}
			})
			.catch((err) => {
				error.message = err;
				res.render("posts", error);
			});
	}
});

app.get("/categories", ensureLogin, (req, res) => {
	var error = { message: "" };
	blog_service
		.getCategories()
		.then((data) => {
			if (data.length > 0) {
				res.render("categories", { data: data });
			} else {
				res.render("categories", { message: "No results" });
			}
		})
		.catch((err) => {
			error.message = err;
			res.render("categories", error);
		});
});

// manipulation routes
app.get("/categories/add", ensureLogin, (req, res) => {
	res.render("addCategory");
});

app.post("/categories/add", ensureLogin, (req, res) => {
	blog_service
		.addCategory(req.body)
		.then(() => {
			res.redirect("/categories");
		})
		.catch((err) => res.send(err));
});

app.get("/categories/delete/:id", ensureLogin, (req, res) => {
	blog_service
		.deleteCategoryById(req.params.id)
		.then(() => {
			res.redirect("/categories");
		})
		.catch((err) => {
			res.status(500);
			res.send(err);
		});
});

app.get("/posts/add", ensureLogin, (req, res) => {
	blog_service
		.getCategories()
		.then((data) => {
			res.render("addPost", { categories: data });
		})
		.catch(() => {
			res.render("addPost", { categories: [] });
		});
});

app.post(
	"/posts/add",
	ensureLogin,
	upload.single("featureImage"),
	(req, res) => {
		if (req.file) {
			let streamUpload = (req) => {
				return new Promise((resolve, reject) => {
					let stream = cloudinary.uploader.upload_stream((error, result) => {
						if (result) {
							resolve(result);
						} else {
							reject(error);
						}
					});
					streamifier.createReadStream(req.file.buffer).pipe(stream);
				});
			};

			async function upload(req) {
				let result = await streamUpload(req);
				console.log(result);
				return result;
			}

			upload(req).then((uploaded) => {
				req.body.featureImage = uploaded.url;
			});
		} else {
			req.body.featureImage =
				"https://dummyimage.com/847x320/d9d9d9/545454.jpg";
		}

		blog_service
			.addPost(req.body)
			.then(() => {
				res.redirect("/posts");
			})
			.catch((err) => res.send(err));
	}
);

app.get("/posts/delete/:id", ensureLogin, (req, res) => {
	blog_service
		.deletePostById(req.params.id)
		.then(() => {
			res.redirect("/posts");
		})
		.catch((err) => {
			res.status(500);
			res.send(err);
		});
});

// query routes
app.get("/blog/:id", async (req, res) => {
	// Declare an object to store properties for the view
	let viewData = {};

	try {
		// declare empty array to hold "post" objects
		let posts = [];

		// if there's a "category" query, filter the returned posts by category
		if (req.query.category) {
			// Obtain the published "posts" by category
			posts = await blog_service.getPublishedPostsByCategory(
				req.query.category
			);
		} else {
			// Obtain the published "posts"
			posts = await blog_service.getPublishedPosts();
		}

		// sort the published posts by postDate
		posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

		// store the "posts" and "post" data in the viewData object (to be passed to the view)
		viewData.posts = posts;
	} catch (err) {
		viewData.message = "no results";
	}

	try {
		// Obtain the post by "id"
		viewData.post = await blog_service.getPostById(req.params.id);
	} catch (err) {
		viewData.message = "no results";
	}

	try {
		// Obtain the full list of "categories"
		let categories = await blog_service.getCategories();

		// store the "categories" data in the viewData object (to be passed to the view)
		viewData.categories = categories;
	} catch (err) {
		viewData.categoriesMessage = "no results";
	}

	// render the "blog" view with all of the data (viewData)
	res.render("blog", { data: viewData });
});

app.get("/posts/:id", ensureLogin, (req, res) => {
	var error = { message: "" };
	var id = Number(req.params.id);
	blog_service
		.getPostById(id)
		.then((data) => res.json(data))
		.catch((err) => {
			error.message = err;
			res.json(error);
		});
});

//login routes
app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.post("/register", (req, res) => {
	authData
		.registerUser(req.body)
		.then(() => {
			res.render("register", { successMessage: "User created" });
		})
		.catch((err) => {
			res.render("register", {
				errorMessage: err,
				userName: req.body.userName,
			});
		});
});

app.post("/login", (req, res) => {
	req.body.userAgent = req.get("User-Agent");
	authData
		.checkUser(req.body)
		.then((user) => {
			req.session.user = {
				userName: user.userName, // authenticated user's userName
				email: user.email, // authenticated user's email
				loginHistory: user.loginHistory, // authenticated user's loginHistory
			};
			res.redirect("/posts");
		})
		.catch((err) => {
			res.render("login", { errorMessage: err, userName: req.body.userName });
		});
});

app.get("/logout", (req, res) => {
	req.session.reset();
	res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
	res.render("userHistory");
});

// exception routes
app.use((req, res) => {
	res.status(404);
	res.render("404");
});
// blog logic
blog_service
	.initialize()
	.then(authData.initialize)
	.then(() => app.listen(HTTP_PORT, onHttpStart))
	.catch((err) => console.log(err));
