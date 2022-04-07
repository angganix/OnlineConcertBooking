"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DetailOrder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.DetailOrder.belongsTo(models.Order, {
        as: "order",
        foreignKey: "orders_id",
      });

      models.DetailOrder.belongsTo(models.Ticket, {
        as: "ticket",
        foreignKey: "ticket_id",
      });
    }
  }
  DetailOrder.init(
    {
      personName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "DetailOrder",
    }
  );
  return DetailOrder;
};
