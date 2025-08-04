const express = require('express');
const { Website, User } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
// Public: Get website by domain (for dynamic frontend)
router.get('/public/:domain', async (req, res) => {
  try {
    const website = await Website.findOne({
      where: { domain: req.params.domain },
      include: [{ model: require('../models').Product, as: 'products' }]
    });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }
    res.json({ website, products: website.products });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching website', error: error.message });
  }
});

// Create website in 10 seconds
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, theme = 'default' } = req.body;
    const userId = req.user.id;

    // Check if user already has a website
    const existingWebsite = await Website.findOne({ where: { userId } });
    if (existingWebsite) {
      return res.status(400).json({ message: 'User already has a website' });
    }

    // Generate unique domain
    const domain = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const website = await Website.create({
      name,
      domain,
      theme,
      userId,
      settings: {
        paymentGateway: 'sslcommerz',
        courierServices: ['pathao', 'steadfast'],
        currency: 'BDT',
        chatbot: {
          enabled: true,
          welcomeMessage: 'Hello! How can I help you today?'
        }
      }
    });

    res.status(201).json({
      message: 'Website created successfully!',
      website: {
        id: website.id,
        name: website.name,
        domain: website.domain,
        url: `https://${website.domain}.yourplatform.com`
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating website', error: error.message });
  }
});

// Get website details
router.get('/', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ 
      where: { userId: req.user.id },
      include: ['Products', 'Orders']
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    res.json(website);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching website', error: error.message });
  }
});

module.exports = router;
