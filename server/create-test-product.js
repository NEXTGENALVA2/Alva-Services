const { sequelize, Product, Website } = require('./models');

async function createTestProduct() {
  try {
    // Get the website we created
    const website = await Website.findOne({
      where: { domain: 'mashyekh-1756107896786' }
    });
    
    if (!website) {
      console.log('Website not found');
      return;
    }
    
    console.log('Found website:', website.id);
    
    // Create a test product with UUID
    const product = await Product.create({
      id: '3444e8f3-b37d-4366-96b2-49247f023422',
      name: 'Test Product',
      price: 100,
      description: 'Test product for order testing',
      websiteId: website.id,
      isActive: true,
      category: 'test'
    });
    
    console.log('Test product created:', product.id);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test product:', error);
    process.exit(1);
  }
}

createTestProduct();
