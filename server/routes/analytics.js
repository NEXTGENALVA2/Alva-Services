const express = require('express');
const { Op } = require('sequelize');
const { Order, OrderItem, Product, Website, sequelize } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get customer distribution by region
router.get('/customer-distribution', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.json([]);
    }

    // Language mapping for divisions and districts
    const locationMapping = {
      // Divisions
      'Dhaka': 'ঢাকা',
      'Chattogram': 'চট্টগ্রাম', 
      'Chittagong': 'চট্টগ্রাম',
      'Sylhet': 'সিলেট',
      'Rajshahi': 'রাজশাহী',
      'Khulna': 'খুলনা',
      'Barisal': 'বরিশাল',
      'Rangpur': 'রংপুর',
      'Mymensingh': 'ময়মনসিংহ',
      
      // Districts  
      'Faridpur': 'ফরিদপুর',
      'Gazipur': 'গাজীপুর',
      'Brahmanbaria': 'ব্রাহ্মণবাড়িয়া',
      'Chandpur': 'চাঁদপুর',
      'Comilla': 'কুমিল্লা',
      'Coxs Bazar': 'কক্সবাজার'
    };

    const customerDistribution = await Order.findAll({
      where: { 
        websiteId: website.id,
        status: 'delivered' // Only count delivered orders
      },
      attributes: [
        'customerDivision',
        'customerDistrict',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
      ],
      group: ['customerDivision', 'customerDistrict'],
      having: sequelize.where(sequelize.col('customerDivision'), Op.ne, null),
      raw: true
    });

    const formattedData = customerDistribution.map(item => ({
      division: locationMapping[item.customerDivision] || item.customerDivision || 'অজানা',
      district: locationMapping[item.customerDistrict] || item.customerDistrict || 'অজানা',
      count: parseInt(item.count) || 0,
      revenue: parseFloat(item.revenue) || 0
    }));

    console.log('Customer distribution data:', formattedData);
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching customer distribution:', error);
    res.status(500).json({ error: 'Failed to fetch customer distribution' });
  }
});

// Get sales trend data
router.get('/sales-trend', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.json([]);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesTrend = await Order.findAll({
      where: {
        websiteId: website.id,
        status: 'delivered',
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    const formattedData = salesTrend.map(item => ({
      date: new Date(item.date).toLocaleDateString('bn-BD'),
      orders: parseInt(item.orders) || 0,
      revenue: parseFloat(item.revenue) || 0
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching sales trend:', error);
    res.status(500).json({ error: 'Failed to fetch sales trend' });
  }
});

// Get top performing regions
router.get('/top-regions', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.json([]);
    }

    // Same location mapping
    const locationMapping = {
      'Dhaka': 'ঢাকা',
      'Chattogram': 'চট্টগ্রাম', 
      'Chittagong': 'চট্টগ্রাম',
      'Sylhet': 'সিলেট',
      'Rajshahi': 'রাজশাহী',
      'Khulna': 'খুলনা',
      'Barisal': 'বরিশাল',
      'Rangpur': 'রংপুর',
      'Mymensingh': 'ময়মনসিংহ',
      'Faridpur': 'ফরিদপুর',
      'Gazipur': 'গাজীপুর',
      'Brahmanbaria': 'ব্রাহ্মণবাড়িয়া',
      'Chandpur': 'চাঁদপুর',
      'Comilla': 'কুমিল্লা',
      'Coxs Bazar': 'কক্সবাজার'
    };

    const topRegions = await Order.findAll({
      where: { 
        websiteId: website.id,
        status: 'delivered'
      },
      attributes: [
        'customerDivision',
        'customerDistrict',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']
      ],
      group: ['customerDivision', 'customerDistrict'],
      having: sequelize.where(sequelize.col('customerDivision'), Op.ne, null),
      order: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'DESC']],
      limit: 10,
      raw: true
    });

    const formattedData = topRegions.map((item, index) => ({
      division: locationMapping[item.customerDivision] || item.customerDivision || 'অজানা',
      district: locationMapping[item.customerDistrict] || item.customerDistrict || 'অজানা',
      count: parseInt(item.count) || 0,
      revenue: parseFloat(item.revenue) || 0,
      rank: index + 1,
      growth: Math.floor(Math.random() * 30) + 5 // Sample growth data
    }));

    console.log('Top regions data:', formattedData);
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching top regions:', error);
    res.status(500).json({ error: 'Failed to fetch top regions' });
  }
});

