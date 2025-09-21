// Fix isActive field for existing users
const { User } = require('./models');

async function fixUserIsActiveField() {
  try {
    console.log('🔧 Fixing isActive field for existing users...');
    
    // Update all users where isActive is null to true
    const result = await User.update(
      { isActive: true },
      { 
        where: { isActive: null },
        returning: true // for PostgreSQL to return updated records
      }
    );
    
    console.log('✅ Updated users count:', result[0]);
    
    // Check all users and their isActive status
    const allUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'isActive'],
      order: [['createdAt', 'ASC']]
    });
    
    console.log('\n📋 All users isActive status:');
    allUsers.forEach(user => {
      console.log(`   ${user.name} (${user.email}): isActive = ${user.isActive}`);
    });
    
    console.log('\n✅ Fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing isActive field:', error);
  }
}

fixUserIsActiveField();