const { sequelize, User, Website } = require('./models');
const bcrypt = require('bcryptjs');

async function createUserAndAssignWebsite() {
  try {
    // 1. Create user account
    const hashedPassword = await bcrypt.hash('123456', 12); // Default password
    
    const user = await User.create({
      name: 'NextGen Alva',
      email: 'nextgen.alva@gmail.com',
      password: hashedPassword,
      phone: '01234567890',
      isActive: true,
      subscriptionType: 'trial'
    });
    
    console.log('✅ User created:', user.email);
    
    // 2. Find the orphan website and assign to user
    const orphanWebsite = await Website.findOne({
      where: { userId: null }
    });
    
    if (orphanWebsite) {
      orphanWebsite.userId = user.id;
      await orphanWebsite.save();
      
      console.log('✅ Website assigned to user:');
      console.log(`  - Website: ${orphanWebsite.name}`);
      console.log(`  - Domain: ${orphanWebsite.domain}`);
      console.log(`  - User: ${user.email}`);
    } else {
      console.log('❌ No orphan website found to assign');
    }
    
    console.log('\n🎉 Now you can login with:');
    console.log(`   Email: nextgen.alva@gmail.com`);
    console.log(`   Password: 123456`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUserAndAssignWebsite();