// Get top selling products
router.get('/top-products', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.json([]);
    }

    const topProducts = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: { 
            websiteId: website.id,
            status: 'delivered'
          },
          attributes: []
        },
        {
          model: Product,
          attributes: ['name', 'price']
        }
      ],
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'totalQuantity'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Order.id'))), 'orderCount'],
        [sequelize.fn('SUM', sequelize.literal('"OrderItem"."quantity" * "OrderItem"."price"')), 'totalRevenue']
      ],
      group: ['OrderItem.productId', 'Product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'DESC']],
      limit: 10,
      raw: true
    });

    const formattedData = topProducts.map(item => ({
      productName: item['Product.name'] || 'অজানা প্রোডাক্ট',
      quantity: parseInt(item.totalQuantity) || 0,
      orders: parseInt(item.orderCount) || 0,
      revenue: parseFloat(item.totalRevenue) || 0
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

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

    // Revenue calculations - Only count delivered/completed orders
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    
    try {
      totalRevenue = await Order.sum('totalAmount', {
        where: {
          websiteId: website.id,
          status: 'delivered' // Only count delivered orders
        }
      }) || 0;
      console.log('DEBUG: Total revenue (delivered orders only):', totalRevenue);

      monthlyRevenue = await Order.sum('totalAmount', {
        where: {
          websiteId: website.id,
          status: 'delivered', // Only count delivered orders
          createdAt: { [Op.gte]: startOfMonth }
        }
      }) || 0;
      console.log('DEBUG: Monthly revenue (delivered orders only):', monthlyRevenue);
    } catch (revenueError) {
      console.error('DEBUG: Error calculating revenue:', revenueError);
    }

    // Calculate actual profit based on product costs
    let monthlyProfit = 0;
    try {
      // Get all delivered orders with their items for this month
      const deliveredOrders = await Order.findAll({
        where: {
          websiteId: website.id,
          status: 'delivered',
          createdAt: { [Op.gte]: startOfMonth }
        },
        include: [{
          model: OrderItem,
          include: [Product]
        }]
      });

      // Calculate actual profit by subtracting product costs
      for (const order of deliveredOrders) {
        for (const item of order.OrderItems) {
          const product = item.Product;
          if (product && product.buyPrice) {
            const sellPrice = item.price;
            const costPrice = product.buyPrice;
            const itemProfit = (sellPrice - costPrice) * item.quantity;
            monthlyProfit += itemProfit;
          } else {
            // Fallback to 30% margin if no cost price available
            monthlyProfit += (item.price * item.quantity * 0.3);
          }
        }
      }
      
      console.log('DEBUG: Monthly profit (calculated from actual costs):', monthlyProfit);
    } catch (profitError) {
      console.error('DEBUG: Error calculating profit:', profitError);
      // Fallback to simple calculation
      monthlyProfit = monthlyRevenue * 0.3;
    }

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

    // Revenue calculations - Only count delivered orders
    const totalRevenue = await Order.sum('totalAmount', {
      where: {
        websiteId: website.id,
        status: 'delivered'
      }
    }) || 0;

    const monthlyRevenue = await Order.sum('totalAmount', {
      where: {
        websiteId: website.id,
        status: 'delivered',
        createdAt: { [Op.gte]: startOfMonth }
      }
    }) || 0;

    // Calculate actual profit based on product costs
    let monthlyProfit = 0;
    try {
      const deliveredOrders = await Order.findAll({
        where: {
          websiteId: website.id,
          status: 'delivered',
          createdAt: { [Op.gte]: startOfMonth }
        },
        include: [{
          model: OrderItem,
          include: [Product]
        }]
      });

      for (const order of deliveredOrders) {
        for (const item of order.OrderItems) {
          const product = item.Product;
          if (product && product.buyPrice) {
            const sellPrice = item.price;
            const costPrice = product.buyPrice;
            const itemProfit = (sellPrice - costPrice) * item.quantity;
            monthlyProfit += itemProfit;
          } else {
            monthlyProfit += (item.price * item.quantity * 0.3);
          }
        }
      }
    } catch (profitError) {
      monthlyProfit = monthlyRevenue * 0.3;
    }

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
