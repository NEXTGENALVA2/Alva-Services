const { sequelize, Admin } = require('./models');
const bcrypt = require('bcryptjs');

async function createAdminAccount() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('❌ Admin account already exists');
      console.log('📧 Username: admin');
      console.log('🔒 Password: admin123');
      process.exit(0);
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@alvaecommerce.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });

    console.log('✅ Admin account created successfully!');
    console.log('📧 Username: admin');
    console.log('🔒 Password: admin123');
    console.log('🌐 Login URL: http://localhost:3000/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    process.exit(1);
  }
}

createAdminAccount();
