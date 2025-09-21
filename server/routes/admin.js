const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, User, Subscription, sequelize } = require('../models');
const { Op } = require('sequelize');
const EmailTrialTracker = require('../utils/EmailTrialTracker');

const router = express.Router();

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Try to load admin from DB. If DB is unavailable, allow a dev fallback token
    let admin = null;
    try {
      admin = await Admin.findByPk(decoded.id);
    } catch (err) {
      // DB probably unavailable
      console.warn('adminAuth: DB lookup failed:', err.message || err);
    }

    // If admin not found in DB, allow development-only fallback when token contains dev:true
    if (!admin) {
      if (process.env.NODE_ENV !== 'production' && decoded && decoded.dev === true) {
        // Create a temporary admin object for dev mode
        req.admin = {
          id: 'dev',
          username: decoded.username || 'admin',
          email: decoded.email || 'admin@local',
          role: 'super_admin',
          isActive: true
        };
        return next();
      }

      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Admin login attempt:', { username, passwordProvided: !!password });

    // Check admin by username or email
    let admin = null;
    let dbError = null;
    try {
      admin = await Admin.findOne({ 
        where: { 
          [Op.or]: [
            { username },
            { email: username }
          ]
        } 
      });
    } catch (err) {
      dbError = err;
      console.warn('Admin login: DB lookup failed:', err.message || err);
    }

    if (!admin) {
      // When DB is unavailable allow a dev-only fallback login (admin/admin123)
      if (process.env.NODE_ENV !== 'production' && username === 'admin' && password === 'admin123') {
        console.warn('Admin login: using development fallback admin');
        const token = jwt.sign(
          { id: 'dev', role: 'admin', dev: true, username: 'admin', email: 'admin@local' },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '30d' }
        );

        return res.json({
          token,
          admin: {
            id: 'dev',
            username: 'admin',
            email: 'admin@local',
            role: 'super_admin'
          }
        });
      }

      console.log('Admin not found:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('Password mismatch for admin:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Admin login successful:', username);

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Dashboard stats
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.count();
    
    // Active users (trial + paid)
    const activeUsers = await User.count({
      where: { isActive: true }
    });

    // Trial users
    const trialUsers = await User.count({
      where: { subscriptionType: 'trial' }
    });

    // Paid users
    const paidUsers = await User.count({
      where: { 
        subscriptionType: { [Op.ne]: 'trial' }
      }
    });

    // Users registered today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usersToday = await User.count({
      where: {
        createdAt: { [Op.gte]: today }
      }
    });

    // Expiring subscriptions (next 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringTrials = await User.count({
      where: {
        subscriptionType: 'trial',
        trialEndsAt: {
          [Op.between]: [new Date(), threeDaysFromNow]
        }
      }
    });

    const expiringSubscriptions = await User.count({
      where: {
        subscriptionType: { [Op.ne]: 'trial' },
        subscriptionEndsAt: {
          [Op.between]: [new Date(), threeDaysFromNow]
        }
      }
    });

    res.json({
      totalUsers,
      activeUsers,
      trialUsers,
      paidUsers,
      usersToday,
      expiringTrials,
      expiringSubscriptions,
      expiringTotal: expiringTrials + expiringSubscriptions
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users with pagination and filtering
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', subscriptionType = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // Search by name or email
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by subscription type
    if (subscriptionType) {
      whereClause.subscriptionType = subscriptionType;
    }

    // Filter by status
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [{
        model: Subscription,
        required: false,
        order: [['createdAt', 'DESC']],
        limit: 1
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate days remaining for each user
    const usersWithStatus = users.map(user => {
      const userData = user.toJSON();
      const now = new Date();
      
      let daysRemaining = 0;
      let subscriptionStatus = 'expired';

      if (userData.subscriptionType === 'trial' && userData.trialEndsAt) {
        const trialEnd = new Date(userData.trialEndsAt);
        if (trialEnd > now) {
          daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
          subscriptionStatus = 'active';
        }
      } else if (userData.subscriptionEndsAt) {
        const subEnd = new Date(userData.subscriptionEndsAt);
        if (subEnd > now) {
          daysRemaining = Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24));
          subscriptionStatus = 'active';
        }
      }

      return {
        ...userData,
        daysRemaining,
        subscriptionStatus
      };
    });

    res.json({
      users: usersWithStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get users expiring soon (for notifications)
router.get('/users/expiring', adminAuth, async (req, res) => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Trial users expiring
    const expiringTrials = await User.findAll({
      where: {
        subscriptionType: 'trial',
        trialEndsAt: {
          [Op.between]: [new Date(), threeDaysFromNow]
        },
        isActive: true
      },
      order: [['trialEndsAt', 'ASC']]
    });

    // Paid subscription users expiring
    const expiringSubscriptions = await User.findAll({
      where: {
        subscriptionType: { [Op.ne]: 'trial' },
        subscriptionEndsAt: {
          [Op.between]: [new Date(), threeDaysFromNow]
        },
        isActive: true
      },
      order: [['subscriptionEndsAt', 'ASC']]
    });

    res.json({
      expiringTrials,
      expiringSubscriptions,
      total: expiringTrials.length + expiringSubscriptions.length
    });
  } catch (error) {
    console.error('Get expiring users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user status with comprehensive activation
router.patch('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If activating user, give them a fresh start ONLY if they don't have paid subscription
    if (isActive && !user.isActive) {
      const now = new Date();
      
      // Check if user has active paid subscription
      const hasPaidSubscription = user.paymentApproved && 
        user.subscriptionType !== 'trial' && 
        user.subscriptionEndsAt && 
        new Date(user.subscriptionEndsAt) > now;
      
      if (hasPaidSubscription) {
        // User has paid subscription, just activate without changing subscription
        await user.update({ 
          isActive: true
        });
        console.log(`Admin ${req.admin.username} activated user ${user.email} (kept existing subscription)`);
      } else {
        // Check if this email has already used trial (even if current account is new)
        const hasEmailUsedTrial = await EmailTrialTracker.hasEmailUsedTrial(user.email);
        
        if (hasEmailUsedTrial) {
          // Email has used trial before - cannot activate trial again via normal activation
          await user.update({ 
            isActive: false, // Keep inactive - they need to purchase
            subscriptionType: 'trial',
            trialEndsAt: new Date(), // Expired trial
            hasUsedTrial: true
          });
          console.log(`Admin ${req.admin.username} cannot activate ${user.email} - email has already used trial`);
          
          // Return error response
          return res.status(400).json({
            message: 'এই ইমেইল দিয়ে ইতিমধ্যে ট্রায়াল ব্যবহার হয়েছে। ইউজারকে সাবস্ক্রিপশন কিনতে হবে অথবা Force Trial ব্যবহার করুন।',
            emailTrialStatus: 'already_used',
            canForceActivate: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              isActive: user.isActive,
              hasUsedTrial: user.hasUsedTrial
            }
          });
        } else {
          // Email hasn't used trial - normal activation
          const newTrialEnd = new Date();
          newTrialEnd.setDate(newTrialEnd.getDate() + 3);
          
          await user.update({ 
            isActive: true,
            subscriptionType: 'trial',
            trialEndsAt: newTrialEnd,
            hasUsedTrial: false, // Fresh trial
            trialEnabledByAdmin: true // Mark as admin-enabled
          });
          
          // Mark email as trial used
          await EmailTrialTracker.markEmailTrialUsed(user.email, `Admin activation by ${req.admin.username || 'admin'}`);
          
          console.log(`Admin ${req.admin.username || 'admin'} activated user ${user.email} with fresh 3-day trial`);
        }
      }
    } else {
      // Just update status without changing dates or subscription type
      await user.update({ isActive });
      
      if (!isActive) {
        console.log(`Admin ${req.admin.username} deactivated user ${user.email}`);
      }
    }

    // Refresh user data
    await user.reload();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        subscriptionType: user.subscriptionType,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        hasUsedTrial: user.hasUsedTrial,
        trialEnabledByAdmin: user.trialEnabledByAdmin
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manual trial management - Activate or Deactivate trial
router.put('/users/:id/trial', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, days = 3 } = req.body; // action: 'activate' or 'deactivate'
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (action === 'activate') {
      // Activate trial for specified days - only if user doesn't have paid subscription
      const now = new Date();
      const hasPaidSubscription = user.paymentApproved && 
        user.subscriptionType !== 'trial' && 
        user.subscriptionEndsAt && 
        new Date(user.subscriptionEndsAt) > now;
      
      if (hasPaidSubscription) {
        return res.status(400).json({ 
          message: 'Cannot activate trial - user has active paid subscription' 
        });
      }
      
      // Check if this email has already used trial
      const hasEmailUsedTrial = await EmailTrialTracker.hasEmailUsedTrial(user.email);
      
      if (hasEmailUsedTrial) {
        return res.status(400).json({
          message: 'এই ইমেইল দিয়ে ইতিমধ্যে ট্রায়াল ব্যবহার হয়েছে। Force Trial ব্যবহার করুন।',
          emailTrialStatus: 'already_used',
          canForceActivate: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
            hasUsedTrial: user.hasUsedTrial
          }
        });
      }
      
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + parseInt(days));
      
      await user.update({
        subscriptionType: 'trial',
        trialEndsAt: trialEnd,
        trialEnabledByAdmin: true
        // DON'T change isActive - let admin control that separately
      });
      
      // Mark email as trial used
      await EmailTrialTracker.markEmailTrialUsed(user.email, `Trial management by admin`);
      
      res.json({ 
        message: `${days} days trial activated successfully`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          subscriptionType: user.subscriptionType,
          isActive: user.isActive,
          trialEndsAt: user.trialEndsAt
        }
      });
      
    } else if (action === 'deactivate') {
      // Deactivate ONLY trial, not the entire user
      // If user has paid subscription, switch to that; otherwise expire trial
      const now = new Date();
      const hasPaidSubscription = user.paymentApproved && 
        user.paymentPlanId && 
        user.subscriptionEndsAt && 
        new Date(user.subscriptionEndsAt) > now;
      
      if (hasPaidSubscription) {
        // Switch from trial to paid subscription
        await user.update({
          subscriptionType: user.paymentPlanId, // monthly, yearly, etc.
          trialEndsAt: new Date() // Expire trial
          // Keep isActive as is, keep subscriptionEndsAt
        });
        
        res.json({ 
          message: 'Trial deactivated - switched to paid subscription',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            subscriptionType: user.subscriptionType,
            isActive: user.isActive,
            trialEndsAt: user.trialEndsAt,
            subscriptionEndsAt: user.subscriptionEndsAt
          }
        });
      } else {
        // No paid subscription, just expire trial but DON'T deactivate user
        await user.update({
          trialEndsAt: new Date() // Set to current time (expired)
          // DON'T change isActive - let admin control that separately
        });
        
        res.json({ 
          message: 'Trial deactivated - user can purchase subscription',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            subscriptionType: user.subscriptionType,
            isActive: user.isActive,
            trialEndsAt: user.trialEndsAt
          }
        });
      }
      
    } else {
      res.status(400).json({ message: 'Invalid action. Use "activate" or "deactivate"' });
    }
    
  } catch (error) {
    console.error('Trial management error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ADMIN OVERRIDE: Force trial activation even for emails that already used trial
// WARNING: This bypasses email trial restrictions - use with extreme caution
router.post('/force-trial/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 3, reason } = req.body;
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Reason is required and must be at least 10 characters for force trial activation' 
      });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Log the force activation for audit trail
    console.log(`ADMIN FORCE TRIAL: Admin forcing trial for email ${user.email} with reason: ${reason}`);
    
    // Calculate trial end date
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + parseInt(days));
    
    // Force activate trial regardless of email history
    await user.update({
      subscriptionType: 'trial',
      trialEndsAt: trialEnd,
      trialEnabledByAdmin: true,
      hasUsedTrial: true // Mark as used to maintain consistency
    });
    
    // Mark email as having used trial (even if forced)
    await EmailTrialTracker.markEmailTrialUsed(user.email, `Admin force activation: ${reason}`);
    
    res.json({ 
      message: `Force trial activated successfully for ${days} days`,
      warning: 'This was a forced activation that bypassed email trial restrictions',
      reason: reason,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionType: user.subscriptionType,
        isActive: user.isActive,
        trialEndsAt: user.trialEndsAt
      }
    });
    
  } catch (error) {
    console.error('Force trial activation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user details with subscription history
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{
        model: Subscription,
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Payment submission endpoint
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for screenshot uploads
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

// Payment submission route
router.post('/users/:id/payment', adminAuth, upload.single('screenshot'), async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;
    const screenshotPath = req.file ? `/uploads/payments/${req.file.filename}` : null;

    // Save payment info to DB (add Payment model if needed)
    // For demo, save to User model (add fields if needed)
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.paymentMethod = paymentMethod;
    user.transactionId = transactionId;
    user.paymentScreenshot = screenshotPath;
    await user.save();

    res.json({ message: 'Payment info saved', paymentMethod, transactionId, screenshotPath });
  } catch (error) {
    console.error('Payment submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve user payment and activate subscription
router.post('/users/:id/approve-payment', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.paymentMethod || !user.transactionId) {
      return res.status(400).json({ message: 'No payment info found for this user' });
    }

    // Plan configurations
    const plans = {
      monthly: { duration: 30, type: 'monthly' },
      '6month': { duration: 180, type: '6month' },
      yearly: { duration: 365, type: 'yearly' }
    };

    const plan = plans[user.paymentPlanId];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Calculate subscription end date
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + plan.duration);

    // Check if user was on trial before buying paid plan
    const wasOnTrial = user.subscriptionType === 'trial';

    // Update user subscription
    await user.update({
      subscriptionType: plan.type,
      subscriptionEndsAt: subscriptionEndsAt,
      isActive: true,
      paymentApproved: true,
      paymentApprovedAt: new Date(),
      // If user was on trial, mark trial as used to prevent future trial access
      hasUsedTrial: wasOnTrial ? true : user.hasUsedTrial
    });

    console.log(`Payment approved for ${user.email}: ${plan.type} subscription${wasOnTrial ? ' (trial → paid, trial marked as used)' : ''}`);

    res.json({ 
      success: true,
      message: 'Payment approved and subscription activated',
      subscriptionType: plan.type,
      subscriptionEndsAt: subscriptionEndsAt,
      trialMarkedAsUsed: wasOnTrial
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle trial for user
router.put('/users/:id/trial-toggle', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle trial enabled by admin
    const newTrialState = !user.trialEnabledByAdmin;
    
    // If enabling trial, reset expired trial status
    const updateData = {
      trialEnabledByAdmin: newTrialState
    };
    
    if (newTrialState && user.subscriptionType === 'expired_trial') {
      updateData.subscriptionType = 'trial';
      updateData.isActive = true;
      // Extend trial for 3 more days
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 3);
      updateData.trialEndsAt = trialEnd;
    }
    
    await user.update(updateData);

    const message = newTrialState 
      ? (user.subscriptionType === 'expired_trial' 
          ? 'ট্রায়াল পুনরায় সক্রিয় করা হয়েছে (৩ দিন বাড়ানো হয়েছে)' 
          : 'ট্রায়াল পুনরায় সক্রিয় করা হয়েছে')
      : 'ট্রায়াল বন্ধ করা হয়েছে';

    res.json({ 
      success: true,
      message,
      trialEnabledByAdmin: newTrialState
    });
  } catch (error) {
    console.error('Toggle trial error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
