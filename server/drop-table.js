const { sequelize } = require('./models');

async function dropTable() {
  try {
    await sequelize.query('DROP TABLE IF EXISTS "Websites" CASCADE;');
    console.log('Websites table dropped with CASCADE');
    
    // Also drop other tables to force complete recreation
    await sequelize.query('DROP TABLE IF EXISTS "Orders" CASCADE;');
    console.log('Orders table dropped');
    
    await sequelize.query('DROP TABLE IF EXISTS "Products" CASCADE;');
    console.log('Products table dropped');
    
    await sequelize.query('DROP TABLE IF EXISTS "Banners" CASCADE;');
    console.log('Banners table dropped');
    
    process.exit(0);
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
}

dropTable();
