const express = require('express');
const { User, Subscription } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get current user subscription
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Subscription }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trial has expired
    let isTrialExpired = false;
    let needsRenewal = false;
    
    if (user.subscriptionType === 'trial' && user.trialEndsAt) {
      const now = new Date();
      isTrialExpired = now > new Date(user.trialEndsAt);
      
      if (isTrialExpired && user.isActive) {
        // Auto-deactivate expired trial
        await user.update({ 
          isActive: false,
          subscriptionType: 'expired_trial'
        });
        needsRenewal = true;
      }
    }

    // Return user subscription info with payment details
    const subscriptionData = {
      subscriptionType: user.subscriptionType || 'trial',
      isActive: user.isActive,
      trialEndsAt: user.trialEndsAt,
      subscriptionEndsAt: user.subscriptionEndsAt,
      subscriptionStatus: user.isActive ? 'active' : 'expired',
      isTrialExpired,
      needsRenewal,
      hasUsedTrial: user.hasUsedTrial,
      trialEnabledByAdmin: user.trialEnabledByAdmin,
      // Include payment info if exists
      paymentMethod: user.paymentMethod,
      transactionId: user.transactionId,
      paymentPhone: user.paymentPhone,
      paymentPlanId: user.paymentPlanId,
      paymentApproved: user.paymentApproved
    };

    res.json(subscriptionData);
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start trial subscription
router.post('/trial', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check trial eligibility
    if (user.hasUsedTrial && !user.trialEnabledByAdmin) {
      return res.status(400).json({ 
        message: 'Trial already used. Please choose a paid plan.' 
      });
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 3);

    await user.update({
      subscriptionType: 'trial',
      isActive: true,
      trialEndsAt: trialEnd,
      hasUsedTrial: true,
      trialEnabledByAdmin: false // Reset admin flag after use
    });

    res.json({ 
      success: true, 
      message: 'Trial activated successfully',
      trialEndsAt: trialEnd
    });
  } catch (error) {
    console.error('Trial activation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create paid subscription
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { planId, price } = req.body;

    // Plan configurations
    const plans = {
      monthly: { duration: 30, price: 500 },
      '6month': { duration: 180, price: 2500 },
      yearly: { duration: 365, price: 4500 }
    };

    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Here you would integrate with payment gateway
    // For now, we'll simulate a payment URL
    const paymentUrl = `http://localhost:3000/payment?plan=${planId}&amount=${price}`;

    res.json({
      success: true,
      paymentUrl,
      plan: { id: planId, ...plan }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

// Payment submission endpoint for subscription
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/payments');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/payment', authMiddleware, upload.single('screenshot'), async (req, res) => {
  try {
    console.log('Payment endpoint hit by user:', req.user.email);
    const userId = req.user.id;
    const { planId, paymentMethod, transactionId, paymentPhone } = req.body;
    const screenshotPath = req.file ? `/uploads/payments/${req.file.filename}` : null;

    console.log('Payment data:', { planId, paymentMethod, transactionId, paymentPhone, screenshotPath });

    // Save payment info to DB (add Payment model if needed)
    // For demo, save to User model (add fields if needed)
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user with payment info
    await user.update({
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      paymentPhone: paymentPhone,
      paymentScreenshot: screenshotPath,
      paymentPlanId: planId
    });

    console.log('Payment info saved for user:', user.email);
    res.json({ 
      success: true,
      message: 'Payment info saved', 
      paymentMethod, 
      transactionId, 
      paymentPhone, 
      screenshotPath, 
      planId 
    });
  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
