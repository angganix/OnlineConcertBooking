const { Concert } = require("../models");
const Validator = require("fastest-validator");
const moment = require("moment");
const formValidator = new Validator();

const formValidation = {
  time: { type: "string" },
  title: { type: "string" },
};

const dataAssociation = [
  {
    association: "halls",
    include: [
      {
        association: "tickets",
      },
    ],
  },
];

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

      const data = await Concert.findAndCountAll({
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
  show: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new Error("Forbidden request!");
      }

      const data = await Concert.findByPk(id, {
        include: dataAssociation,
      });

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
      const { time, title, description } = req.body;

      const validation = formValidator.validate(req.body, formValidation);
      if (validation?.length) {
        return res.status(400).json({
          status: false,
          error: validation,
        });
      }

      const data = await Concert.create({
        time: moment(time),
        title: title,
        description: description,
      });

      if (!data) {
        throw new Error("Failed insert data!");
      }

      return res.status(201).json({
        status: true,
        data: await Concert.findByPk(data?.id, { include: ["halls"] }),
      });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { time, title, description } = req.body;

      const validation = formValidator.validate(req.body, formValidation);
      if (validation?.length) {
        return res.status(400).json({
          status: false,
          error: validation,
        });
      }

      const data = await Concert.update(
        {
          time: moment(time),
          title: title,
          description: description,
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
        data: await Concert.findByPk(id, { include: ["halls"] }),
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

      const deleteData = await Concert.destroy({
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
