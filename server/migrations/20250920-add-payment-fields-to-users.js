'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'paymentMethod', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'transactionId', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'paymentPhone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'paymentScreenshot', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'paymentPlanId', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'paymentApproved', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });
    
    await queryInterface.addColumn('Users', 'paymentApprovedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'paymentMethod');
    await queryInterface.removeColumn('Users', 'transactionId');
    await queryInterface.removeColumn('Users', 'paymentPhone');
    await queryInterface.removeColumn('Users', 'paymentScreenshot');
    await queryInterface.removeColumn('Users', 'paymentPlanId');
    await queryInterface.removeColumn('Users', 'paymentApproved');
    await queryInterface.removeColumn('Users', 'paymentApprovedAt');
  }
};