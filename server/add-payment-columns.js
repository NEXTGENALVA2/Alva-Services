const { sequelize } = require('./config/database');

async function addPaymentColumns() {
  try {
    console.log('Adding payment columns to Users table...');
    
    // Add columns if they don't exist
    await sequelize.query(`
      ALTER TABLE "Users" 
      ADD COLUMN IF NOT EXISTS "paymentMethod" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "transactionId" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "paymentPhone" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "paymentScreenshot" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "paymentPlanId" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "paymentApproved" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "paymentApprovedAt" TIMESTAMP WITH TIME ZONE;
    `);
    
    console.log('Payment columns added successfully!');
    
    // Test query to check if user has payment data
    const [results] = await sequelize.query(`
      SELECT id, name, email, "paymentMethod", "transactionId", "paymentPhone", "paymentScreenshot", "paymentPlanId"
      FROM "Users" 
      WHERE id = 'facb7e62-e868-42eb-b197-60dca02055a3'
    `);
    
    console.log('User data:', results[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

addPaymentColumns();