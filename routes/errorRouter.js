const express = require("express");
const router = express.Router();

router.get("/:errorCode", (req, res) => {
  const errorCode = req.params.errorCode;
  const reason = req.query.reason;
  
  let errorMessage;

  switch (errorCode) {
    case "400":
      errorMessage = "400 Bad Request";
      break;
    case "401":
      if(reason === "notauthorized") {
        errorMessage = "401 If U Want To Delete U Need To Be Uploader";
      } else {
        errorMessage = "401 Not Found";
      }
      break;
    case "404":
      if(reason === "bookNotFound") {
        errorMessage = "404 Book Not Found";
      } else {
        errorMessage = "404 Not Found";
      }
      break;
    case "403":
      if(reason === "NeedToLogin") {
        errorMessage = "403 Access denied U need To Login";
      } else {
        errorMessage = "403 Not Found";
      }
     
      break;
    case "500":
      errorMessage = "500 Internal server error";
      break;
    case "409":
      errorMessage = "'409 Conflict' User already exist.";
      break;
    default:
      errorMessage = "An error occurred";
  }

  res.render("error", { errorMessage , reason});
});

module.exports = router;
