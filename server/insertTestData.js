// Test data insertion script
const { Website, Product, User } = require('./models');

async function insertTestData() {
  try {
    // Create a test user first
    const testUser = await User.findOrCreate({
      where: { email: 'test@example.com' },
      defaults: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword123'
      }
    });

    // Create test website
    const testWebsite = await Website.findOrCreate({
      where: { domain: 'test-domain' },
      defaults: {
        name: 'টেস্ট শপ',
        domain: 'test-domain',
        heroTitle: 'স্বাগতম আমাদের অনলাইন শপে',
        heroSubtitle: 'সেরা মানের পণ্য, সাশ্রয়ী দামে',
        heroBanner: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        userId: testUser[0].id
      }
    });

    // Create test products
    const products = [
      {
        name: 'স্মার্ট ওয়াচ',
        price: 2500,
        oldPrice: 3000,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop'],
        category: 'ইলেকট্রনিক্স',
        shortDesc: 'অ্যান্ড্রয়েড এবং iOS সাপোর্ট',
        description: 'উন্নত স্মার্ট ওয়াচ যা আপনার স্বাস্থ্য ট্র্যাক করে',
        stock: 15,
        sold: 25,
        websiteId: testWebsite[0].id
      },
      {
        name: 'ওয়্যারলেস হেডফোন',
        price: 1800,
        oldPrice: 2200,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'],
        category: 'অডিও',
        shortDesc: 'নয়েজ ক্যান্সেলেশন ফিচার',
        description: 'প্রিমিয়াম কোয়ালিটি হেডফোন',
        stock: 8,
        sold: 42,
        websiteId: testWebsite[0].id
      },
      {
        name: 'ব্লুটুথ স্পিকার',
        price: 3200,
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop'],
        category: 'অডিও',
        shortDesc: 'পাওয়ারফুল সাউন্ড কোয়ালিটি',
        description: 'উচ্চ মানের সাউন্ড সিস্টেম',
        stock: 12,
        sold: 18,
        websiteId: testWebsite[0].id
      },
      {
        name: 'ক্যাজুয়াল টি-শার্ট',
        price: 850,
        oldPrice: 1200,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop'],
        category: 'পোশাক',
        shortDesc: '১০০% কটন, আরামদায়ক',
        description: 'উন্নত মানের টি-শার্ট',
        stock: 25,
        sold: 67,
        websiteId: testWebsite[0].id
      }
    ];

    for (const productData of products) {
      await Product.findOrCreate({
        where: { 
          name: productData.name,
          websiteId: productData.websiteId 
        },
        defaults: productData
      });
    }

    console.log('Test data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting test data:', error);
    process.exit(1);
  }
}

insertTestData();
