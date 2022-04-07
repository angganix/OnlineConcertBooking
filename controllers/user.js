const { User } = require("../models");
const Validator = require("fastest-validator");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const formValidator = new Validator();

const insertValidation = {
  username: { type: "string" },
  fullname: { type: "string" },
  email: { type: "email" },
  password: { type: "string", min: 6 },
};

const updateValidation = {
  fullname: { type: "string" },
  email: { type: "string" },
  role: { type: "string" },
};

const dataAssociation = [{ association: "user_orders" }];

module.exports = {
  /**
   * Get User List
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
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
  /**
   * Create new user
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
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

      // check if username already in database
      const existsUsername = await User.findOne({
        where: { username: username },
      });
      if (existsUsername) {
        throw new Error(
          `[Exists] Username: ${existsUsername?.username} already exists!`
        );
      }

      // check if email already in database
      const existsEmail = await User.findOne({
        where: { email: email },
      });
      if (existsEmail) {
        throw new Error(
          `[Exists] Email: ${existsEmail?.email} already exists!`
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
  /**
   * Delete user by id
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error("Forbidden request!");
      }

      const deleteData = await User.destroy({
        where: { id: id },
      });
      if (!deleteData) {
        throw new Error(`Failed delete data with id ${id}`);
      }

      return res.json({
        status: true,
      });
    } catch (error) {
      next(error);
    }
  },
};
