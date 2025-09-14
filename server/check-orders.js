const { Order, OrderItem, Product, sequelize } = require('./models');

async function checkOrdersData() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Get all orders with their details
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ]
    });

    console.log(`Total orders found: ${orders.length}`);

    orders.forEach((order, index) => {
      console.log(`\n--- Order ${index + 1} ---`);
      console.log(`ID: ${order.id}`);
      console.log(`Status: ${order.status}`);
      console.log(`Total Amount: ${order.totalAmount}`);
      console.log(`Customer Division: ${order.customerDivision}`);
      console.log(`Customer District: ${order.customerDistrict}`);
      console.log(`Created: ${order.createdAt}`);
      
      if (order.OrderItems && order.OrderItems.length > 0) {
        console.log('Products:');
        order.OrderItems.forEach(item => {
          console.log(`  - ${item.Product ? item.Product.name : 'Unknown'} (Qty: ${item.quantity}, Price: ${item.price})`);
        });
      }
    });

    // Check delivered orders specifically
    const deliveredOrders = await Order.findAll({
      where: { status: 'delivered' }
    });

    console.log(`\nDelivered orders: ${deliveredOrders.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error checking orders:', error);
    process.exit(1);
  }
}

checkOrdersData();