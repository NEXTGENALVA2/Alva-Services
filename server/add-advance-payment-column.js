const { sequelize } = require('./config/database');

async function addColumn() {
  try {
    await sequelize.query('ALTER TABLE "Orders" ADD COLUMN "advancePayment" DECIMAL(10,2) DEFAULT 0');
    console.log('advancePayment column added successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('advancePayment column already exists');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await sequelize.close();
  }
}

addColumn();
