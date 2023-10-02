const express = require("express");
const common = require("../Modules/comon");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", common.auth, async (req, res) => {
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
    const currentUser = await common.User.findOne({ email: req.session.mail });
    let imageUrl = currentUser.imageURL;

    res.render("addbook", {  imageUrl , genres:genres});
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Sunucu hatası");
  }
});

async function getDownloadUrl(bucket, filePath) {
  const file = bucket.file(filePath);

  const [downloadUrl] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2500",
  });

  return downloadUrl;
}

router.post("/", common.auth, upload.single("book_image"), async (req, res) => {
  try {
    console.log("Oturuma eklenen mail bilgisi:", req.session.mail);

    const {
      title,
      author,
      price,
      plot,
      page_count,
      points,
      description,
      publication_date,
      isbn,
      book_image,
    } = req.body;
    let userEmail = req.session.mail;
    const user = await common.User.findOne({ email: userEmail });
    let name = user.first_name + " " + user.last_name;
    let photo = user.imageURL;
    let firsttime = Date.now();
    const bucket = common.admin
      .storage()
      .bucket(process.env.FIREBASE_STORAGE_BUCKET_NAME);
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });
    blobStream.end(req.file.buffer);
    blobStream.on("finish", async () => {
      // Doğrudan indirme URL'sini al
      const imageUrl = await getDownloadUrl(bucket, req.file.originalname);

      const newBook = new common.Book({
        title: title,
        author: author,
        price: price,
        plot: plot,
        page_count: page_count,
        points: points,
        description: description,
        publication_date: publication_date,
        isbn: isbn,
        added_by: userEmail,
        uploader_name: name,
        uploader_photo: photo,
        book_image: imageUrl,
        last_update: Date.now(),
        first_added_time: firsttime,
        genres: req.body.genres,
      });
      await newBook.save();
      console.log(userEmail);
      res.redirect("/library");
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
