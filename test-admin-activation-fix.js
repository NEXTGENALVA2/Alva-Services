const axios = require('axios');

async function testAdminActivationFix() {
  try {
    console.log('🧪 Testing Admin Activation Fix...\n');

    // Use the admin token we just got
    const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5NjQ1OTQ5LWYwN2YtNDdlZi05NDkzLWNiNWNkODdiOGUwYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1ODQ3NDY4NywiZXhwIjoxNzYxMDY2Njg3fQ.HU_tvPWDHy-RRlOsxJW_RGfxEoQgjceaK0cvQ1W3syY';
    
    console.log('Step 1: Getting all users to find efty@gmail.com...');
    
    const usersResponse = await axios.get('http://localhost:5000/api/admin/users?search=efty@gmail.com', {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).catch(err => {
      console.log('❌ Need to login as admin first');
      console.log('Please run: node test-admin-login.js to get admin token');
      return null;
    });

    if (!usersResponse) {
      return;
    }

    const eftyUser = usersResponse.data.users.find(u => u.email === 'efty@gmail.com');
    
    if (!eftyUser) {
      console.log('❌ efty@gmail.com user not found');
      return;
    }

    console.log('✅ Found efty@gmail.com user:');
    console.log(`   - ID: ${eftyUser.id}`);
    console.log(`   - Subscription: ${eftyUser.subscriptionType}`);
    console.log(`   - Active: ${eftyUser.isActive}`);
    console.log(`   - Trial Ends: ${eftyUser.trialEndsAt}`);
    
    console.log('\nStep 2: Checking email trial history...');
    
    // Check if this email has used trial before
    const checkEmailResponse = await axios.get(`http://localhost:5000/api/admin/email-trial-status?email=efty@gmail.com`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).catch(err => {
      console.log('❌ Email trial status endpoint might not exist yet');
      console.log('Email trial tracking might still need testing');
      return null;
    });

    console.log('\nStep 3: Testing admin activation (should be blocked if email used trial)...');
    
    // Try to activate trial via admin
    const activationResponse = await axios.put(`http://localhost:5000/api/admin/users/${eftyUser.id}/trial`, {
      action: 'activate',
      days: 3
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).catch(err => {
      if (err.response?.data?.message?.includes('ট্রায়াল ব্যবহার হয়েছে')) {
        console.log('✅ GOOD: Admin activation was blocked!');
        console.log(`   Message: ${err.response.data.message}`);
        
        console.log('\nStep 4: Testing force trial activation...');
        
        // Test the force activation endpoint
        return axios.post(`http://localhost:5000/api/admin/force-trial/${eftyUser.id}`, {
          days: 3,
          reason: 'Testing force activation for email trial bypass - this is a legitimate test case'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        }).then(response => {
          console.log('✅ Force trial activation successful:');
          console.log(`   Message: ${response.data.message}`);
          console.log(`   Warning: ${response.data.warning}`);
          console.log('✅ System is working correctly - admin can force when needed');
        }).catch(forceErr => {
          console.log('❌ Force trial failed:');
          console.log(`   Error: ${forceErr.response?.data?.message || forceErr.message}`);
        });
      } else {
        console.log('❌ Unexpected error:');
        console.log(`   Error: ${err.response?.data?.message || err.message}`);
      }
    });

    if (activationResponse) {
      console.log('⚠️  WARNING: Admin activation was NOT blocked!');
      console.log('This suggests the email trial restriction might not be working');
      console.log(`Response: ${activationResponse.data.message}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminActivationFix();