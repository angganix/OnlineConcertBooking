const { Order, Ticket } = require("../models");
const Validator = require("fastest-validator");
const moment = require("moment");
const formValidator = new Validator();
const crypto = require("crypto");
const axios = require("axios");

const formValidation = {
  detail_orders: { type: "array", min: 1 },
};

const merchant_code = "D11839";
const api_key = "1acb5e52557dc6c55d1d5be6500cc39e";

const dataAssociation = [
  {
    association: "detail_orders",
    include: {
      association: "ticket",
      include: {
        association: "hall",
        include: {
          association: "concert",
        },
      },
    },
  },
  {
    association: "user",
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

      let whereClause = {};

      /**
       * Jika yang melakukan request
       * adalah customer, tampilkan semua order
       * hanya milik customer
       */
      if (req.user?.role === "CUSTOMER") {
        whereClause.user_id = req.user?.id;
      }

      const data = await Order.findAndCountAll({
        where: whereClause,
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
      const { id: user_id } = req.user;
      const { detail_orders } = req.body;

      const validation = formValidator.validate(req.body, formValidation);
      if (validation?.length) {
        return res.status(400).json({
          status: false,
          error: validation,
        });
      }

      const data = await Order.create(
        {
          purchaseTime: moment().format("YYYY-MM-DD HH:mm:ss"),
          paymentStatus: "BELUM BAYAR",
          user_id: user_id,
          detail_orders: detail_orders?.map((detail) => {
            return {
              ticket_id: detail.ticket_id,
              personName: detail.person_name,
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

      // setup payment data ke duitku API
      const detail_items = await Order.findByPk(data?.id, {
        include: dataAssociation,
      });
      const parsed_items = JSON.parse(
        JSON.stringify(detail_items?.detail_orders)
      );
      const paymentData = {
        paymentAmount: parsed_items?.reduce((acc, cur) => {
          return (acc += cur?.ticket?.price);
        }, 0),
        merchantOrderId: `${data?.id}`,
        productDetails: "Pembayaran ticket",
        itemDetails: parsed_items?.map((detail) => {
          return {
            name: detail?.personName,
            quantity: 1,
            price: detail?.ticket?.price,
          };
        }),
        email: data?.user?.email,
        returnUrl:
          process.env.NODE_ENV !== "production"
            ? "http://localhost:3000/account/order"
            : "http://teknix.my.id:3000/account/order",
        callbackUrl:
          process.env.NODE_ENV !== "production"
            ? "http://localhost:3000/account/order"
            : "http://teknix.my.id:3000/account/order",
      };

      const serverTime = new Date().getTime();
      const signatureHash = crypto.createHash("sha256");
      const signatureData = signatureHash.update(
        `${merchant_code}${serverTime}${api_key}`,
        "utf-8"
      );
      const hashedSignature = signatureData.digest("hex");
      const requestHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-duitku-signature": hashedSignature,
        "x-duitku-timestamp": serverTime,
        "x-duitku-merchantcode": merchant_code,
      };

      const paymentResult = await axios
        .post(
          "https://api-sandbox.duitku.com/api/merchant/createInvoice",
          paymentData,
          { headers: requestHeaders }
        )
        .then((result) => {
          return result;
        })
        .catch((error) => {
          return error;
        });

      if (paymentResult?.data) {
        detail_orders.forEach((detail) => {
          Ticket.update(
            {
              sold: true,
            },
            {
              where: {
                id: detail?.ticket_id,
              },
            }
          );
        });

        return res.status(201).json({
          status: true,
          data: await Order.findByPk(data?.id, { include: dataAssociation }),
          payment: paymentResult?.data,
        });
      } else {
        console.log(paymentResult);
        return res.status(400).json({
          status: false,
          error: "error payment",
        });
      }
    } catch (error) {
      next(error);
    }
  },
  payorder: async (req, res, next) => {
    try {
      const { id: user_id } = req.user;
      const { id } = req.params;

      if (!user_id) {
        throw new Error(`Forbidden request!`);
      }

      const payOrder = await Order.update(
        {
          paymentStatus: "DIBAYAR",
        },
        {
          where: { id: id },
        }
      );

      if (!payOrder) {
        throw new Error(`Gagal melakukan pembayaran!`);
      }

      return res.json({
        status: true,
        data: await Order.findByPk(id, { include: dataAssociation }),
      });
    } catch (error) {
      next(error);
    }
  },
};
