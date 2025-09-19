const { sequelize } = require('./config/database');

async function checkUserTable() {
  try {
    console.log('🔍 Checking Users table structure...');
    
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'Users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Users table columns:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n👥 Sample users:');
    const [users] = await sequelize.query('SELECT id, email, "createdAt" FROM "Users" LIMIT 5');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

checkUserTable();