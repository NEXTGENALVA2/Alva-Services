// Migration to create EmailTrialTracking table
const { EmailTrialTracking } = require('../models');

async function createEmailTrialTrackingTable() {
  try {
    console.log('🔧 Creating EmailTrialTracking table...');
    
    // Force sync the table (this will create it)
    await EmailTrialTracking.sync({ force: false, alter: true });
    
    console.log('✅ EmailTrialTracking table created successfully');
    
    // Migrate existing users to email tracking
    const { User } = require('../models');
    
    console.log('📋 Migrating existing users to email tracking...');
    
    const usersWithTrial = await User.findAll({
      where: {
        hasUsedTrial: true
      },
      attributes: ['email', 'createdAt']
    });
    
    console.log(`Found ${usersWithTrial.length} users who have used trial`);
    
    for (const user of usersWithTrial) {
      try {
        await EmailTrialTracking.findOrCreate({
          where: { email: user.email.toLowerCase() },
          defaults: {
            email: user.email.toLowerCase(),
            firstTrialDate: user.createdAt,
            lastTrialDate: user.createdAt,
            trialCount: 1,
            notes: 'Migrated from existing user data'
          }
        });
        console.log(`✅ Migrated ${user.email}`);
      } catch (error) {
        console.log(`❌ Error migrating ${user.email}:`, error.message);
      }
    }
    
    console.log('✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Error creating EmailTrialTracking table:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createEmailTrialTrackingTable().then(() => {
    process.exit(0);
  });
}

module.exports = createEmailTrialTrackingTable;