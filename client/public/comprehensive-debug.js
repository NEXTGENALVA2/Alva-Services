// Comprehensive User Status Debug Script
// This will automatically check everything and report the exact issue

window.debugUserStatus = async function() {
  console.clear();
  console.log('🚀 Starting comprehensive user status debug...\n');

  // Step 1: Check token
  const token = localStorage.getItem('token');
  console.log('1️⃣ TOKEN CHECK:');
  console.log('   Token exists:', token ? '✅ YES' : '❌ NO');
  if (token) {
    console.log('   Token preview:', token.substring(0, 20) + '...');
  } else {
    console.log('   ❌ NO TOKEN - This is the problem!');
    return;
  }

  // Step 2: Check user profile
  console.log('\n2️⃣ USER PROFILE CHECK:');
  try {
    const profileRes = await fetch('http://localhost:5000/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!profileRes.ok) {
      console.log('   ❌ Profile API failed:', profileRes.status);
      const errorText = await profileRes.text();
      console.log('   Error details:', errorText);
      return;
    }
    
    const profile = await profileRes.json();
    console.log('   ✅ Profile API success');
    console.log('   User ID:', profile.id);
    console.log('   User Email:', profile.email);
    console.log('   User Name:', profile.name);
    console.log('   🔑 IS ACTIVE:', profile.isActive ? '✅ YES' : '❌ NO');
    console.log('   Has Used Trial:', profile.hasUsedTrial);
    console.log('   Trial Enabled By Admin:', profile.trialEnabledByAdmin);
    
    if (!profile.isActive) {
      console.log('   🚨 PROBLEM FOUND: User is INACTIVE');
      console.log('   This is why sidebar is locked!');
    }
  } catch (error) {
    console.log('   ❌ Profile check failed:', error.message);
    return;
  }

  // Step 3: Check subscription
  console.log('\n3️⃣ SUBSCRIPTION CHECK:');
  try {
    const subRes = await fetch('http://localhost:5000/api/subscription/current', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!subRes.ok) {
      console.log('   ❌ Subscription API failed:', subRes.status);
      return;
    }
    
    const subscription = await subRes.json();
    console.log('   ✅ Subscription API success');
    console.log('   Subscription Type:', subscription.subscriptionType);
    console.log('   Subscription Active:', subscription.isActive);
    console.log('   Trial Ends At:', subscription.trialEndsAt);
    console.log('   Subscription Ends At:', subscription.subscriptionEndsAt);
  } catch (error) {
    console.log('   ❌ Subscription check failed:', error.message);
  }

  // Step 4: Check current path
  console.log('\n4️⃣ ROUTING CHECK:');
  console.log('   Current URL:', window.location.href);
  console.log('   Current Path:', window.location.pathname);
  
  const allowedPages = ['/dashboard/subscription', '/auth/login', '/auth/register'];
  console.log('   Allowed Pages:', allowedPages);
  console.log('   Is on allowed page:', allowedPages.includes(window.location.pathname) ? '✅ YES' : '❌ NO');

  // Step 5: Test event system
  console.log('\n5️⃣ EVENT SYSTEM TEST:');
  console.log('   Firing userStatusUpdated event...');
  window.dispatchEvent(new CustomEvent('userStatusUpdated', { 
    detail: { test: true, timestamp: new Date().toISOString() } 
  }));
  console.log('   ✅ Event fired');

  // Step 6: Check component states
  console.log('\n6️⃣ COMPONENT STATE CHECK:');
  console.log('   Checking if AccountGuard is listening...');
  setTimeout(() => {
    console.log('   🔄 Watch console for AccountGuard logs in next few seconds...');
  }, 1000);

  console.log('\n🎯 DEBUG SUMMARY:');
  console.log('   If user isActive = false → Admin needs to activate user');
  console.log('   If user isActive = true → Check AccountGuard logs above');
  console.log('   If no AccountGuard logs → Component not mounted properly');
  
  console.log('\n💡 NEXT STEPS:');
  console.log('   1. Check the "IS ACTIVE" status above');
  console.log('   2. If false → Go to admin dashboard and activate user');
  console.log('   3. If true → Look for AccountGuard detailed logs');
  console.log('   4. Report findings to developer');
};

// Auto-run the debug
console.log('🔧 User Status Debug Tool Loaded');
console.log('📋 Running automatic debug check...');
window.debugUserStatus();