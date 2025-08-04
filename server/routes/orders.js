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

module.exports = router;
