const express = require('express');
const { User, Subscription } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { Admin } = require('../models');
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Auto-renewal system - Check and renew subscriptions
router.post('/auto-renew', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    
    // Find users whose subscriptions expire today
    const expiringUsers = await User.findAll({
      where: {
        [Op.or]: [
          {
            subscriptionType: 'trial',
            trialEndsAt: {
              [Op.lte]: now
            },
            isActive: true
          },
          {
            subscriptionType: { [Op.ne]: 'trial' },
            subscriptionEndsAt: {
              [Op.lte]: now
            },
            isActive: true
          }
        ]
      }
    });

    let deactivatedUsers = 0;
    let renewedUsers = 0;

    for (const user of expiringUsers) {
      try {
        // If user is on trial, deactivate them (admin will need to manually activate)
        if (user.subscriptionType === 'trial') {
          await user.update({ isActive: false });
          deactivatedUsers++;
          console.log(`Trial expired for user: ${user.email}`);
        }
        // If user has paid subscription, check for auto-renewal
        else {
          // Here you would integrate with payment gateway for auto-renewal
          // For now, we'll deactivate expired paid users too
          await user.update({ isActive: false });
          deactivatedUsers++;
          console.log(`Subscription expired for user: ${user.email}`);
          
          // TODO: Add auto-renewal payment processing here
          // Example: processAutoRenewal(user)
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }
    }

    res.json({
      message: 'Auto-renewal process completed',
      deactivatedUsers,
      renewedUsers,
      totalProcessed: expiringUsers.length
    });

  } catch (error) {
    console.error('Auto-renewal error:', error);
    res.status(500).json({ message: 'Auto-renewal process failed', error: error.message });
  }
});

// Manually renew user subscription (Admin only)
router.post('/renew-user/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { planType, months } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const planDurations = {
      trial: 3,
      monthly: 30,
      '6month': 180,
      yearly: 365
    };

    const duration = months || planDurations[planType] || 30;
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + duration);

    // Update user subscription
    const updateData = {
      isActive: true,
      subscriptionType: planType
    };

    if (planType === 'trial') {
      updateData.trialEndsAt = newEndDate;
    } else {
      updateData.subscriptionEndsAt = newEndDate;
    }

    await user.update(updateData);

    // Create subscription record
    await Subscription.create({
      userId: user.id,
      type: planType,
      amount: 0, // Admin renewal, no charge
      startDate: new Date(),
      endDate: newEndDate,
      status: 'active',
      paymentId: `admin_renewal_${Date.now()}`
    });

    res.json({
      message: `User subscription renewed successfully for ${duration} days`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionType: user.subscriptionType,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Manual renewal error:', error);
    res.status(500).json({ message: 'Manual renewal failed', error: error.message });
  }
});

// Set up auto-renewal for user
router.post('/setup-auto-renewal/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { autoRenew, planType } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add auto-renewal settings to user (you might want to create a separate table for this)
    const settings = user.settings || {};
    settings.autoRenew = autoRenew;
    settings.autoRenewPlan = planType;

    await user.update({ settings });

    res.json({
      message: `Auto-renewal ${autoRenew ? 'enabled' : 'disabled'} for user`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        autoRenewalSettings: settings
      }
    });

  } catch (error) {
    console.error('Setup auto-renewal error:', error);
    res.status(500).json({ message: 'Setup auto-renewal failed', error: error.message });
  }
});

// Get expired users that need admin attention
router.get('/expired-users', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    
    // Find users whose subscriptions have expired and are inactive
    const expiredUsers = await User.findAll({
      where: {
        isActive: false,
        [Op.or]: [
          {
            subscriptionType: 'trial',
            trialEndsAt: {
              [Op.lte]: now
            }
          },
          {
            subscriptionType: { [Op.ne]: 'trial' },
            subscriptionEndsAt: {
              [Op.lte]: now
            }
          }
        ]
      },
      include: [{
        model: Subscription,
        required: false,
        order: [['createdAt', 'DESC']],
        limit: 1
      }],
      order: [['updatedAt', 'DESC']]
    });

    // Calculate how long each user has been expired
    const usersWithExpiredInfo = expiredUsers.map(user => {
      const userData = user.toJSON();
      const expiredDate = userData.subscriptionType === 'trial' 
        ? new Date(userData.trialEndsAt) 
        : new Date(userData.subscriptionEndsAt);
      
      const daysSinceExpiry = Math.floor((now - expiredDate) / (1000 * 60 * 60 * 24));
      
      return {
        ...userData,
        expiredDate: expiredDate.toISOString(),
        daysSinceExpiry
      };
    });

    res.json({
      expiredUsers: usersWithExpiredInfo,
      total: expiredUsers.length
    });

  } catch (error) {
    console.error('Get expired users error:', error);
    res.status(500).json({ message: 'Failed to get expired users', error: error.message });
  }
});

module.exports = router;
