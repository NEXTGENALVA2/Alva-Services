'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add delivery-related fields to Orders table
    await queryInterface.addColumn('Orders', 'customerDivision', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Orders', 'customerDistrict', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Orders', 'subTotal', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.addColumn('Orders', 'deliveryCharge', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    });

    await queryInterface.addColumn('Orders', 'deliveryType', {
      type: Sequelize.ENUM('normal', 'express'),
      defaultValue: 'normal',
      allowNull: false,
    });

    await queryInterface.addColumn('Orders', 'note', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Orders', 'paymentMethod', {
      type: Sequelize.STRING,
      defaultValue: 'cash_on_delivery',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the added fields
    await queryInterface.removeColumn('Orders', 'customerDivision');
    await queryInterface.removeColumn('Orders', 'customerDistrict');
    await queryInterface.removeColumn('Orders', 'subTotal');
    await queryInterface.removeColumn('Orders', 'deliveryCharge');
    await queryInterface.removeColumn('Orders', 'deliveryType');
    await queryInterface.removeColumn('Orders', 'note');
    await queryInterface.removeColumn('Orders', 'paymentMethod');
  }
};
