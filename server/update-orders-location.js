const { Order, sequelize } = require('./models');

async function updateOrdersLocation() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Get all orders that don't have location data
    const orders = await Order.findAll({
      where: {
        customerDivision: null
      }
    });

    console.log(`Found ${orders.length} orders without location data`);

    // Update each order with sample location data
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      
      // Sample Bangladesh divisions and districts
      const locations = [
        { division: 'ঢাকা', district: 'ঢাকা' },
        { division: 'ঢাকা', district: 'গাজীপুর' },
        { division: 'ঢাকা', district: 'ফরিদপুর' },
        { division: 'চট্টগ্রাম', district: 'চট্টগ্রাম' },
        { division: 'চট্টগ্রাম', district: 'কক্সবাজার' },
        { division: 'সিলেট', district: 'সিলেট' },
        { division: 'রাজশাহী', district: 'রাজশাহী' },
        { division: 'খুলনা', district: 'খুলনা' },
        { division: 'বরিশাল', district: 'বরিশাল' },
        { division: 'রংপুর', district: 'রংপুর' }
      ];

      // Pick a location based on order index to have some variety
      const location = locations[i % locations.length];

      await order.update({
        customerDivision: location.division,
        customerDistrict: location.district
      });

      console.log(`Updated order ${order.id} with location: ${location.division} - ${location.district}`);
    }

    console.log('✅ All orders updated with location data');
    process.exit(0);
  } catch (error) {
    console.error('Error updating orders:', error);
    process.exit(1);
  }
}

updateOrdersLocation();