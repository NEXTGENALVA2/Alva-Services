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

    // Validate required fields
    if (!customerName || !customerPhone || !customerAddress || !items || !totalAmount || !websiteId) {
      return res.status(400).json({ 
        message: 'Required fields: customerName, customerPhone, customerAddress, items, totalAmount, websiteId' 
      });
    }

    // Verify website exists
    const website = await Website.findByPk(websiteId);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
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
    const { status } = req.body;

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

    await order.update({ status });

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
