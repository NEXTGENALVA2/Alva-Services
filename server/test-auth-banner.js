const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testBannerWithAuth() {
  try {
    console.log('🔐 Testing banner upload with authentication...');
    
    // First login to get token
    console.log('🔑 Attempting login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@test.com', // Use test credentials
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // Create a simple test image file
    const testImagePath = path.join(__dirname, 'auth-test.png');
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, imageBuffer);
    
    // Use a real websiteId from our database
    const websiteId = 'b12b0129-fd17-45cc-a1ba-df9d4d53c5c1'; // sani-1756318573580
    
    const formData = new FormData();
    formData.append('banner', fs.createReadStream(testImagePath), {
      filename: 'auth-test.png',
      contentType: 'image/png'
    });
    formData.append('websiteId', websiteId);
    
    console.log('📤 Making authenticated request to banner API...');
    console.log('📋 Using websiteId:', websiteId);
    
    const response = await axios.post('http://localhost:5000/api/banner', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', response.data);
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
    // Check if banner was created in database
    console.log('\n🔍 Checking database...');
    const { Banner } = require('./models');
    const banners = await Banner.findAll({ 
      where: { websiteId },
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    console.log('📊 Latest banners in database:', banners.map(b => ({
      id: b.id,
      imageUrl: b.imageUrl,
      websiteId: b.websiteId,
      createdAt: b.createdAt
    })));
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  } finally {
    process.exit();
  }
}

testBannerWithAuth();