require("dotenv").config();
const jwt = require("jsonwebtoken");
const { APP_SECRET } = process.env;
const { User } = require("./models");

module.exports = async (req, res, next) => {
  try {
    const { authToken: cookies } = req.cookies;

    /**
     * cek apakah request memiliki token (dalam set-cookie)
     * jika tidak, maka throw dengan http status code 403
     */
    if (!cookies) {
      return res.status(403).json({
        status: false,
        error: "Unauthorized",
      });
    }

    /**
     * Jika memiliki cookies, validasi token'nya
     */
    const validateToken = jwt.verify(cookies, APP_SECRET);
    if (!validateToken) {
      return res.status(403).json({
        status: false,
        error: "Unauthorized",
      });
    }

    /**
     * Jika validasi token berhasil
     * attach user data ke object req (request)
     */
    req.user = validateToken;

    /**
     * Teruskan request ke code berikutnya
     */
    return next();
  } catch (error) {
    next(error);
  }
};
