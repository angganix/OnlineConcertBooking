"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Concert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Concert.hasMany(models.Hall, {
        as: "halls",
        foreignKey: "concert_id",
      });
    }
  }
  Concert.init(
    {
      time: DataTypes.DATE,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Concert",
    }
  );
  return Concert;
};
