'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if websiteId column already exists
      const tableDescription = await queryInterface.describeTable('Orders');
      
      if (!tableDescription.websiteId) {
        await queryInterface.addColumn('Orders', 'websiteId', {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'Websites',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        });
        console.log('websiteId column added to Orders table');
      } else {
        console.log('websiteId column already exists in Orders table');
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableDescription = await queryInterface.describeTable('Orders');
      
      if (tableDescription.websiteId) {
        await queryInterface.removeColumn('Orders', 'websiteId');
        console.log('websiteId column removed from Orders table');
      }
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
