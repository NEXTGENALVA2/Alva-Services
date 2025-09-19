const { Banner, Website } = require('./models');
const { sequelize } = require('./config/database');

async function checkBannerSetup() {
  try {
    console.log('🔍 Checking Banner table and setup...');
    
    // 1. Check if Banner table exists
    const tableExists = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'Banners';"
    );
    console.log('Banner table exists:', tableExists[0].length > 0);
    
    // 2. Check Banner table structure
    if (tableExists[0].length > 0) {
      const columns = await sequelize.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Banners';"
      );
      console.log('Banner table columns:', columns[0]);
    }
    
    // 3. Check if there are any banners
    const bannerCount = await Banner.count();
    console.log('Total banners in database:', bannerCount);
    
    // 4. Check recent banners
    const recentBanners = await Banner.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    console.log('Recent banners:', recentBanners.map(b => ({
      id: b.id,
      imageUrl: b.imageUrl,
      websiteId: b.websiteId,
      createdAt: b.createdAt
    })));
    
    // 5. Test websites
    const websites = await Website.findAll({ limit: 3 });
    console.log('Available websites:', websites.map(w => ({ id: w.id, domain: w.domain })));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

checkBannerSetup();