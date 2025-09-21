// Fix shakil's subscription type from trial to monthly
const { User } = require('./models');

async function fixShakil() {
  try {
    console.log('🔧 Fixing Shakil subscription...');
    
    const shakil = await User.findOne({ where: { email: 'shakil@gmail.com' } });
    
    if (!shakil) {
      console.log('❌ Shakil not found');
      return;
    }
    
    console.log('📋 Before update:', {
      subscriptionType: shakil.subscriptionType,
      paymentPlanId: shakil.paymentPlanId,
      paymentApproved: shakil.paymentApproved
    });
    
    // Since payment is approved for monthly plan, update subscription type
    if (shakil.paymentApproved && shakil.paymentPlanId === 'monthly') {
      await shakil.update({
        subscriptionType: 'monthly',
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
      
      console.log('✅ Updated shakil to monthly subscription');
      
      // Check after update
      const updated = await User.findOne({ where: { email: 'shakil@gmail.com' } });
      console.log('📋 After update:', {
        subscriptionType: updated.subscriptionType,
        subscriptionEndsAt: updated.subscriptionEndsAt,
        paymentPlanId: updated.paymentPlanId,
        paymentApproved: updated.paymentApproved
      });
    } else {
      console.log('❌ Payment not approved or plan not monthly');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixShakil();