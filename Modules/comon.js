const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const path = require("path");
const session = require("express-session");
const auth = require("../middleware/auth");
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
const { refreshToken } = require("firebase-admin/app");
const registerRouter = require('../routes/registerRouter');
const Book = require('../models/book')
const expressLayouts = require("express-ejs-layouts");

module.exports = {
  express,
  bcrypt,
  jwt,
  User,
  path,
  session,
  auth, 
  serviceAccount,
  admin,
  registerRouter,
  refreshToken,
  Book,
  expressLayouts
};
