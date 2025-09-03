const cron = require('node-cron');
const { User } = require('./models');
const { Op } = require('sequelize');

// Function to deactivate expired users
async function deactivateExpiredUsers() {
  try {
    console.log('🕒 Running daily expired users check...');
    
    const now = new Date();
    
    // Find users whose subscriptions have expired
    const expiredUsers = await User.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          {
            subscriptionType: 'trial',
            trialEndsAt: {
              [Op.lte]: now
            }
          },
          {
            subscriptionType: { [Op.ne]: 'trial' },
            subscriptionEndsAt: {
              [Op.lte]: now
            }
          }
        ]
      }
    });

    let deactivatedCount = 0;

    for (const user of expiredUsers) {
      try {
        await user.update({ isActive: false });
        deactivatedCount++;
        console.log(`✅ Deactivated expired user: ${user.email} (${user.subscriptionType})`);
      } catch (error) {
        console.error(`❌ Error deactivating user ${user.email}:`, error);
      }
    }

    console.log(`✅ Expired users check completed. Deactivated: ${deactivatedCount}/${expiredUsers.length}`);
    
    return {
      total: expiredUsers.length,
      deactivated: deactivatedCount
    };

  } catch (error) {
    console.error('❌ Error in deactivateExpiredUsers:', error);
    return { error: error.message };
  }
}

// Function to send reminder notifications 3 days before expiry
async function sendExpiryReminders() {
  try {
    console.log('📧 Checking users for expiry reminders...');
    
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const expiringUsers = await User.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          {
            subscriptionType: 'trial',
            trialEndsAt: {
              [Op.between]: [new Date(), threeDaysFromNow]
            }
          },
          {
            subscriptionType: { [Op.ne]: 'trial' },
            subscriptionEndsAt: {
              [Op.between]: [new Date(), threeDaysFromNow]
            }
          }
        ]
      }
    });

    console.log(`📧 Found ${expiringUsers.length} users expiring within 3 days`);
    
    // Here you can integrate with your notification system
    // For example, call the notification API endpoint
    
    return {
      total: expiringUsers.length
    };

  } catch (error) {
    console.error('❌ Error in sendExpiryReminders:', error);
    return { error: error.message };
  }
}

// Schedule tasks
function setupCronJobs() {
  // Run every day at 12:00 AM to deactivate expired users
  cron.schedule('0 0 * * *', async () => {
    console.log('🚀 Starting daily subscription maintenance...');
    await deactivateExpiredUsers();
  });

  // Run every day at 9:00 AM to send expiry reminders
  cron.schedule('0 9 * * *', async () => {
    console.log('🚀 Starting daily expiry reminder check...');
    await sendExpiryReminders();
  });

  console.log('✅ Cron jobs scheduled:');
  console.log('   - Daily expired users check: 12:00 AM');
  console.log('   - Daily expiry reminders: 9:00 AM');
}

module.exports = {
  setupCronJobs,
  deactivateExpiredUsers,
  sendExpiryReminders
};
