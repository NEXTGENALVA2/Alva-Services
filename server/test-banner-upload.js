const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testBannerUpload() {
  try {
    console.log('🧪 Testing banner upload...');
    
    // Create a simple test banner file
    const testImagePath = path.join(__dirname, 'test-banner.txt');
    fs.writeFileSync(testImagePath, 'This is a test banner file');
    
    // Test with a sample websiteId (you can change this)
    const websiteId = '12345-test-id';
    
    const formData = new FormData();
    formData.append('banner', fs.createReadStream(testImagePath));
    formData.append('websiteId', websiteId);
    
    console.log('📤 Making request to banner API...');
    
    const response = await axios.post('http://localhost:5000/api/banner', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Response:', response.data);
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testBannerUpload();