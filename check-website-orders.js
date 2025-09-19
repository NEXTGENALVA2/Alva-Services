const { Order, OrderItem, Product, Website, User, sequelize } = require('./server/models');

async function checkWebsiteAndOrders() {
  try {
    console.log('Checking Users, Websites, and Orders...\n');

    // Check all users
    const users = await User.findAll({
      attributes: ['id', 'email', 'createdAt']
    });
    console.log('Total users:', users.length);
    users.forEach(user => {
      console.log(`User ID: ${user.id}, Email: ${user.email}`);
    });

    console.log('\n--- Websites ---');
    // Check all websites
    const websites = await Website.findAll({
      include: [{ model: User, attributes: ['email'] }],
      attributes: ['id', 'domain', 'userId', 'createdAt']
    });
    console.log('Total websites:', websites.length);
    websites.forEach(website => {
      console.log(`Website ID: ${website.id}, Domain: ${website.domain}, User ID: ${website.userId}, User Email: ${website.User?.email}`);
    });

    console.log('\n--- Orders by Website ---');
    // Check orders grouped by website
    const ordersByWebsite = await Order.findAll({
      attributes: [
        'websiteId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'delivered' THEN 1 END")), 'deliveredCount'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue']
      ],
      group: ['websiteId'],
      raw: true
    });

    console.log('Orders by website:');
    for (const orderData of ordersByWebsite) {
      const website = await Website.findByPk(orderData.websiteId, {
        include: [{ model: User, attributes: ['email'] }]
      });
      console.log(`Website ID: ${orderData.websiteId}`);
      console.log(`  Domain: ${website?.domain || 'Unknown'}`);
      console.log(`  User: ${website?.User?.email || 'Unknown'}`);
      console.log(`  Total Orders: ${orderData.orderCount}`);
      console.log(`  Delivered Orders: ${orderData.deliveredCount}`);
      console.log(`  Total Revenue: ৳${orderData.totalRevenue}\n`);
    }

    // Check if there are any orders without websiteId
    const ordersWithoutWebsite = await Order.count({
      where: {
        websiteId: null
      }
    });
    console.log(`Orders without website ID: ${ordersWithoutWebsite}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkWebsiteAndOrders();