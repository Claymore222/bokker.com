const express = require('express');
const common = require("../Modules/comon");
const user = require("../models/user");
const router = express.Router();

router.get("/:id",  async (req, res) => {
  try {
    console.log(req.params.id);
    const currentUser = await user.findOne({ _id: req.params.id});

    const totalCount = await common.Book.countDocuments();

    const books = await common.Book.find({})

    res.render("profile" , { books, user: currentUser,  totalCount });
    console.log("profileGoing-->");
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).send("Sunucu hatası");
  }
});




module.exports = router;