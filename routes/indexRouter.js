const express = require('express');
const common = require("../Modules/comon");
const user = require("../models/user");
const Book = require("../models/book");
const { model } = require('mongoose');
const router = express.Router();
const ejs = require("ejs")
router.get("/", async (req, res) => {
	try {
	const currentUser = await user.findOne({ email: req.session.mail });

	const topRatedBooks = await Book.find().sort({ points: -1 }).limit(3);
	res.render("index" , { user: currentUser  , topRatedBooks} )
	} catch (error) {
		console.error()
	}

	
});

 module.exports = router;