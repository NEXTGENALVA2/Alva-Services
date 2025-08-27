const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../domain-settings.json');

// Domain read
router.get('/', (req, res) => {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const data = fs.readFileSync(DATA_PATH, 'utf8');
      const parsed = JSON.parse(data);
      res.json({
        domain: parsed.domain || '',
        url: parsed.url || '',
        type: parsed.type || 'subdomain'
      });
    } else {
      res.json({ domain: '', url: '', type: 'subdomain' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Domain save
router.post('/', (req, res) => {
  const { domain } = req.body;
  try {
    // Check if it's a full domain (contains . and no localhost)
    const isFullDomain = domain.includes('.') && !domain.includes('localhost');
    
    let finalUrl;
    if (isFullDomain) {
      // Full domain case: www.eamin.com -> http://www.eamin.com
      finalUrl = domain.startsWith('http') ? domain : `http://${domain}`;
    } else {
      // Subdomain case: eamin -> http://localhost:3000/eamin-1756107896786
      const websiteId = '1756107896786'; // You can make this dynamic
      finalUrl = `http://localhost:3000/${domain}-${websiteId}`;
    }
    
    fs.writeFileSync(DATA_PATH, JSON.stringify({ 
      domain: domain, 
      url: finalUrl,
      type: isFullDomain ? 'full' : 'subdomain'
    }));
    
    res.json({ success: true, url: finalUrl, type: isFullDomain ? 'full' : 'subdomain' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
