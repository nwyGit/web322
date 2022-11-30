const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
var userSchema = new Schema({
	userName: { type: String, unique: true },
	password: String,
	email: String,
	loginHistory: [{ dateTime: Date, userAgent: String }],
});
let User; // to be defined on new connection (see initialize)

module.exports.initialize = () => {
	return new Promise((resolve, reject) => {
		let db = mongoose.createConnection(
			"mongodb+srv://dbUser:seneca@senecaweb.hwd28ny.mongodb.net/seneca"
		);
		db.on("error", (err) => {
			reject(err); // reject the promise with the provided error
		});
		db.once("open", () => {
			User = db.model("users", userSchema);
			resolve();
		});
	});
};

module.exports.registerUser = (userData) => {
	return new Promise((resolve, reject) => {
		if (userData.password !== userData.password2)
			reject("Passwords do not match");
		else {
			bcrypt
				.hash(userData.password, 10)
				.then((hash) => {
					let newUser = new User({
						userName: userData.userName,
						password: hash,
						email: userData.email,
						loginHistory: userData.loginHistory,
					});
					newUser
						.save()
						.then(() => {
							resolve();
						})
						.catch((err) => {
							if (err.code === 11000) reject("User Name already taken");
							else reject(`There was an error creating the user: ${err}`);
						});
				})
				.catch((err) => {
					reject(`There was an error encrypting the password: ${err}`);
				});
		}
	});
};

module.exports.checkUser = (userData) => {
	return new Promise((resolve, reject) => {
		User.find({ userName: userData.userName })
			.exec()
			.then((users) => {
				if (!users) reject("Unable to find user: " + userData.userName);
				else {
					bcrypt
						.compare(userData.password, users[0].password)
						.then((result) => {
							if (result) {
								users[0].loginHistory.push({
									dateTime: new Date().toString(),
									userAgent: userData.userAgent,
								});
								User.updateOne(
									{ userName: users[0].userName },
									{ $set: { loginHistory: users[0].loginHistory } }
								)
									.exec()
									.then(() => {
										resolve(users[0]);
									})
									.catch((err) => {
										reject(`There was an error verifying the user: ${err}`);
									});
							} else reject("Incorrect Password for user:" + userData.userName);
						});
				}
			})
			.catch(() => {
				reject("Unable to find user: " + userData.userName);
			});
	});
};
