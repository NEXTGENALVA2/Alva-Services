// Simple domain change test
async function testDomain() {
  const axios = require('axios');
  
  try {
    // Get token for nextgen.alva@gmail.com
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'nextgen.alva@gmail.com',
      password: '123456'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login successful');
    
    // Get current domain
    const currentDomain = await axios.get('http://localhost:5000/api/domain', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📋 Current domain:', currentDomain.data);
    
    // Change domain to "sohel"
    const changeRes = await axios.post('http://localhost:5000/api/domain', {
      domain: 'sohel'
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Domain change result:', changeRes.data);
    
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

testDomain();
