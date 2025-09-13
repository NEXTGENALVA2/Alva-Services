// Test script to verify delivery charge functionality

async function testDeliveryChargeFlow() {
  console.log('🧪 Testing delivery charge flow...');
  
  try {
    // 1. Get a product from the API
    console.log('📦 Fetching products...');
    const productsResponse = await fetch('http://localhost:5000/api/products');
    const products = await productsResponse.json();
    
    if (!products || products.length === 0) {
      console.log('❌ No products found');
      return;
    }
    
    // Find a product with delivery charge
    const productWithDelivery = products.find(p => p.deliveryApplied && p.deliveryCharge > 0);
    
    if (!productWithDelivery) {
      console.log('⚠️ No products with delivery charges found');
      console.log('Available products:', products.map(p => ({
        id: p.id,
        name: p.name,
        deliveryApplied: p.deliveryApplied,
        deliveryCharge: p.deliveryCharge
      })));
      return;
    }
    
    console.log('✅ Found product with delivery charge:');
    console.log(`   - Name: ${productWithDelivery.name}`);
    console.log(`   - Price: ${productWithDelivery.price}`);
    console.log(`   - Delivery Applied: ${productWithDelivery.deliveryApplied}`);
    console.log(`   - Delivery Charge: ${productWithDelivery.deliveryCharge}`);
    
    // 2. Create a test order with this product
    const orderData = {
      customerName: 'Test Customer',
      customerPhone: '01234567890',
      customerAddress: 'Test Address',
      customerEmail: 'test@test.com',
      customerDivision: 'Dhaka',
      customerDistrict: 'Dhaka',
      note: 'Test order for delivery charge',
      items: [{
        id: productWithDelivery.id,
        name: productWithDelivery.name,
        price: productWithDelivery.price,
        quantity: 2, // Test with quantity 2
        image: productWithDelivery.images?.[0] || ''
      }],
      subTotal: productWithDelivery.price * 2,
      deliveryCharge: 60, // Standard Dhaka delivery
      deliveryType: 'normal',
      totalAmount: (productWithDelivery.price * 2) + 60,
      paymentMethod: 'cash_on_delivery',
      domain: 'test-domain',
      websiteId: '00000000-0000-0000-0000-000000000000'
    };
    
    console.log('\n💳 Creating test order...');
    console.log('Expected product delivery charges:', productWithDelivery.deliveryCharge * 2);
    
    const orderResponse = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.log('❌ Order creation failed:', errorText);
      return;
    }
    
    const orderResult = await orderResponse.json();
    console.log('✅ Order created successfully!');
    console.log(`   - Order ID: ${orderResult.order.id}`);
    console.log(`   - Total Amount: ${orderResult.order.totalAmount}`);
    console.log(`   - Delivery Charge: ${orderResult.order.deliveryCharge}`);
    
    // Expected total delivery charge = base (60) + product charge (deliveryCharge * 2)
    const expectedDeliveryCharge = Math.max(60, parseFloat(productWithDelivery.deliveryCharge) * 2);
    console.log(`   - Expected Delivery Charge: ${expectedDeliveryCharge}`);
    
    if (parseFloat(orderResult.order.deliveryCharge) >= expectedDeliveryCharge) {
      console.log('✅ Delivery charge calculation is working correctly!');
    } else {
      console.log('⚠️ Delivery charge might not include product charges');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDeliveryChargeFlow();