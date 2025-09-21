const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');
const EmailTrialTracker = require('../utils/EmailTrialTracker');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    console.log('Register attempt:', { name, email, phone, passwordProvided: !!password });

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if this email has already used trial (even if account was deleted)
    const hasUsedTrial = await EmailTrialTracker.hasEmailUsedTrial(email);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let user;
    
    if (hasUsedTrial) {
      console.log('Email has already used trial:', email);
      
      // Create user without trial - they must purchase subscription
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        subscriptionType: 'trial',
        trialEndsAt: new Date(), // Already expired
        hasUsedTrial: true, // Mark as already used
        isActive: false // Account inactive until they purchase
      });
      
      console.log('User created without trial (already used):', { id: user.id, email: user.email });
      
    } else {
      // Create user with 3-day trial (first time email)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 3);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        trialEndsAt,
        subscriptionType: 'trial',
        hasUsedTrial: false
      });
      
      // Mark this email as having used trial
      await EmailTrialTracker.markEmailTrialUsed(email, 'Initial registration trial');
      
      console.log('User created with trial:', { id: user.id, email: user.email });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionType: user.subscriptionType,
        trialEndsAt: user.trialEndsAt,
        hasUsedTrial: user.hasUsedTrial,
        isActive: user.isActive
      },
      trialStatus: hasUsedTrial ? 'already_used' : 'new_trial'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, passwordProvided: !!password });

    // Check user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { id: user.id, email: user.email });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', email);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionType: user.subscriptionType,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile (for trial eligibility check)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'isActive', 'hasUsedTrial', 'trialEnabledByAdmin', 'subscriptionType', 'trialEndsAt', 'subscriptionEndsAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
