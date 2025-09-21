const { DataTypes } = require('sequelize');

async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Users', 'hasUsedTrial', {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });
  
  await queryInterface.addColumn('Users', 'trialEnabledByAdmin', {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });
}

async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Users', 'hasUsedTrial');
  await queryInterface.removeColumn('Users', 'trialEnabledByAdmin');
}

module.exports = { up, down };