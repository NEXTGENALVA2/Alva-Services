const { sequelize, User, Website } = require('./models');

async function checkUserWebsite() {
  try {
    // Find user with email
    const user = await User.findOne({
      where: { email: 'nextgen.alva@gmail.com' },
      include: [{
        model: Website,
        required: false  // LEFT JOIN instead of INNER JOIN
      }]
    });
    
    if (!user) {
      console.log('❌ User not found with email: nextgen.alva@gmail.com');
      
      // Check if any websites exist
      const allWebsites = await Website.findAll();
      console.log(`📊 Total websites in database: ${allWebsites.length}`);
      
      if (allWebsites.length > 0) {
        console.log('🌐 All websites:');
        allWebsites.forEach(website => {
          console.log(`  - ${website.name} (${website.domain}) - User: ${website.userId}`);
        });
      }
      
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log(`📊 Websites owned by user: ${user.Websites ? user.Websites.length : 0}`);
    
    if (user.Websites && user.Websites.length > 0) {
      console.log('🌐 User websites:');
      user.Websites.forEach(website => {
        console.log(`  - ${website.name} (${website.domain})`);
        console.log(`    Created: ${website.createdAt}`);
        console.log(`    Active: ${website.isActive}`);
      });
    }
    
    // Also check websites with null userId
    const orphanWebsites = await Website.findAll({
      where: { userId: null }
    });
    
    if (orphanWebsites.length > 0) {
      console.log('🔍 Websites with no owner (userId is null):');
      orphanWebsites.forEach(website => {
        console.log(`  - ${website.name} (${website.domain})`);
        console.log(`    Created: ${website.createdAt}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking user website:', error);
    process.exit(1);
  }
}

checkUserWebsite();
