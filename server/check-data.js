const { Website, Product } = require('./models');

async function showData() {
  try {
    console.log('Connecting to database...');
    
    const websites = await Website.findAll({
      include: [{ 
        model: Product, 
        as: 'Products' 
      }]
    });
    
    console.log('\n=== Available Websites ===');
    websites.forEach(w => {
      console.log(`Domain: ${w.domain}`);
      console.log(`Name: ${w.name}`);
      console.log(`Products: ${w.Products?.length || 0}`);
      console.log('---');
    });
    
    console.log('\n=== All Products ===');
    const allProducts = await Product.findAll();
    allProducts.forEach(p => {
      console.log(`${p.name} - ৳${p.price} (Website: ${p.websiteId})`);
    });
    
  } catch (err) {
    console.log('Error:', err.message);
  }
  process.exit(0);
}

showData();
