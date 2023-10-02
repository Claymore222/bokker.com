const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String },
  price: { type: Number },
  author: { type: String },
  plot: { type: String },
  page_count: { type: Number },
  points: { type: Number },
  description: { type: String },
  added_by: { type: String },
  uploader_name: { type: String },
  comment: { type: String },
  publication_date: { type: String },
  first_added_time: { type: String },
  last_update: { type: Date },
  isbn: { type: String },
  book_image: { type: String },
  uploader_photo: { type: String },
  genres: [{ type: String }],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("Book", bookSchema);
