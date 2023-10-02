const express = require("express");
const common = require("../Modules/comon");
const Book = require("../models/book");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/books/:id/edit", common.auth, async (req, res) => {
  try {
    const genres = ["Literary Fiction", "Historical Fiction", "Crime and Mystery", "Fantasy"
    , "Romance", "Thriller", "Science Fiction", "Horror", "Biography", "Autobiography", "Classics"
    , "Young Adult", "Children's Fiction", "Contemporary", "Non-Fiction", "Philosophy"
    , "Psychological Thriller", "Dystopian", "Adventure", "Political", "Memoir", "Poetry", "Travel"
    , "Short Stories", "Satire", "Mystery and Detective", "Self-Help", "True Crime", "Urban Fantasy"
    , "Religious and Spiritual", "Science", "Graphic Novel and Comics", "Erotica"
    , "Personal Development", "Detective Fiction", "Children and Young Adult Literature", "Religious"
    , "Psychology", "Health", "Art", "Economics", "Politics", "War Novel", "Education"
    , "Suspense/Thriller", "Nature and Travel", "Literary Criticism", "Romance Novels", "Nature"
    , "Art History", "Epic", "Mythology", "Western", "Multicultural", "Realistic Fiction"
    , "Steampunk", "Cyberpunk"
  ];

    const currentBook = await Book.findOne({ _id: req.params.id });

    res.render("editbook", { book: currentBook , genres });
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).send("Sunucu hatası");
  }
});

async function uploadBookCover(file) {
  const bucket = common.admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET_NAME);
  const blob = bucket.file(file.originalname);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', reject);
    blobStream.on('finish', async () => {
      try {
        const publicUrl = await getDownloadUrl(bucket, file.originalname);
        resolve(publicUrl);
      } catch (error) {
        reject(error);
      }
    });

    blobStream.end(file.buffer);
  });
}

async function getDownloadUrl(bucket, filename) {
  const file = bucket.file(filename);
  const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-17-2025' // Buradaki tarihi istediğiniz bir tarihle değiştirebilirsiniz.
  });
  return url;
}


router.post("/books/:id/edit", common.auth, upload.single('book_image'), async (req, res) => {

  try {
    const currentBook = await Book.findById(req.params.id);

    if (!currentBook) {
      return res.status(404).send("Book not found");
    }

    if (req.file) { 
      const publicUrl = await uploadBookCover(req.file);
      currentBook.book_image = publicUrl;
    }

    currentBook.title = req.body.title;
    currentBook.price = req.body.price;
    currentBook.author = req.body.author;
    currentBook.page_count = req.body.page_count;
    currentBook.points = req.body.points;
    currentBook.description = req.body.description;
    currentBook.publication_date = req.body.publication_date;
    currentBook.last_update = req.body.last_update;
    currentBook.isbn = req.body.isbn;
    currentBook.genres = req.body.genres;

    await currentBook.save();

    console.log("Edited Book ==>", currentBook);
    res.redirect("/library");

  } catch (error) {
    console.error("Error while updating book:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
