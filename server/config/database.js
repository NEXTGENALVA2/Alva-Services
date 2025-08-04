
require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('Connecting to DB:', process.env.DB_NAME, process.env.DB_USER, process.env.DB_HOST, process.env.DB_PORT);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce_saas',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
    // Add retry options
    retry: {
      max: 3,
      timeout: 3000
    },
    // Disable SSL for local development
    dialectOptions: {
      ssl: false
    }
  }
);

module.exports = { sequelize };
