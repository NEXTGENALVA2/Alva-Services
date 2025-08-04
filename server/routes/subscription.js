const express = require('express');
const { User, Subscription } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get subscription plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 500,
      duration: 30,
      features: ['Unlimited Products', 'Dashboard Analytics', 'Payment Gateway', 'Customer Support']
    },
    {
      id: '6month',
      name: '6 Month Plan',
      price: 2400,
      duration: 180,
      features: ['All Monthly Features', '20% Discount', 'Priority Support', 'Advanced Analytics']
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      price: 3600,
      duration: 365,
      features: ['All 6 Month Features', '40% Discount', 'Dedicated Support', 'Custom Features']
    }
  ];
  
  res.json(plans);
});

// Subscribe to a plan
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { planType, paymentId } = req.body;
    const userId = req.user.id;

    const planPrices = {
      monthly: { amount: 500, days: 30 },
      '6month': { amount: 2400, days: 180 },
      yearly: { amount: 3600, days: 365 }
    };

    const plan = planPrices[planType];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.days);

    // Create subscription record
    const subscription = await Subscription.create({
      userId,
      type: planType,
      amount: plan.amount,
      startDate,
      endDate,
      paymentId,
      status: 'active'
    });

    // Update user subscription
    await User.update({
      subscriptionType: planType,
      subscriptionEndsAt: endDate,
      isActive: true
    }, {
      where: { id: userId }
    });

    res.status(201).json({
      message: 'Subscription activated successfully!',
      subscription: {
        type: planType,
        endsAt: endDate,
        amount: plan.amount
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error processing subscription', error: error.message });
  }
});

// Get current subscription
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Subscription,
        where: { status: 'active' },
        required: false,
        order: [['createdAt', 'DESC']],
        limit: 1
      }]
    });

    res.json({
      subscriptionType: user.subscriptionType,
      subscriptionEndsAt: user.subscriptionEndsAt,
      trialEndsAt: user.trialEndsAt,
      isActive: user.isActive,
      currentSubscription: user.Subscriptions?.[0] || null
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription', error: error.message });
  }
});

module.exports = router;
