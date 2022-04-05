const { Hall } = require("../models");
const Validator = require("fastest-validator");
const moment = require("moment");
const formValidator = new Validator();

const formValidation = {
  name: { type: "string" },
  quota: { type: "number" },
};

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

      const data = await Hall.findAndCountAll({
        include: ["concert"],
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
  show: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Forbidden request!");
      }

      const data = await Hall.findByPk(id, { include: ["concert"] });

      if (!data) {
        throw new Error(`Failed to fetch data with id: ${id}`);
      }

      return res.json(data);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const { name, quota, concert_id } = req.body;

      const validation = formValidator.validate(req.body, formValidation);
      if (validation?.length) {
        return res.status(400).json({
          status: false,
          error: validation,
        });
      }

      const data = await Hall.create({
        name: name,
        quota: Number(quota),
        concert_id: Number(concert_id),
      });

      if (!data) {
        throw new Error("Failed insert data!");
      }

      return res.status(201).json({
        status: true,
        data: await Hall.findByPk(data?.id, { include: ["concert"] }),
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, quota, concert_id } = req.body;

      const validation = formValidator.validate(req.body, formValidation);
      if (validation?.length) {
        return res.status(400).json({
          status: false,
          error: validation,
        });
      }

      const data = await Hall.update(
        {
          name: name,
          quota: Number(quota),
          concert_id: Number(concert_id),
        },
        {
          where: { id: id },
        }
      );

      if (!data) {
        throw new Error(`Failed update data with id: ${id}`);
      }

      return res.json({
        status: true,
        data: await Hall.findByPk(id, { include: ["concert"] }),
      });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Forbidden request!");
      }

      const deleteData = await Hall.destroy({
        where: { id: id },
      });

      if (!deleteData) {
        throw new Error(`Failed delete data with id: ${id}`);
      }

      return res.json({
        status: Boolean(deleteData),
      });
    } catch (error) {
      next(error);
    }
  },
};
