const express = require('express');
const { Website, User, Banner } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Update website domain
router.put('/:websiteId/domain', authMiddleware, async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { domain } = req.body;
    const website = await require('../models').Website.findByPk(websiteId);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }
    website.domain = domain;
    await website.save();
    res.json({ message: 'Domain updated!', domain: website.domain });
  } catch (error) {
    res.status(500).json({ message: 'Domain update failed', error: error.message });
  }
});

// Update website theme
router.put('/:websiteId/theme', authMiddleware, async (req, res) => {
  try {
    console.log('DEBUG: Theme update request for websiteId:', req.params.websiteId);
    console.log('DEBUG: Theme data:', req.body.theme);
    
    const { websiteId } = req.params;
    const { theme } = req.body;
    const website = await Website.findByPk(websiteId);
    
    if (!website) {
      console.log('DEBUG: Website not found for theme update:', websiteId);
      return res.status(404).json({ message: 'Website not found' });
    }
    
    website.theme = theme.name || 'default';
    await website.save();
    
    console.log('DEBUG: Theme updated successfully:', website.theme);
    res.json({ message: 'Theme updated!', theme: website.theme });
  } catch (error) {
    console.error('DEBUG: Theme update error:', error);
    res.status(500).json({ message: 'Theme update failed', error: error.message });
  }
});

// DEBUG: List all websites for a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const websites = await Website.findAll({ where: { userId } });
    res.json(websites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching websites', error: error.message });
  }
});

// GET /api/websites/by-domain/:domain
router.get('/by-domain/:domain', async (req, res) => {
  const { domain } = req.params;
  console.log('Looking for website with domain:', domain);
  
  try {
    const website = await Website.findOne({ where: { domain } });
    if (!website) {
      console.log('No website found with domain:', domain);
      return res.status(404).json({ message: 'Website not found' });
    }
    console.log('Found website:', website.id, website.domain);
    res.json({ id: website.id, domain: website.domain });
  } catch (error) {
    console.error('Error looking up website:', error);
    res.status(500).json({ message: 'Error looking up website', error: error.message });
  }
});
// Public: Get website by domain (for dynamic frontend)
router.get('/public/:domain', async (req, res) => {
  try {
    console.log('DEBUG: Fetching website for domain:', req.params.domain);
    
    // Extract the ID from domain (e.g., "ratulhasan-1756107896786" -> "1756107896786")
    const domainParts = req.params.domain.split('-');
    const websiteId = domainParts[domainParts.length - 1]; // Get last part as ID
    
    // First try to find by exact domain match
    let website = await Website.findOne({
      where: { domain: req.params.domain },
      include: [
        { model: require('../models').Product, as: 'products' },
        { model: Banner, where: { isActive: true }, required: false, order: [['order', 'ASC']] }
      ]
    });
    
    // If not found, try to find by original domain (emon-1756107896786)
    if (!website) {
      console.log('DEBUG: Domain not found, trying with original domain:', `emon-${websiteId}`);
      website = await Website.findOne({
        where: { domain: `emon-${websiteId}` },
        include: [
          { model: require('../models').Product, as: 'products' },
          { model: Banner, where: { isActive: true }, required: false, order: [['order', 'ASC']] }
        ]
      });
    }
    
    if (!website) {
      console.log('DEBUG: Website not found for domain:', req.params.domain);
      return res.status(404).json({ message: 'Website not found' });
    }
    
    console.log('DEBUG: Domain requested:', req.params.domain);
    console.log('DEBUG: Website found:', website.id, website.name);
    console.log('DEBUG: Products found:', website.products ? website.products.length : 0);
    console.log('DEBUG: Banners found:', website.Banners ? website.Banners.length : 0);
    if (website.products && website.products.length > 0) {
      console.log('DEBUG: First product:', JSON.stringify(website.products[0], null, 2));
    }
    
    res.json({ 
      website, 
      products: website.products || [],
      banners: website.Banners || []
    });
  } catch (error) {
    console.error('DEBUG: Error fetching website:', error);
    res.status(500).json({ message: 'Error fetching website', error: error.message });
  }
});

// Create website in 10 seconds
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, theme = 'default' } = req.body;
    const userId = req.user.id;
    console.log('DEBUG: Website creation requested:', { name, theme, userId });

    // Check if user already has a website
    const existingWebsite = await Website.findOne({ where: { userId } });
    if (existingWebsite) {
      console.log('DEBUG: User already has a website:', existingWebsite.domain);
      return res.status(400).json({ message: 'User already has a website' });
    }

    // Generate unique domain
    const domain = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    console.log('DEBUG: Generated domain:', domain);

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
    console.log('DEBUG: Website created:', { id: website.id, name: website.name, domain: website.domain, userId: website.userId });

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
    console.log('DEBUG: Error creating website:', error.message);
    res.status(500).json({ message: 'Error creating website', error: error.message });
  }
});

// Get website details
router.get('/', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ 
      where: { userId: req.user.id }
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    console.log('DEBUG: Website found for user:', req.user.id, 'Website:', website.name, website.domain);
    res.json(website);
  } catch (error) {
    console.log('DEBUG: Error fetching website:', error.message);
    res.status(500).json({ message: 'Error fetching website', error: error.message });
  }
});

// Update website name and domain
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    console.log('DEBUG: Website update requested:', { name, userId: req.user.id });

    const website = await Website.findOne({ 
      where: { userId: req.user.id }
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Update name and generate new domain
    const oldDomain = website.domain;
    const newDomain = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    website.name = name;
    website.domain = newDomain;
    await website.save();

    console.log('DEBUG: Website updated:', { 
      id: website.id, 
      oldName: website.name, 
      newName: name,
      oldDomain: oldDomain,
      newDomain: newDomain
    });

    res.json({
      message: 'Website updated successfully!',
      website: {
        id: website.id,
        name: website.name,
        domain: website.domain,
        url: `http://localhost:3000/${website.domain}`
      }
    });
  } catch (error) {
    console.log('DEBUG: Error updating website:', error.message);
    res.status(500).json({ message: 'Error updating website', error: error.message });
  }
});

module.exports = router;
