const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function createTestUser() {
  try {
    console.log('👨‍💻 Creating test user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    // Create user
    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: hashedPassword,
      phone: '+1234567890',
      trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      subscriptionType: 'trial'
    });
    
    console.log('✅ Test user created:', {
      id: user.id,
      email: user.email,
      name: user.name
    });
    
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('ℹ️ Test user already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    process.exit();
  }
}

createTestUser();