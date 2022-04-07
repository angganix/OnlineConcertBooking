require("dotenv").config();
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { APP_SECRET } = process.env;
const userController = require("./user");
const Validator = require("fastest-validator");
const formValidator = new Validator();

const loginSchema = {
  username: { type: "string" },
  password: { type: "string" },
};

module.exports = {
  register: userController.create,
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // form validation
      const validation = formValidator.validate(req.body, loginSchema);
      if (validation?.length) {
        return res.status(400).json({
          status: false,
          error: validation,
        });
      }

      // check if user exists
      const getUser = await User.findOne({
        where: {
          [Op.or]: [{ username: username }, { email: username }],
          role: "CUSTOMER",
        },
      });

      // kalau tidak terdaftar, throw!
      if (!getUser) {
        throw new Error(`Username or Email ${username} are not registered!`);
      }

      // jika terdaftar, cek passwordnya
      const passwordCheck = await bcrypt.compare(password, getUser?.password);
      if (!passwordCheck) {
        throw new Error(`Password untuk ${username} salah!`);
      }

      // buat authToken
      const authToken = jwt.sign(
        {
          id: getUser?.id,
          username: getUser?.username,
          email: getUser?.email,
          fullname: getUser?.fullname,
          role: getUser?.role,
        },
        APP_SECRET,
        {
          expiresIn: "1d",
        }
      );

      /**
       * jika semua validasi terlewati (pass)
         buat setcookie, agar FE otomatis set cookie (httpOnly)
       */
      res.cookie("authToken", authToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 1000 * 1,
      });

      res.json({
        status: true,
        data: getUser,
        token: authToken,
      });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      res.clearCookie("authToken");
      return res.json({
        status: true,
        message: "Successfully detach authentication!",
      });
    } catch (error) {
      next(error);
    }
  },
};
