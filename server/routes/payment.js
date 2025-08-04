const express = require('express');
const { Order } = require('../models');

const router = express.Router();

// Initialize payment
router.post('/init', async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // SSLCommerz integration would go here
    // For now, return a mock payment URL
    const paymentData = {
      paymentUrl: `https://sandbox.sslcommerz.com/gwprocess/v4/api.php?orderId=${orderId}`,
      transactionId: `TXN_${Date.now()}`,
      amount: order.totalAmount,
      currency: 'BDT'
    };

    res.json(paymentData);
  } catch (error) {
    res.status(500).json({ message: 'Error initializing payment', error: error.message });
  }
});

// Payment success callback
router.post('/success', async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;

    await Order.update({
      paymentStatus: 'paid',
      status: 'confirmed'
    }, {
      where: { id: orderId }
    });

    res.json({ message: 'Payment successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment success', error: error.message });
  }
});

// Payment failure callback
router.post('/failure', async (req, res) => {
  try {
    const { orderId } = req.body;

    await Order.update({
      paymentStatus: 'failed'
    }, {
      where: { id: orderId }
    });

    res.json({ message: 'Payment failed' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment failure', error: error.message });
  }
});

module.exports = router;
