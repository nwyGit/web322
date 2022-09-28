/**********************************************************************************
 * WEB322 – Assignment 02*
 * I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 * No part  of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 * Name: Wai Yan Ng Student ID: 149637217 Date: 26 Sep 2022
 * Online (Cyclic) Link: ________________________________________________________
 *********************************************************************************/

var express = require("express");
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

app.listen(HTTP_PORT, onHttpStart);
