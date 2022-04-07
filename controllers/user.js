const { User } = require("../models");
const Validator = require("fastest-validator");
const bcrypt = require("bcrypt");
const formValidator = new Validator();

const insertValidation = {
  username: { type: "string" },
  fullname: { type: "string" },
  email: { type: "email" },
  password: { type: "string", min: 6 },
  role: { type: "string" },
};

const updateValidation = {
  fullname: { type: "string" },
  email: { type: "string" },
  role: { type: "string" },
};

const dataAssociation = [{ association: "user_orders" }];

module.exports = {
  list: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 25,
        orderby = "id",
        orderdir = "DESC",
      } = req.query;
      const offset = (page - 1) * limit;

      const data = await User.findAndCountAll({
        include: dataAssociation,
        order: [[orderby, orderdir]],
        limit: Number(limit),
        offset: offset,
      });

      if (!data) {
        throw new Error("Failed fetch data!");
      }

      return res.json({
        data: data?.rows,
        total: data?.count,
        current_page: Number(page),
        maxpage: Math.ceil(data?.count / limit),
      });
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const {
        username,
        fullname,
        email,
        password,
        role = "CUSTOMER",
      } = req.body;

      // form validation check
      const validation = formValidator.validate(req.body, insertValidation);
      if (validation?.length) {
        res.status(400).json({
          status: false,
          error: validation,
        });
      }

      // check if username or email already in database
      const existCheck = await User.findOne({
        where: { username: username, email: email },
      });
      if (existCheck) {
        throw new Error(
          `Username: ${existCheck} or Email: ${existCheck} already exists!`
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const data = await User.create({
        username: username,
        fullname: fullname,
        email: email,
        password: hashedPassword,
        role: role,
      });

      if (!data) {
        throw new Error(`Failed to insert data!`);
      }

      return res.status(201).json({
        status: true,
        data: await User.findByPk(data?.id, { include: dataAssociation }),
      });
    } catch (error) {
      next(error);
    }
  },
};
