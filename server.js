/**********************************************************************************
 * WEB322 – Assignment 02*
 * I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 * No part  of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 * Name: Wai Yan Ng Student ID: 149637217 Date: 26 Sep 2022
 * Online (Cyclic) Link: ________________________________________________________
 *********************************************************************************/

var express = require("express");
var blog_service = require("./blog-service.js");
var app = express();
var HTTP_PORT = process.env.PORT || 8080;

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
			res.send(error);
		});
});

app.get("/posts", (req, res) => {
	var error = { message: "" };
	blog_service
		.getAllPosts()
		.then((data) => res.send(data))
		.catch((err) => {
			error.message = err;
			res.send(error);
		});
});

app.get("/categories", (req, res) => {
	var error = { message: "" };
	blog_service
		.getCategories()
		.then((data) => res.send(data))
		.catch((err) => {
			error.message = err;
			res.send(error);
		});
});

app.use((req, res) => {
	res.status(404).send("Page Not Found");
});

blog_service
	.initialize()
	.then(() => app.listen(HTTP_PORT, onHttpStart))
	.catch((err) => console.log(err));
