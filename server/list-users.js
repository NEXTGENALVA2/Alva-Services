const { sequelize, User } = require('./models');

async function listAllUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'createdAt']
    });
    
    console.log(`📊 Total users in database: ${users.length}`);
    
    if (users.length > 0) {
      console.log('👥 All users:');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Created: ${user.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No users found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing users:', error);
    process.exit(1);
  }
}

listAllUsers();
