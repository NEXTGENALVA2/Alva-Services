const { User } = require('./models');

async function findAdmin() {
  try {
    console.log('🔍 Finding admin users...');
    
    const users = await User.findAll({
      where: {
        role: 'admin'
      },
      attributes: ['id', 'email', 'role', 'createdAt']
    });
    
    console.log('👨‍💼 Admin users found:', users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    })));
    
    if (users.length === 0) {
      console.log('ℹ️ No admin users found. Looking for any users...');
      
      const allUsers = await User.findAll({
        attributes: ['id', 'email', 'role', 'createdAt'],
        limit: 10
      });
      
      console.log('👥 All users:', allUsers.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
      })));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

findAdmin();