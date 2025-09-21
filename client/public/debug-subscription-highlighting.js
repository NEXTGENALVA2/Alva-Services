// Debug subscription highlighting issue
// Run this in browser console to see the exact comparison logic

console.log('🔍 Debugging Plan Highlighting Issue...\n');

// Get current subscription data
const subscription = currentSubscription;
console.log('📋 Current Subscription:', subscription);

// Check each plan's highlighting logic
const plans = [
  { id: 'trial', name: '৩ দিন ট্রায়াল' },
  { id: 'monthly', name: 'মাসিক প্ল্যান' },
  { id: '6month', name: '৬ মাস প্ল্যান' },
  { id: 'yearly', name: 'বার্ষিক প্ল্যান' }
];

console.log('\n🎯 Plan Highlighting Analysis:');
plans.forEach(plan => {
  console.log(`\n📋 Plan: ${plan.name} (ID: ${plan.id})`);
  
  // Check payment-based highlighting
  const paymentMatch = subscription?.paymentApproved && subscription?.paymentPlanId === plan.id;
  console.log(`   💳 Payment Match: ${paymentMatch}`);
  console.log(`      paymentApproved: ${subscription?.paymentApproved}`);
  console.log(`      paymentPlanId: ${subscription?.paymentPlanId}`);
  
  // Check subscription type matching
  const typeMatch = subscription?.isActive && subscription?.subscriptionType === plan.id;
  console.log(`   📊 Type Match: ${typeMatch}`);
  console.log(`      isActive: ${subscription?.isActive}`);
  console.log(`      subscriptionType: ${subscription?.subscriptionType}`);
  
  // Final highlighting decision
  const shouldHighlight = subscription?.isActive && (paymentMatch || typeMatch);
  console.log(`   ✨ Should Highlight: ${shouldHighlight}`);
});

console.log('\n📝 Summary:');
console.log(`Active subscription type: ${subscription?.subscriptionType}`);
console.log(`Payment plan ID: ${subscription?.paymentPlanId}`);
console.log(`Payment approved: ${subscription?.paymentApproved}`);
console.log(`Is active: ${subscription?.isActive}`);