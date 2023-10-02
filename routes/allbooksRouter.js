const express = require("express");
const common = require("../Modules/comon");
const user = require("../models/user");
const router = express.Router();

router.get("/user/:email/books", async (req, res) => {
  try {

    const userEmail = req.params.email;

    const booksAddedByUser = await common.Book.find({ added_by: userEmail });
    const currentUser = await user.findOne({ email: req.session.mail });
    const userIsLoggedIn = !!req.session.accessToken;

    res.render("userbooks", {user: currentUser , books: booksAddedByUser , userIsLoggedIn });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Sunucu hatası");
  }
});

module.exports = router;