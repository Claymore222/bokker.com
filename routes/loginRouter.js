const express = require("express");
const common = require("../Modules/comon");
const router = express.Router();

router.get("/", async (req, res) => {
  try {

    const totalCount = await common.Book.countDocuments();

    const books = await common.Book.find({})

      const userIsLoggedIn = !!req.session.accessToken;
    res.render("loging", { books, userIsLoggedIn , totalCount});
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).send("Sunucu hatası");
  }
});

if (!common.admin.apps.length) {
  common.admin.initializeApp({
    credential: common.admin.credential.cert(common.serviceAccount),
  });
}

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      res.redirect("/error/400");
    }
    const user = await common.User.findOne({ email });
    if (user && (await common.bcrypt.compare(password, user.password))) {
      const firebaseUser = await common.admin.auth().getUserByEmail(email);
      const customToken = await common.admin
        .auth()
        .createCustomToken(firebaseUser.uid);
      const accessToken = common.jwt.sign(
        { user_id: user._id, email },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: "20s" }
      );
      const refreshToken = common.jwt.sign(
        { user_id: user._id, email },
        process.env.REFRESH_TOKEN_KEY,
        { expiresIn: "2h" }
      );

      user.refreshToken = refreshToken;
      await user.save();

      req.session.accessToken = accessToken;
      req.session.mail = email;
      console.log(user._id);
      console.log(user);
      try {
        console.log("Oturuma eklenen mail bilgisi:", req.session.mail);
        res.status(200).redirect("/home");
      } catch (error) {
        res.redirect("/error/404");
      }
    } else {
      res.redirect("/login?error=Invalid%20Credentials");
    }
  } catch (err) {
    console.error("Login error:", err.message);
    res.redirect();
  }
});

module.exports = router;
