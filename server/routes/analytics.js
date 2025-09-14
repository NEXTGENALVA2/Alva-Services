const express = require('express');
const { Op } = require('sequelize');
const { Order, OrderItem, Product, Website, sequelize } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get basic analytics for dashboard
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('DEBUG: Analytics request for user:', req.user.id);
    
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      console.log('DEBUG: No website found for user:', req.user.id);
      // If no website found, let's try to get a fallback or return default values
      return res.json({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        monthlyProfit: 0
      });
    }
    
    console.log('DEBUG: Website found:', website.id, 'domain:', website.domain);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Debug: Check all products for this website or any website for this user
    let totalProducts = 0;
    
    try {
      // First try to get products for the specific website
      totalProducts = await Product.count({
        where: { websiteId: website.id }
      });
      console.log('DEBUG: Products for specific website:', totalProducts);
      
      // If no products found, let's check if there are products with different websiteIds
      if (totalProducts === 0) {
        const allUserWebsites = await Website.findAll({ where: { userId: req.user.id } });
        console.log('DEBUG: All user websites:', allUserWebsites.map(w => w.id));
        
        if (allUserWebsites.length > 0) {
          const websiteIds = allUserWebsites.map(w => w.id);
          totalProducts = await Product.count({
            where: { websiteId: websiteIds }
          });
          console.log('DEBUG: Products for all user websites:', totalProducts);
        }
      }
    } catch (productError) {
      console.error('DEBUG: Error counting products:', productError);
      totalProducts = 0;
    }

    // Total orders
    let totalOrders = 0;
    try {
      totalOrders = await Order.count({
        where: { websiteId: website.id }
      });
      console.log('DEBUG: Total orders count:', totalOrders);
    } catch (orderError) {
      console.error('DEBUG: Error counting orders:', orderError);
      totalOrders = 0;
    }

    // Revenue calculations
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    
    try {
      totalRevenue = await Order.sum('totalAmount', {
        where: {
          websiteId: website.id,
          paymentStatus: 'paid'
        }
      }) || 0;

      monthlyRevenue = await Order.sum('totalAmount', {
        where: {
          websiteId: website.id,
          paymentStatus: 'paid',
          createdAt: { [Op.gte]: startOfMonth }
        }
      }) || 0;
    } catch (revenueError) {
      console.error('DEBUG: Error calculating revenue:', revenueError);
    }

    // Calculate profit (assuming 30% profit margin)
    const monthlyProfit = monthlyRevenue * 0.3;

    const response = {
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlyProfit
    };
    
    console.log('DEBUG: Analytics response:', response);

    res.json(response);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Get dashboard analytics
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Total products
    const totalProducts = await Product.count({
      where: { websiteId: website.id, isActive: true }
    });

    // Total orders
    const totalOrders = await Order.count({
      where: { websiteId: website.id }
    });

    // Monthly orders
    const monthlyOrders = await Order.count({
      where: {
        websiteId: website.id,
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    // Revenue calculations
    const totalRevenue = await Order.sum('totalAmount', {
      where: {
        websiteId: website.id,
        paymentStatus: 'paid'
      }
    }) || 0;

    const monthlyRevenue = await Order.sum('totalAmount', {
      where: {
        websiteId: website.id,
        paymentStatus: 'paid',
        createdAt: { [Op.gte]: startOfMonth }
      }
    }) || 0;

    // Calculate profit (assuming 30% profit margin)
    const monthlyProfit = monthlyRevenue * 0.3;

    // Recent orders
    const recentOrders = await Order.findAll({
      where: { websiteId: website.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'customerName', 'totalAmount', 'status', 'createdAt']
    });

    // Sales data for chart (last 7 days)
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayRevenue = await Order.sum('totalAmount', {
        where: {
          websiteId: website.id,
          paymentStatus: 'paid',
          createdAt: { [Op.between]: [dayStart, dayEnd] }
        }
      }) || 0;

      salesData.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRevenue
      });
    }

    // Top products
    const topProducts = await sequelize.query(`
      SELECT p.name, SUM(oi.quantity) as sold
      FROM "Products" p
      INNER JOIN "OrderItems" oi ON p.id = oi."productId"
      INNER JOIN "Orders" o ON oi."orderId" = o.id
      WHERE o."websiteId" = :websiteId AND o."paymentStatus" = 'paid'
      GROUP BY p.id, p.name
      ORDER BY sold DESC
      LIMIT 5
    `, {
      replacements: { websiteId: website.id },
      type: sequelize.QueryTypes.SELECT
    });

    // Low stock products
    const lowStockProducts = await Product.findAll({
      where: {
        websiteId: website.id,
        stock: { [Op.lt]: 10 },
        isActive: true
      },
      attributes: ['id', 'name', 'stock'],
      limit: 5
    });

    res.json({
      totalProducts,
      totalOrders,
      monthlyOrders,
      totalRevenue,
      monthlyRevenue,
      monthlyProfit,
      recentOrders,
      salesData,
      topProducts,
      lowStockProducts
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router;
