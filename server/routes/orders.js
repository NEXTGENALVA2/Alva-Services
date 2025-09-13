const express = require('express');
const { Order, OrderItem, Product, Website } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all orders for user's website
router.get('/', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const orders = await Order.findAll({
      where: { websiteId: website.id },
      include: [{
        model: OrderItem,
        include: [Product]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const order = await Order.findOne({
      where: { id, websiteId: website.id },
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// Update order status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, courierService } = req.body;

    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const order = await Order.findOne({
      where: { id, websiteId: website.id }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({
      status,
      trackingNumber,
      courierService
    });

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
});

// Create order (public API for website customers)
router.post('/', async (req, res) => {
  try {
    console.log('Order creation request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      customerName, 
      customerPhone, 
      customerAddress, 
      customerEmail,
      customerDivision,
      customerDistrict,
      items, 
      totalAmount,
      subTotal,
      deliveryCharge = 0,
      deliveryType = 'normal',
      paymentMethod = 'cash_on_delivery',
      websiteId,
      note
    } = req.body;

    console.log('Extracted websiteId:', websiteId);

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || !items || !totalAmount || !websiteId) {
      console.log('Missing required fields. CustomerName:', !!customerName, 'CustomerPhone:', !!customerPhone, 'CustomerAddress:', !!customerAddress, 'Items:', !!items, 'TotalAmount:', !!totalAmount, 'WebsiteId:', !!websiteId);
      return res.status(400).json({ 
        message: 'Required fields: customerName, customerPhone, customerAddress, items, totalAmount, websiteId' 
      });
    }

    // Verify website exists or create if needed
    let website = await Website.findByPk(websiteId);
    
    // If not found by ID, try to find by domain
    if (!website && req.body.domain) {
      console.log('Website not found by ID, searching by domain:', req.body.domain);
      website = await Website.findOne({ 
        where: { domain: req.body.domain } 
      });
      if (website) {
        console.log('Found website by domain:', website.id);
        websiteId = website.id; // Update websiteId to use the found website's ID
      }
    }
    
    if (!website) {
      // Auto-create website entry for fallback websiteId
      console.log('Creating fallback website entry for domain:', req.body.domain);
      try {
        // Create with a simple domain-based name, let DB auto-generate UUID
        website = await Website.create({
          name: `Auto Website - ${req.body.domain || 'Unknown'}`,
          domain: req.body.domain || 'unknown-domain',
          userId: null, // Auto-generated websites don't have a specific user
          settings: {}
        });
        console.log('Successfully created fallback website:', website.id);
        websiteId = website.id; // Use the auto-generated ID
      } catch (err) {
        console.error('Failed to create website entry:', err);
        return res.status(400).json({ message: 'Invalid websiteId format or creation failed' });
      }
    }

    // Create order with delivery information
    const order = await Order.create({
      customerName,
      customerPhone,
      customerAddress,
      customerEmail,
      customerDivision,
      customerDistrict,
      totalAmount,
      subTotal: subTotal || totalAmount - deliveryCharge,
      deliveryCharge,
      deliveryType,
      paymentMethod,
      status: 'pending',
      websiteId,
      note
    });

    // Verify and calculate actual delivery charges from database
    let calculatedDeliveryCharge = 0;
    for (const item of items) {
      try {
        const product = await Product.findByPk(item.id);
        if (product && product.deliveryApplied && product.deliveryCharge > 0) {
          const itemDeliveryCharge = parseFloat(product.deliveryCharge) * item.quantity;
          calculatedDeliveryCharge += itemDeliveryCharge;
          console.log(`Product ${product.name}: delivery charge ${product.deliveryCharge} x ${item.quantity} = ${itemDeliveryCharge}`);
        }
      } catch (err) {
        console.error(`Error fetching product ${item.id} for delivery calculation:`, err);
      }
    }
    
    console.log('Backend calculated product delivery charges:', calculatedDeliveryCharge);
    console.log('Frontend sent delivery charge:', deliveryCharge);
    
    // Use the higher of calculated vs sent delivery charge for security
    // (in case frontend calculation was tampered with)
    const finalDeliveryCharge = Math.max(calculatedDeliveryCharge, deliveryCharge || 0);
    
    // Update order with verified delivery charge if different
    if (finalDeliveryCharge !== deliveryCharge) {
      console.log(`Updating delivery charge from ${deliveryCharge} to ${finalDeliveryCharge}`);
      await order.update({
        deliveryCharge: finalDeliveryCharge,
        totalAmount: (subTotal || totalAmount - deliveryCharge) + finalDeliveryCharge
      });
    }

    // Create order items
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity, // Add totalPrice calculation
        productName: item.name,
        productImage: item.image
      });
    }

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: completeOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Update order (for dashboard)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      customerDivision, 
      customerDistrict, 
      advancePayment, 
      deliveryCharge 
    } = req.body;

    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const order = await Order.findOne({
      where: { id, websiteId: website.id }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update only the fields that are provided
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (customerDivision !== undefined) updateData.customerDivision = customerDivision;
    if (customerDistrict !== undefined) updateData.customerDistrict = customerDistrict;
    if (advancePayment !== undefined) updateData.advancePayment = advancePayment;
    if (deliveryCharge !== undefined) updateData.deliveryCharge = deliveryCharge;

    await order.update(updateData);

    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// Delete order (for dashboard)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const order = await Order.findOne({
      where: { id, websiteId: website.id }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Delete order items first
    await OrderItem.destroy({ where: { orderId: id } });
    
    // Delete order
    await order.destroy();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
});

module.exports = router;
