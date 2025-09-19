const https = require('https');
const http = require('http');

function makeRequest(url, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const module = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: headers
    };

    const req = module.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function testAnalyticsAPI() {
  try {
    console.log('Testing Analytics API endpoints...\n');
    
    // Test token (you might need to get a fresh one from localStorage)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzI2NDc3NzkxfQ.lVf4rCGaYq2hJLdBfLVKIEp__dXOgQNiF8tNt1-Fqco';
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test customer distribution
    console.log('1. Testing customer-distribution endpoint...');
    try {
      const response1 = await makeRequest('http://localhost:5000/api/analytics/customer-distribution', headers);
      console.log('Status:', response1.status);
      console.log('Customer Distribution:', response1.data);
    } catch (error) {
      console.error('Error in customer-distribution:', error.message);
    }

    // Test stats endpoint
    console.log('\n2. Testing stats endpoint...');
    try {
      const response2 = await makeRequest('http://localhost:5000/api/analytics/stats', headers);
      console.log('Status:', response2.status);
      console.log('Stats:', response2.data);
    } catch (error) {
      console.error('Error in stats:', error.message);
    }

    // Test realtime endpoint
    console.log('\n3. Testing realtime endpoint...');
    try {
      const response3 = await makeRequest('http://localhost:5000/api/analytics/realtime', headers);
      console.log('Status:', response3.status);
      console.log('Realtime:', response3.data);
    } catch (error) {
      console.error('Error in realtime:', error.message);
    }

  } catch (error) {
    console.error('General error:', error.message);
  }
}

testAnalyticsAPI();