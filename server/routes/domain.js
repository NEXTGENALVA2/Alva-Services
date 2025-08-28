const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Website } = require('../models');

// Domain read
router.get('/', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ 
      where: { userId: req.user.id }
    });

    if (!website) {
      return res.json({ 
        domain: '', 
        url: '', 
        type: 'subdomain' 
      });
    }

    console.log('DEBUG: Domain API - returning website domain:', website.domain);
    
    res.json({
      domain: website.domain,
      url: `http://localhost:3000/${website.domain}`,
      type: 'subdomain'
    });
  } catch (error) {
    console.log('DEBUG: Domain API error:', error.message);
    res.status(500).json({ 
      domain: '', 
      url: '', 
      type: 'subdomain' 
    });
  }
});

// Domain save
router.post('/', authMiddleware, async (req, res) => {
  const { domain } = req.body;
  try {
    console.log('Domain save request:', { domain, userId: req.user.id });
    
    // Get user's website
    const website = await Website.findOne({ 
      where: { userId: req.user.id } 
    });
    
    if (!website) {
      return res.status(404).json({ error: 'Website not found for user' });
    }
    
    // Extract website ID from current domain
    const currentDomain = website.domain;
    const websiteId = currentDomain.split('-').pop(); // Get the last part (ID)
    
    console.log('Current domain:', currentDomain, 'Extracted ID:', websiteId);
    
    // Check if it's a full domain (contains . and no localhost)
    const isFullDomain = domain.includes('.') && !domain.includes('localhost');
    
    let newDomain;
    let finalUrl;
    
    if (isFullDomain) {
      // Full domain case: www.eamin.com -> www.eamin.com
      newDomain = domain;
      finalUrl = domain.startsWith('http') ? domain : `http://${domain}`;
    } else {
      // Subdomain case: new-name -> new-name-{same-website-id}
      newDomain = `${domain.toLowerCase().replace(/\s+/g, '-')}-${websiteId}`;
      finalUrl = `http://localhost:3000/${newDomain}`;
    }
    
    console.log('Updating domain:', { oldDomain: website.domain, newDomain });
    
    // Update the website's domain
    await website.update({ domain: newDomain });
    
    console.log('Domain updated successfully');
    
    res.json({ success: true, url: finalUrl, type: isFullDomain ? 'full' : 'subdomain' });
  } catch (err) {
    console.error('Domain save error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
