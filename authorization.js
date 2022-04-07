require("dotenv").config();
const jwt = require("jsonwebtoken");
const { APP_SECRET } = process.env;
const { User } = require("./models");

module.exports = async (req, res, next) => {
  try {
    const { cookie } = req;
    console.log(cookie);
    return next();
  } catch (error) {
    next(error);
  }
};
