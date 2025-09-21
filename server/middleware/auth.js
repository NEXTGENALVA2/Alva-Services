const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Auth middleware: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('Auth middleware: Token received:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Auth middleware: Token decoded, user ID:', decoded.id);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      console.log('Auth middleware: User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Token is not valid - user not found' });
    }

    console.log('Auth middleware: User found:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};
