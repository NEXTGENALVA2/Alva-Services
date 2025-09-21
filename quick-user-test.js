// Quick User Status Test
// Copy-paste this entire code block into browser console

console.log('🚀 Quick User Status Test Starting...\n');

async function quickUserTest() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ NO TOKEN FOUND - User needs to login');
    return;
  }
  
  console.log('✅ Token found');
  
  try {
    // Check user profile
    const response = await fetch('http://localhost:5000/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
      console.log('❌ API Error:', response.status, response.statusText);
      return;
    }
    
    const userData = await response.json();
    
    console.log('📋 User Data:');
    console.log('   Email:', userData.email);
    console.log('   Name:', userData.name);
    console.log('   🔑 IS ACTIVE:', userData.isActive ? '✅ YES' : '❌ NO');
    
    if (userData.isActive) {
      console.log('\n🎉 USER IS ACTIVE!');
      console.log('   Dashboard should be unlocked');
      console.log('   If still locked, there\'s a frontend issue');
      
      // Test event system
      console.log('\n🔥 Testing event system...');
      window.dispatchEvent(new CustomEvent('userStatusUpdated'));
      console.log('   Event fired - check for component responses');
      
    } else {
      console.log('\n🔒 USER IS INACTIVE!');
      console.log('   This is why dashboard is locked');
      console.log('   Admin needs to activate this user');
      console.log('   User data:', userData);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

// Run the test
quickUserTest();