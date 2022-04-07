const { Order } = require("../models");
const Validator = require("fastest-validator");
const moment = require("moment");
const formValidator = new Validator();

const formValidation = {
  concert_id: { type: "number" },
  detail_orders: { type: "array", min: 1 },
};

const dataAssociation = [
  {
    association: "detail_orders",
    include: {
      association: "ticket",
    },
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

      const data = await Order.findAndCountAll({
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

      const data = await Order.findByPk(id, {
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
      const { concert_id, detail_orders } = req.body;

      const validation = formValidator.validate(req.body, formValidation);
      if (validation?.length) {
        return res.status(400).json({
          status: false,
          error: validation,
        });
      }

      const data = await Order.create(
        {
          purchase_time: moment().format("YYYY-MM-DD HH:mm:ss"),
          payment_status: "BELUM BAYAR",
          concert_id: concert_id,
          detail_orders: detail_orders?.map((detail) => {
            return {
              ticket_id: detail.ticket_id,
              person_name: detail.person_name,
            };
          }),
        },
        {
          include: [
            {
              association: "detail_orders",
            },
          ],
        }
      );

      if (!data) {
        throw new Error("Failed insert data!");
      }

      return res.status(201).json({
        status: true,
        data: await Order.findByPk(data?.id, { include: dataAssociation }),
      });
    } catch (error) {
      next(error);
    }
  },
};
