const express = require('express');
const router = express.Router();
const common = require("../Modules/comon")
router.get("/", common.auth, async (req, res) => {
  
   const accessToken = req.session.accessToken;
   const decodedAccessToken = common.jwt.decode(accessToken);
   const expirationDateAccessToken = decodedAccessToken.exp * 1000;
   const remainingTimeAccessToken = expirationDateAccessToken - Date.now();
 
   const user = await common.User.findById(req.user.user_id);
   const decodedRefreshToken = common.jwt.decode(user.refreshToken);
   const expirationDateRefreshToken = decodedRefreshToken.exp * 1000;
   const remainingTimeRefreshToken = expirationDateRefreshToken - Date.now();
 
   try {
    res.render("welcome", {
     first_name: user.first_name,
     remainingTimeAccessToken: remainingTimeAccessToken,
     remainingTimeRefreshToken: remainingTimeRefreshToken,
     user
   });
   } catch (error) {
    res.redirect("error/404")
   }
  
 
   console.log("✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯")
   console.log("User log ==> ", "First Name: " ,user.first_name);
   console.log("User log ==> ", "Last Name: " ,user.last_name);
   console.log("User log ==> ", "Email: " ,user.email);
   console.log("User log ==> ", "Id: " ,user.id); 
   console.log("User log ==> ", "Token: " ,accessToken);
   console.log("User log ==> ", "Access Token Expire In: " ,remainingTimeAccessToken / 1000 ," saniye");
   console.log("User log ==> ", "Refresh Token Expire In: " ,remainingTimeRefreshToken / 1000 ," dakika");
   console.log("✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯")
 });

 module.exports = router;