const express = require('express');
const { Product, Website } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get single product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Get all products for user's website
router.get('/', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const { category, subcategory } = req.query;
    let whereClause = { websiteId: website.id };
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    if (subcategory && subcategory !== 'all') {
      whereClause.subcategory = subcategory;
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Add new product
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('POST /api/products called. Body keys:', Object.keys(req.body));
    console.log('Authorization header present:', !!req.header('Authorization'));
    console.log('User ID from token:', req.user?.id);
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    
    const {
      name,
      description, // frontend sends description
      desc, // fallback for desc
      shortDesc,
      brand,
      sku,
      category,
      subcategory, // Added subcategory field
      price,
      oldPrice,
      buyPrice,
      stock,
      condition,
      status,
      video,
      images,
      variants, // frontend sends variants
      variations, // some APIs might send variations
      details,
      unit,
      warranty,
      deliveryApplied
    } = req.body;

    // Image limit validation
    if (images && Array.isArray(images) && images.length > 10) {
      return res.status(400).json({ message: 'সর্বোচ্চ ১০টি ছবি আপলোড করা যাবে!' });
    }
    
    // Basic validation
    if (!name || name.trim() === '') {
      console.log('ERROR: Product name is required');
      return res.status(400).json({ message: 'প্রোডাক্টের নাম দিতে হবে!' });
    }
    
    if (!price || isNaN(parseFloat(price))) {
      console.log('ERROR: Valid price is required');
      return res.status(400).json({ message: 'সঠিক দাম দিতে হবে!' });
    }
    
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      console.log('ERROR: Website not found for user:', req.user.id);
      return res.status(404).json({ message: 'Website not found' });
    }

    console.log('DEBUG: Creating product for website:', website.id, website.domain);
    console.log('DEBUG: Product data:', { 
      name, 
      description, 
      shortDesc,
      brand,
      sku,
      category,
      price, 
      oldPrice,
      buyPrice,
      stock, 
      condition,
      status,
      video,
      images, 
      variations 
    });

    const productData = {
      name: name.trim(),
      description: description || desc || 'No description provided',
      desc: desc || '', // Full Description field
      shortDesc: shortDesc || '',
      brand: brand || '',
      sku: sku || '',
      category: category || '',
      subcategory: subcategory || '', // Added subcategory field
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      buyPrice: buyPrice ? parseFloat(buyPrice) : null,
      stock: stock ? parseInt(stock) : 0,
      condition: condition || 'New',
      status: status || 'ACTIVE',
      video: video || '',
      images: Array.isArray(images) ? images : [],
      variations: (variations || variants) && typeof (variations || variants) === 'object' ? (variations || variants) : {},
      details: Array.isArray(details) ? details : [],
      unit: unit || '',
      warranty: warranty || '',
      deliveryApplied: deliveryApplied !== undefined ? deliveryApplied : true,
      websiteId: website.id
    };

    console.log('DEBUG: Product data to create:', JSON.stringify(productData, null, 2));

    const product = await Product.create(productData);

    console.log('DEBUG: Product created successfully:', product.id);

    res.status(201).json(product);
  } catch (error) {
    console.log('DEBUG: Error creating product:', error.message);
    console.log('DEBUG: Error stack:', error.stack);
    console.log('DEBUG: Error name:', error.name);
    
    // Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      console.log('DEBUG: Validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'ডেটা validation error', 
        errors: error.errors.map(e => e.message)
      });
    }
    
    // Sequelize database errors
    if (error.name === 'SequelizeDatabaseError') {
      console.log('DEBUG: Database error:', error.original);
      return res.status(500).json({ 
        message: 'Database error হয়েছে', 
        error: error.original?.message || error.message 
      });
    }
    
    // General error
    res.status(500).json({ 
      message: 'Error creating product', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      shortDesc,
      brand,
      sku,
      category,
      price, 
      oldPrice,
      buyPrice,
      stock, 
      condition,
      status,
      video,
      images, 
      variations, 
      isActive 
    } = req.body;

    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const product = await Product.findOne({
      where: { id, websiteId: website.id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update({
      name,
      description,
      shortDesc,
      brand,
      sku,
      category,
      subcategory: req.body.subcategory || '',
      price,
      oldPrice,
      buyPrice,
      stock,
      condition,
      status,
      video,
      images,
      variations,
      isActive
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const deleted = await Product.destroy({
      where: { id, websiteId: website.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
