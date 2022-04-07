require("dotenv").config();
const { User } = require("../models");
const jwt = require("jsonwebtoken");
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
          [Op.or]: [
            {
              username: username,
              email: username,
            },
          ],
        },
      });
    } catch (error) {}
  },
};
