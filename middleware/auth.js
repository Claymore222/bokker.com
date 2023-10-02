const jwt = require("jsonwebtoken");
const User = require("../models/user");

const config = process.env;

const verifyToken = async (req, res, next) => {
  const accessToken = req.session.accessToken;

  if (!accessToken) {
    return res.redirect("/error/403?reason=NeedToLogin"); 
  }

  const decodedAccessToken = jwt.decode(accessToken);
  if (!decodedAccessToken || !decodedAccessToken.user_id) {
    return res.redirect("/error/400");
  }

  const user = await User.findById(decodedAccessToken.user_id);
  if (!user) {
    return res.redirect("/error/404"); 
  }

  try {
    const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      try {
        const decodedRefresh = jwt.verify(
          user.refreshToken,
          config.REFRESH_TOKEN_KEY
        );

        if (!decodedRefresh || decodedRefresh.user_id !== user._id.toString()) {
          return res.redirect("/error/403");
        }

        const newAccessToken = jwt.sign(
          { user_id: user._id },
          config.ACCESS_TOKEN_KEY,
          { expiresIn: "1h" }
        );
        req.session.accessToken = newAccessToken;
        req.user = jwt.decode(newAccessToken);
        next();
      } catch (errRefresh) {
        console.log("Logged out");
        return res.redirect("/error/401");
      }
    } else {
      return res.redirect("/error/401");
    }
  }
};

module.exports = verifyToken;
