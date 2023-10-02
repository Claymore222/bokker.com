const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null 
  },
});

module.exports = mongoose.model("comments", commentsSchema);
