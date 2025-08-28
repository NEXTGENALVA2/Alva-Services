const { sequelize, User, Website } = require('./models');

async function checkCurrentWebsite() {
  try {
    const users = await User.findAll({
      include: [{
        model: Website,
        required: false
      }]
    });
    
    console.log('📊 All users and their websites:');
    
    users.forEach(user => {
      console.log(`\n👤 User: ${user.name} (${user.email})`);
      if (user.Websites && user.Websites.length > 0) {
        user.Websites.forEach(website => {
          console.log(`  🌐 Website: ${website.name}`);
          console.log(`     Domain: ${website.domain}`);
          console.log(`     ID: ${website.id}`);
        });
      } else {
        console.log('  ❌ No websites');
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCurrentWebsite();
