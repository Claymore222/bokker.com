const express = require("express");
const common = require("../Modules/comon");
const Comment = require("../models/comments");
const User = require("../models/user");
const { auth } = require("firebase-admin");
const router = express.Router();
const moment = require('moment');

router.get("/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    const currentUser = await User.findOne({ email: req.session.mail });
    const book = await common.Book.findById(bookId).populate({
      path: 'comments',
      model: 'comments',
      populate: {
        path: 'user',
        model: 'user',
      }
    });
    const uploader = await User.findOne({ email: book.added_by })
    const userIsLoggedIn = !!req.session.accessToken;
    const comments = await Comment.findById(req.params.id);
    if (!book) {
      return res.status(404);
    }
    res.render("bookDetail", { book, user: currentUser, userIsLoggedIn: userIsLoggedIn, isBookPage: true, bookId, comments, moment, uploader });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/:id/addComment', common.auth, async (req, res) => {
  const bookId = req.params.id;
  const currentUser = await User.findOne({ email: req.session.mail });

  const parentCommentId = req.body.parentCommentId || null;

  const comment = new Comment({
    text: req.body.comment,
    post: bookId,
    user: currentUser._id,
    parentCommentId: parentCommentId,
  });

  await comment.save();

  const postRelated = await common.Book.findById(bookId);

  if (!postRelated) {
    return res.status(404).send("Book not found");
  }

  postRelated.comments.push(comment);

  try {
    await postRelated.save();
    res.redirect('/');
  } catch (error) {
    console.error("Error saving post related:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;