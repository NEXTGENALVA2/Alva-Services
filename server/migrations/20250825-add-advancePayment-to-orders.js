const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'advancePayment', {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'advancePayment');
  }
};
