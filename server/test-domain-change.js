const axios = require('axios');

async function testDomainChange() {
  try {
    // First login to get token (using nextgen.alva@gmail.com)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'nextgen.alva@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('Login successful, token:', token.substring(0, 20) + '...');

    // Get current domain
    const getDomainResponse = await axios.get('http://localhost:5000/api/domain', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Current domain info:', getDomainResponse.data);

    // Try to change domain to "newname"
    const changeDomainResponse = await axios.post('http://localhost:5000/api/domain', {
      domain: 'newname'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Domain change response:', changeDomainResponse.data);

    // Get updated domain
    const getUpdatedDomainResponse = await axios.get('http://localhost:5000/api/domain', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Updated domain info:', getUpdatedDomainResponse.data);

  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  }
}

testDomainChange();
