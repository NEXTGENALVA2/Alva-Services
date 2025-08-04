const express = require('express');
const axios = require('axios');
const { Order } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get available courier services
router.get('/services', (req, res) => {
  const services = [
    {
      id: 'pathao',
      name: 'Pathao Courier',
      zones: ['Dhaka', 'Chittagong', 'Sylhet', 'Khulna'],
      baseCharge: 60
    },
    {
      id: 'steadfast',
      name: 'Steadfast Courier',
      zones: ['All Bangladesh'],
      baseCharge: 50
    }
  ];

  res.json(services);
});

// Create shipment
router.post('/shipment', authMiddleware, async (req, res) => {
  try {
    const { orderId, courierService, pickupAddress } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let trackingNumber;
    
    if (courierService === 'pathao') {
      // Pathao API integration would go here
      trackingNumber = `PA${Date.now()}`;
    } else if (courierService === 'steadfast') {
      // Steadfast API integration would go here
      trackingNumber = `SF${Date.now()}`;
    }

    await order.update({
      trackingNumber,
      courierService,
      status: 'shipped'
    });

    res.json({
      message: 'Shipment created successfully',
      trackingNumber,
      courierService
    });

  } catch (error) {
    res.status(500).json({ message: 'Error creating shipment', error: error.message });
  }
});

// Track shipment
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const order = await Order.findOne({ where: { trackingNumber } });
    if (!order) {
      return res.status(404).json({ message: 'Tracking number not found' });
    }

    // Mock tracking data
    const trackingData = {
      trackingNumber,
      status: order.status,
      courierService: order.courierService,
      events: [
        {
          date: order.createdAt,
          status: 'Order Placed',
          location: 'Warehouse'
        },
        {
          date: order.updatedAt,
          status: 'In Transit',
          location: 'Distribution Center'
        }
      ]
    };

    res.json(trackingData);
  } catch (error) {
    res.status(500).json({ message: 'Error tracking shipment', error: error.message });
  }
});

module.exports = router;
