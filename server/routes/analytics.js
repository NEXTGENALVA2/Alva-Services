const express = require('express');
const { Op } = require('sequelize');
const { Order, OrderItem, Product, Website, sequelize } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

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
