const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, User, Subscription, sequelize } = require('../models');
const { Op } = require('sequelize');

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

// Update user status
router.patch('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If activating user, extend their subscription
    if (isActive && !user.isActive) {
      const now = new Date();
      
      // If user is on trial and trial has expired, extend trial by 3 days
      if (user.subscriptionType === 'trial') {
        const newTrialEnd = new Date();
        newTrialEnd.setDate(newTrialEnd.getDate() + 3);
        await user.update({ 
          isActive: true,
          trialEndsAt: newTrialEnd
        });
      }
      // If user has paid subscription but expired, extend by their plan duration
      else if (user.subscriptionType !== 'trial') {
        const planDurations = {
          monthly: 30,
          '6month': 180,
          yearly: 365
        };
        
        const days = planDurations[user.subscriptionType] || 30;
        const newSubEnd = new Date();
        newSubEnd.setDate(newSubEnd.getDate() + days);
        
        await user.update({ 
          isActive: true,
          subscriptionEndsAt: newSubEnd
        });
      }
    } else {
      // Just update status without changing dates
      await user.update({ isActive });
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
        subscriptionEndsAt: user.subscriptionEndsAt
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
      // Activate trial for specified days
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + parseInt(days));
      
      await user.update({
        subscriptionType: 'trial',
        isActive: true,
        trialEndsAt: trialEnd
      });
      
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
      // Deactivate trial - user will see renewal interface
      await user.update({
        isActive: false,
        trialEndsAt: new Date() // Set to current time (expired)
      });
      
      res.json({ 
        message: 'Trial deactivated successfully - user will see renewal options',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          subscriptionType: user.subscriptionType,
          isActive: user.isActive,
          trialEndsAt: user.trialEndsAt
        }
      });
      
    } else {
      res.status(400).json({ message: 'Invalid action. Use "activate" or "deactivate"' });
    }
    
  } catch (error) {
    console.error('Trial management error:', error);
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

module.exports = router;
