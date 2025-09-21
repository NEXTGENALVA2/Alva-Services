// Check shakil user's subscription data
const { User } = require('./models');

async function checkShakil() {
  try {
    const shakil = await User.findOne({ 
      where: { email: 'shakil@gmail.com' },
      attributes: [
        'id', 'name', 'email', 'isActive', 
        'subscriptionType', 'trialEndsAt', 'subscriptionEndsAt',
        'hasUsedTrial', 'trialEnabledByAdmin',
        'paymentMethod', 'paymentPlanId', 'paymentApproved'
      ]
    });
    
    console.log('👤 Shakil User Data:');
    console.log(JSON.stringify(shakil, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkShakil();