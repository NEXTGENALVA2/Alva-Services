const { sequelize } = require('./models');

async function addDeliveryChargeColumn() {
  try {
    console.log('Adding deliveryCharge column to Products table...');
    
    // Add the column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE "Products" 
      ADD COLUMN IF NOT EXISTS "deliveryCharge" DECIMAL(10,2) DEFAULT 0;
    `);
    
    // Update existing products with default delivery charge
    await sequelize.query(`
      UPDATE "Products" 
      SET "deliveryCharge" = 0 
      WHERE "deliveryCharge" IS NULL;
    `);
    
    console.log('✅ deliveryCharge column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding deliveryCharge column:', error);
    process.exit(1);
  }
}

addDeliveryChargeColumn();