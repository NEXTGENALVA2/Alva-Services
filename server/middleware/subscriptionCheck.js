const { User } = require('../models');

const checkSubscriptionStatus = async (req, res, next) => {
  try {
    // Skip check for admin routes
    if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
      return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return next(); // Skip if no token (public routes)
    }

    const jwt = require('jsonwebtoken');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          subscriptionExpired: false 
        });
      }

      const now = new Date();
      let isExpired = false;
      let message = '';

      // Check trial expiration
      if (user.subscriptionType === 'trial' && user.trialEndsAt) {
        if (new Date(user.trialEndsAt) <= now) {
          isExpired = true;
          message = 'আপনার ট্রায়াল পিরিয়ড শেষ হয়ে গেছে। সেবা চালু রাখতে এখনই সাবস্ক্রিপশন নবায়ন করুন।';
        }
      }
      // Check paid subscription expiration
      else if (user.subscriptionType !== 'trial' && user.subscriptionEndsAt) {
        if (new Date(user.subscriptionEndsAt) <= now) {
          isExpired = true;
          message = 'আপনার সাবস্ক্রিপশন মেয়াদ শেষ হয়ে গেছে। সেবা চালু রাখতে এখনই নবায়ন করুন।';
        }
      }

      // If expired, update user status and return error
      if (isExpired) {
        await user.update({ isActive: false });
        return res.status(403).json({ 
          message: message,
          subscriptionExpired: true,
          subscriptionType: user.subscriptionType,
          redirectTo: '/dashboard/subscription'
        });
      }

      // Add user info to request
      req.user = user;
      next();
    } catch (jwtError) {
      // Invalid token, but let the route handle it
      next();
    }
  } catch (error) {
    console.error('Subscription check error:', error);
    next(); // Continue even if there's an error
  }
};

module.exports = checkSubscriptionStatus;
