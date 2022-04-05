"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      purchaseTime: {
        type: Sequelize.DATE,
      },
      paymentStatus: {
        type: Sequelize.ENUM("BELUM BAYAR", "DIBAYAR"),
        default: "BELUM BAYAR",
      },
      buktiBayar: {
        type: Sequelize.STRING,
      },
      concert_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "Concerts",
          },
          key: "id",
        },
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "Users",
          },
          key: "id",
        },
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Orders");
  },
};
