"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Order.hasMany(models.DetailOrder, {
        as: "detail_orders",
        foreignKey: "orders_id",
      });

      models.Order.belongsTo(models.User, {
        as: "user",
        foreignKey: "user_id",
      });
    }
  }
  Order.init(
    {
      purchaseTime: DataTypes.DATE,
      paymentStatus: DataTypes.STRING,
      buktiBayar: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
