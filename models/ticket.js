"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Ticket.belongsTo(models.Hall, {
        as: "hall",
        foreignKey: "hall_id",
      });
    }
  }
  Ticket.init(
    {
      seat_number: DataTypes.INTEGER,
      price: DataTypes.DOUBLE,
      sold: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Ticket",
    }
  );
  return Ticket;
};
