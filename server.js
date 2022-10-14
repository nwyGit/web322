/**********************************************************************************
 * WEB322 – Assignment 03*
 * I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 * No part  of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 * Name: Wai Yan Ng Student ID: 149637217 Date: 13 Oct 2022
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

//cloudinary config
cloudinary.config({
	cloud_name: "dyao5bri8",
	api_key: "894474498621689",
	api_secret: "gHlkiAz8phpffKrDOFRHktQBzNc",
	secure: true,
});

function onHttpStart() {
	console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));

app.get("/", (req, res) => {
	res.redirect("/about");
});

app.get("/about", (req, res) => {
	res.sendFile(__dirname + "/views/about.html");
});

app.get("/blog", (req, res) => {
	var error = { message: "" };
	blog_service
		.getPublishedPosts()
		.then((data) => res.send(data))
		.catch((err) => {
			error.message = err;
			res.json(error);
		});
});

app.get("/posts", (req, res) => {
	var error = { message: "" };
	var category = Number(req.query.category);
	var minDate = req.query.minDate;
	if (!category && !minDate) {
		blog_service
			.getAllPosts()
			.then((data) => res.send(data))
			.catch((err) => {
				error.message = err;
				res.json(error);
			});
	} else if (Number.isInteger(category)) {
		blog_service
			.getPostsByCategory(category)
			.then((data) => {
				res.json(data);
			})
			.catch((err) => {
				error.message = err;
				res.json(error);
			});
	} else if (minDate) {
		blog_service
			.getPostsByMinDate(minDate)
			.then((data) => res.json(data))
			.catch((err) => {
				error.message = err;
				res.json(error);
			});
	}
});

app.get("/categories", (req, res) => {
	var error = { message: "" };
	blog_service
		.getCategories()
		.then((data) => res.send(data))
		.catch((err) => {
			error.message = err;
			res.json(error);
		});
});

app.get("/posts/add", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
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
		req.body.featureImage = "";
	}

	blog_service
		.addPost(req.body)
		.then(() => {
			res.redirect("/posts");
		})
		.catch((msg) => res.send(msg));
});

app.get("/posts/:id", (req, res) => {
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

app.use((req, res) => {
	res.status(404).send("Page Not Found");
});

blog_service
	.initialize()
	.then(() => app.listen(HTTP_PORT, onHttpStart))
	.catch((err) => console.log(err));
