const { sequelize } = require('./config/database');

async function checkAllUsersPayments() {
  try {
    console.log('Checking all users with payment data...');
    
    const [results] = await sequelize.query(`
      SELECT id, name, email, "paymentMethod", "transactionId", "paymentPhone", "paymentPlanId"
      FROM "Users" 
      WHERE "paymentMethod" IS NOT NULL 
         OR "transactionId" IS NOT NULL 
         OR "paymentPhone" IS NOT NULL
      ORDER BY "updatedAt" DESC
    `);
    
    console.log('Users with payment data:', results);
    
    if (results.length === 0) {
      console.log('No users found with payment data.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAllUsersPayments();