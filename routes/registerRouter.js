const express = require("express");
const router = express.Router();
const common = require("../Modules/comon");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


if (!common.admin.apps.length) {
  common.admin.initializeApp({
    credential: common.admin.credential.cert(common.serviceAccount),
  });
}

router.get("/", async (req, res) => {
  try {

    const totalCount = await common.Book.countDocuments();

    const books = await common.Book.find({})

      const userIsLoggedIn = !!req.session.accessToken;
    res.render("register", { books, userIsLoggedIn , totalCount});
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).send("Sunucu hatası");
  }
});

async function getDownloadUrl(bucket, filePath) {
  const file = bucket.file(filePath);

  // İndirme URL'sini al
  const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'  // İstediğiniz bir tarihi seçebilirsiniz.
  });

  return downloadUrl;
}


router.post("/", upload.single("profileImage"), async (req, res) => {
  try {
    
      const { first_name, last_name, email, password } = req.body;

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
          return res.redirect("/register?error=invalid email format");
      }
      
      const oldUser = await common.User.findOne({ email });
      if (oldUser) {
          return res.redirect("/error/409");
      }

      const userRecord = await common.admin.auth().createUser({
          email: email,
          password: password,
      });

      const encryptedPassword = await common.bcrypt.hash(password, 10);

      // Resim dosyasını Firebase Storage'a yükle
      const bucket = common.admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET_NAME);
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream({
          metadata: {
              contentType: req.file.mimetype
          }
      });

      blobStream.end(req.file.buffer);
      blobStream.on('finish', async () => {
        // Doğrudan indirme URL'sini al
        const publicUrl = await getDownloadUrl(bucket, req.file.originalname);
    
        const user = await common.User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
            imageURL: publicUrl 
        });
    
        const accessToken = common.jwt.sign(
            { user_id: user._id, email },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: "2h" }
        );
    
        user.accessToken = accessToken;
        await user.save();
    
        // Konsol çıktıları
        console.log("✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯");
        console.log("Register Info ==>", "NEW REGİSTER ↡");
        console.log("Register Info ==>", first_name);
        console.log("Register Info ==>", last_name);
        console.log("Register Info ==>", email);
        console.log("Register Info ==>", password);
        console.log("Register Info ==>", accessToken);
        console.log("✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯");
    
        res.status(201).redirect("/login");
      });

      blobStream.on('error', (err) => {
          console.log(err);
          res.redirect("/register?error=An error occurred during image upload");
      });
  } catch (err) {
      console.log(err);
      res.redirect("/register?error=An error occurred");
  }
});


module.exports = router;
