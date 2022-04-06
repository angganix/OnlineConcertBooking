"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Hall extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Hall.belongsTo(models.Concert, {
        as: "concert",
        foreignKey: "concert_id",
      });

      models.Hall.hasMany(models.Ticket, {
        as: "tickets",
        foreignKey: "hall_id",
      });
    }
  }
  Hall.init(
    {
      name: DataTypes.STRING,
      quota: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Hall",
    }
  );
  return Hall;
};
