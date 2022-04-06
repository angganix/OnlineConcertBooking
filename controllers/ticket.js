const { Ticket } = require("../models");
const Validator = require("fastest-validator");
const moment = require("moment");
const formValidator = new Validator();

const formValidation = {
  seat_number: { type: "number" },
  price: { type: "number" },
  hall_id: { type: "number" },
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

      const data = await Ticket.findAndCountAll({
        include: [
          {
            association: "hall",
            include: {
              association: "concert",
            },
          },
        ],
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

      const data = await Ticket.findByPk(id, {
        include: [
          {
            association: "hall",
            include: {
              association: "concert",
            },
          },
        ],
      });

      if (!data) {
        throw new Error(`Failed to fetch data with id: ${id}`);
      }

      return res.json(data);
    } catch (error) {
      next(error);
    }
  },
};
