const express = require('express');
const router = express.Router();
const common = require('../Modules/comon');

router.post("/", async  (req,res) => {
    console.log("refresh'leniyorsunu")
   const { refreshToken } = req.body;
   if (!refreshToken) {
       return res.status(400).send("Refresh token is required");
   }
   
   const user = await common.User.findOne({refreshToken});

   if (!user) {
     return res.status(403).send("Invalid refresh token");
 }
 try {
     common.jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
     const accessToken = common.jwt.sign({ user_id: user._id, email: user.email }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "10m" });
     return res.json({ accessToken });
 } catch (error) {
     return res.status(403).send("Invalid refresh token");
 }
});

module.exports = router;