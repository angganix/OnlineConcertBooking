"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DetailOrders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      personName: {
        type: Sequelize.STRING,
      },
      orders_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "Orders",
          },
          key: "id",
        },
        allowNull: false,
      },
      ticket_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "Tickets",
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
    await queryInterface.dropTable("DetailOrders");
  },
};
