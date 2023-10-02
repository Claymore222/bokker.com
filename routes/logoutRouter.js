const express = require("express");
const router = express.Router();
const common = require("../Modules/comon");

router.get("/", async (req, res) => {
  const accessToken = req.session.accessToken;
  const decodedAccessToken = common.jwt.decode(accessToken);

  if (!decodedAccessToken || !decodedAccessToken.user_id) {
    return res.redirect("/error/400");
  }

  const user = await common.User.findById(decodedAccessToken.user_id);
  if (!user) {
    return res.redirect("/error/404");
  }

  user.refreshToken = null;
  await user.save();
  delete req.session.accessToken;
  delete req.session.mail;
  res.redirect("/home");
  console.log("Logged out");
});

module.exports = router;
