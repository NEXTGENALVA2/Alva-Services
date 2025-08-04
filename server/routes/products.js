const express = require('express');
const { Product, Website } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all products for user's website
router.get('/', authMiddleware, async (req, res) => {
  try {
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const products = await Product.findAll({
      where: { websiteId: website.id },
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
    const { name, description, price, stock, images, variations } = req.body;
    
    const website = await Website.findOne({ where: { userId: req.user.id } });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      images: images || [],
      variations: variations || {},
      websiteId: website.id
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, images, variations, isActive } = req.body;

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
      price,
      stock,
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
