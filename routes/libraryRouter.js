const express = require("express");
const common = require("../Modules/comon");
const user = require("../models/user");
const router = express.Router();

const booksPerPage = 4;

router.get("/", async (req, res) => {
  try {
    const genres = [
      "Literary Fiction",
      "Historical Fiction",
      "Crime and Mystery",
      "Fantasy",
      "Romance",
      "Thriller",
      "Science Fiction",
      "Horror",
      "Biography",
      "Autobiography",
      "Classics",
      "Young Adult",
      "Children's Fiction",
      "Contemporary",
      "Non-Fiction",
      "Philosophy",
      "Psychological Thriller",
      "Dystopian",
      "Adventure",
      "Political",
      "Memoir",
      "Poetry",
      "Travel",
      "Short Stories",
      "Satire",
      "Mystery and Detective",
      "Self-Help",
      "True Crime",
      "Urban Fantasy",
      "Religious and Spiritual",
      "Science",
      "Graphic Novel and Comics",
      "Erotica",
      "Personal Development",
      "Detective Fiction",
      "Children and Young Adult Literature",
      "Religious",
      "Psychology",
      "Health",
      "Art",
      "Economics",
      "Politics",
      "War Novel",
      "Education",
      "Suspense/Thriller",
      "Nature and Travel",
      "Literary Criticism",
      "Romance Novels",
      "Nature",
      "Art History",
      "Epic",
      "Mythology",
      "Western",
      "Multicultural",
      "Realistic Fiction",
      "Steampunk",
      "Cyberpunk",
    ];

    let currentUser = null;

    if (req.session.mail) {
      currentUser = await user.findOne({ email: req.session.mail });
    }

    const totalCount = await common.Book.countDocuments();

    const totalPages = Math.ceil(totalCount / booksPerPage);

    const page = parseInt(req.query.page) || 1;

    const { searchTerm, sortBy, order, selectedGenres } = req.query;

    // Arama sorgusu
    let query = {};
    if (searchTerm) {
      query.title = { $regex: new RegExp(searchTerm, 'i') };
    }

    // Tür sorgusu
    if (selectedGenres && Array.isArray(selectedGenres)) {
      query.genres = { $in: selectedGenres };
    }

    let sortQuery = {};
    switch (sortBy) {
      case 'title':
        sortQuery.title = order === 'desc' ? -1 : 1;
        break;
      case 'point':
        sortQuery.points = order === 'desc' ? -1 : 1;
        break;
      case 'year':
        sortQuery.publication_date = order === 'desc' ? -1 : 1;
        break;
      case 'page':
        sortQuery.page_count = order === 'desc' ? -1 : 1;
        break;
      default:
        sortQuery.publication_date = -1;
    }

    const skip = (page - 1) * booksPerPage;
    const books = await common.Book.find(query).sort(sortQuery).limit(booksPerPage).skip(skip);

    res.render("library", {
      books,
      user: currentUser,
      totalPages,
      currentPage: page,
      genres: genres,
    });
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).send("Sunucu hatası");
  }
});

router.delete("/:id", async (req, res, next) => {
  if (!req.session.accessToken) {
    return next({
      status: 403,
      message: "Need To Login",
      code: "NEED_LOGIN",
    });
  }

  const id = req.params.id;

  try {
    const book = await common.Book.findById(id);

    if (!book) {
      return next({
        status: 404,
        message: "Book not found",
        code: "BOOK_NOT_FOUND",
      });
    }

    if (req.session.mail !== book.added_by) {
      return next({
        status: 401,
        message: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }

    await book.deleteOne();

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    next({
      status: 500,
      message: "An error occurred while deleting the book.",
      code: "DELETE_ERROR",
    });
  }
});

module.exports = router;
