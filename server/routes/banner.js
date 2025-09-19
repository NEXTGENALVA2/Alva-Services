const express = require('express');
const multer = require('multer');
const { Banner } = require('../models');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/banners');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });


// Get current banner for a website
// Accepts ?websiteId= or ?domain=
const { Website } = require('../models');
router.get('/', async (req, res) => {
  try {
    console.log('📥 Banner GET request - Query:', req.query);
    
    let websiteId = req.query.websiteId;
    if (!websiteId && req.query.domain) {
      console.log('🔍 Looking for website by domain:', req.query.domain);
      let website = await Website.findOne({ where: { domain: req.query.domain } });
      
      if (!website) {
        console.log('❌ Website not found for GET, creating temporary website for domain:', req.query.domain);
        // Create temporary website for banner fetching
        website = await Website.create({
          name: `Auto Website - ${req.query.domain}`,
          domain: req.query.domain,
          userId: null, // Allow null userId for temporary websites
          isActive: true
        });
        console.log('✅ Created temporary website with ID:', website.id);
      }
      websiteId = website.id;
      console.log('✅ Found website ID:', websiteId);
    }
    if (!websiteId) return res.status(400).json({ error: 'websiteId or domain required' });
    // সর্বশেষ ৩টা ব্যানার
    const banners = await Banner.findAll({
      where: { websiteId },
      order: [['createdAt', 'DESC']],
      limit: 3
    });
    console.log('📸 Found banners count:', banners.length);
    res.json(banners);
  } catch (err) {
    console.error('Banner get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Upload new banner for a website
// Requires websiteId in body or ?domain= in query
router.post('/', upload.single('banner'), async (req, res) => {
  try {
    console.log('📤 Banner POST request - Query:', req.query, 'Body keys:', Object.keys(req.body));
    
    let websiteId = req.body.websiteId;
    if (!websiteId && req.query.domain) {
      console.log('🔍 Looking for website by domain:', req.query.domain);
      let website = await Website.findOne({ where: { domain: req.query.domain } });
      
      if (!website) {
        console.log('❌ Website not found, creating temporary website for domain:', req.query.domain);
        // Create temporary website for banner upload
        website = await Website.create({
          name: `Auto Website - ${req.query.domain}`,
          domain: req.query.domain,
          userId: null, // Allow null userId for temporary websites
          isActive: true
        });
        console.log('✅ Created temporary website with ID:', website.id);
      }
      websiteId = website.id;
      console.log('✅ Using website ID:', websiteId);
    }
    if (!websiteId) return res.status(400).json({ error: 'websiteId or domain required' });

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

  // Purono banner gulo r deactivate/delete korbo na, shob banner DB te thakbe

    // Create new banner
    const banner = await Banner.create({
      imageUrl: `/uploads/banners/${req.file.filename}`,
      isActive: true,
      websiteId
    });
    res.json(banner);
  } catch (err) {
    console.error('Banner upload error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete banner (by imageUrl and websiteId)
router.delete('/', async (req, res) => {
  try {
    const { websiteId, imageUrl } = req.query;
    if (!websiteId || !imageUrl) return res.status(400).json({ error: 'websiteId and imageUrl required' });
    const banner = await Banner.findOne({ where: { websiteId, imageUrl } });
    if (!banner) return res.status(404).json({ error: 'No banner found' });
    const filePath = path.join(__dirname, '../uploads/banners', path.basename(banner.imageUrl));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await banner.destroy();
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    console.error('Banner delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
