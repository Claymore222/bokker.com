require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const auth = require("./middleware/auth");
let serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace '\n' with actual newline characters
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};
const admin = require("firebase-admin");


const registerRouter = require("./routes/registerRouter");
const loginRouter = require("./routes/loginRouter");
const logoutRouter = require("./routes/logoutRouter");
const welcomeRouter = require("./routes/welcomeRouter");
const addbookRouter = require("./routes/addbookRouter");
const errorRouter = require("./routes/errorRouter");
const libraryRouter = require("./routes/libraryRouter");
const bookDetailRouter = require("./routes/bookDetailRouter");
const indexRouter = require("./routes/indexRouter");
const editbookRouter = require("./routes/editBookRouter");
const profileRouter = require("./routes/profileRouter");
const favorities = require("./routes/favoritiesRouter");
const allbooks = require("./routes/allbooksRouter");
app.use(express.json());

app.use("/css", express.static("./node_modules/bootstrap/dist/css"));
app.use("/js", express.static("./node_modules/bootstrap/dist/js"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("wwwroot"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Views"));

module.exports = app;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  res.locals.userIsLoggedIn = !!req.session.accessToken;
  next();
});

app.use("/", indexRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/welcome", auth, welcomeRouter);
app.use("/addbook", auth, addbookRouter);
app.use("/error", errorRouter);
app.use("/library", libraryRouter);
app.use("/book", bookDetailRouter); 
app.use("/home", indexRouter); 
app.use(editbookRouter); 
app.use("/profile", profileRouter);
app.use(allbooks);
app.use(favorities);
app.use("/user", auth, require("./routes/edituserRouter"));
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || "Bilinmeyen hata",
    code: err.code || "UNKNOWN_ERROR",
  });
});
