const express = require("express");
const common = require("../Modules/comon");
const user = require("../models/user");
const Book = require("../models/book");
const router = express.Router();

router.get("/user/favorites", async (req, res) => {
   try {
      const userEmail = req.session.mail;
      const userObj = await user.findOne({ email: userEmail }).populate('favoriteBooks');
      const userIsLoggedIn = !!req.session.accessToken;
      const currentUser = await user.findOne({ email: req.session.mail });
      res.render("favorities", { books: userObj.favoriteBooks , userIsLoggedIn , user:currentUser});
   } catch (error) {
      console.error("Favori kitapları alırken bir hata oluştu:", error);
      res.status(500).send("Internal Server Error");
   }
});

router.post("/addfavorite", async (req, res) => {
   const bookId = req.body.bookId;
   const userEmail = req.session.mail;
               
   try {
      const userObj = await user.findOne({ email: userEmail });
      if (!userObj.favoriteBooks.includes(bookId)) {
         userObj.favoriteBooks.push(bookId);
         await userObj.save();
         res.json({ success: true });
      } else {
         res.json({ success: false, message: "Kitap zaten favorilere eklenmiş!" });
      }
   } catch (err) {
      res.status(500).json({ success: false });
   }
});

router.post("/removefavorite", async (req, res) => {
   const bookId = req.body.bookId;
   const userEmail = req.session.mail;
   const userObj = await user.findOne({ email: userEmail });

   if (!userObj) {
       return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı!" });
   }

   const index = userObj.favoriteBooks.indexOf(bookId);
   if (index !== -1) {
       userObj.favoriteBooks.splice(index, 1);
       await userObj.save();
       return res.json({ success: true });
   } else {
       return res.json({ success: false, message: "Bu kitap favorilerde değil!" });
   }
});

module.exports = router;