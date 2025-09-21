const axios = require('axios');

async function loginAsAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    
    const response = await axios.post('http://localhost:5000/api/admin/login', {
      username: 'admin',      // Using dev fallback username
      password: 'admin123'    // Using dev fallback password
    });

    console.log('✅ Admin login successful!');
    console.log(`Token: ${response.data.token}`);
    console.log('Copy this token to use in other tests\n');
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data?.message || error.message);
    console.log('Make sure the server is running on port 5000');
    return null;
  }
}

loginAsAdmin();