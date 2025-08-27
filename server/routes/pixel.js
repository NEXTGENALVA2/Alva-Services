const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../pixel-settings.json');

// Pixel settings read
router.get('/', (req, res) => {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const data = fs.readFileSync(DATA_PATH, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({ facebookPixel: '', tiktokPixel: '', googleTagManager: '' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Pixel settings save
router.post('/', (req, res) => {
  const { facebookPixel, tiktokPixel, googleTagManager } = req.body;
  const data = { facebookPixel, tiktokPixel, googleTagManager };
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
