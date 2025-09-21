// User Status Debug Tool
// Open browser console and run: checkCurrentUserStatus()

window.checkCurrentUserStatus = async function() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token found');
      return;
    }

    console.log('🔍 Checking current user status...');

    // Check profile
    const profileResponse = await fetch('http://localhost:5000/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profile = await profileResponse.json();

    // Check subscription
    const subscriptionResponse = await fetch('http://localhost:5000/api/subscription/current', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const subscription = await subscriptionResponse.json();

    console.log('👤 Profile Data:', profile);
    console.log('📋 Subscription Data:', subscription);

    console.log('\n📊 Status Summary:');
    console.log('✅ User Active:', profile.isActive);
    console.log('📅 Subscription Type:', subscription.subscriptionType);
    console.log('⏰ Trial Ends At:', subscription.trialEndsAt);
    console.log('💰 Subscription Ends At:', subscription.subscriptionEndsAt);
    console.log('🔒 Has Used Trial:', profile.hasUsedTrial);
    console.log('👨‍💼 Trial Enabled By Admin:', profile.trialEnabledByAdmin);

    if (profile.isActive) {
      console.log('🚀 USER SHOULD HAVE DASHBOARD ACCESS!');
    } else {
      console.log('🔒 USER IS LOCKED OUT');
    }

    // Test event firing
    console.log('\n🔥 Testing event system...');
    window.dispatchEvent(new CustomEvent('userStatusUpdated', { 
      detail: { test: true } 
    }));

  } catch (error) {
    console.error('❌ Error checking user status:', error);
  }
};

console.log('🛠️ Debug tool loaded! Run: checkCurrentUserStatus()');