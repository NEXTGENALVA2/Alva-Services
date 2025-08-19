const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Banner model for PostgreSQL with Sequelize
const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: DataTypes.STRING,
  subtitle: DataTypes.STRING,
  image: DataTypes.TEXT,
  imageUrl: DataTypes.STRING, // for compatibility
  link: DataTypes.STRING,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  websiteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Websites', key: 'id' }
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
});

module.exports = Banner;
