const express = require('express');
const { ThemeTemplate, WebsiteThemeConfig, Website } = require('../models');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all available theme templates
router.get('/templates', async (req, res) => {
  try {
    const { category } = req.query;
    
    let whereClause = { isActive: true };
    if (category && ['basic', 'premium', 'enterprise'].includes(category)) {
      whereClause.category = category;
    }
    
    const themes = await ThemeTemplate.findAll({
      where: whereClause,
      order: [
        ['category', 'ASC'], // basic first, then premium, then enterprise
        ['price', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    res.json({
      success: true,
      themes: themes.map(theme => ({
        id: theme.id,
        name: theme.name,
        displayName: theme.displayName,
        description: theme.description,
        category: theme.category,
        previewImage: theme.previewImage,
        colors: theme.colors,
        layout: theme.layout,
        typography: theme.typography,
        components: theme.components,
        price: theme.price,
        isSubscriptionRequired: theme.isSubscriptionRequired
      }))
    });
  } catch (error) {
    console.error('Error fetching theme templates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching theme templates', 
      error: error.message 
    });
  }
});

// Get specific theme template by name or ID
router.get('/templates/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by name
    let theme = await ThemeTemplate.findByPk(identifier);
    if (!theme) {
      theme = await ThemeTemplate.findOne({ where: { name: identifier, isActive: true } });
    }
    
    if (!theme) {
      return res.status(404).json({ 
        success: false, 
        message: 'Theme template not found' 
      });
    }
    
    res.json({
      success: true,
      theme: {
        id: theme.id,
        name: theme.name,
        displayName: theme.displayName,
        description: theme.description,
        category: theme.category,
        previewImage: theme.previewImage,
        colors: theme.colors,
        layout: theme.layout,
        typography: theme.typography,
        components: theme.components,
        customCSS: theme.customCSS,
        price: theme.price,
        isSubscriptionRequired: theme.isSubscriptionRequired
      }
    });
  } catch (error) {
    console.error('Error fetching theme template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching theme template', 
      error: error.message 
    });
  }
});

// Get current website theme configuration
router.get('/website/:websiteId/current', authMiddleware, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      where: { id: websiteId, userId: req.user.id } 
    });
    
    if (!website) {
      return res.status(404).json({ 
        success: false, 
        message: 'Website not found or access denied' 
      });
    }
    
    // Get current theme configuration
    const currentConfig = await WebsiteThemeConfig.findOne({
      where: { websiteId, isActive: true },
      include: [{ model: ThemeTemplate }]
    });
    
    if (!currentConfig) {
      // Return basic theme as default
      const basicTheme = await ThemeTemplate.findOne({ 
        where: { name: 'basic', isActive: true } 
      });
      
      return res.json({
        success: true,
        currentTheme: {
          template: basicTheme,
          customizations: {},
          isDefault: true
        }
      });
    }
    
    res.json({
      success: true,
      currentTheme: {
        template: currentConfig.ThemeTemplate,
        customizations: {
          colors: currentConfig.customColors,
          layout: currentConfig.customLayout,
          typography: currentConfig.customTypography,
          components: currentConfig.customComponents,
          customCSS: currentConfig.customCSS
        },
        appliedAt: currentConfig.appliedAt,
        isDefault: false
      }
    });
  } catch (error) {
    console.error('Error fetching website theme:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching website theme', 
      error: error.message 
    });
  }
});

// Apply theme template to website
router.post('/website/:websiteId/apply', authMiddleware, async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { themeTemplateId, customizations = {} } = req.body;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      where: { id: websiteId, userId: req.user.id } 
    });
    
    if (!website) {
      return res.status(404).json({ 
        success: false, 
        message: 'Website not found or access denied' 
      });
    }
    
    // Verify theme template exists
    const themeTemplate = await ThemeTemplate.findOne({
      where: { id: themeTemplateId, isActive: true }
    });
    
    if (!themeTemplate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Theme template not found' 
      });
    }
    
    // Check if premium theme requires subscription (TODO: Add subscription check)
    if (themeTemplate.isSubscriptionRequired) {
      // TODO: Verify user has active subscription
      console.log('Premium theme selected, subscription check needed');
    }
    
    // Deactivate current theme configuration
    await WebsiteThemeConfig.update(
      { isActive: false },
      { where: { websiteId, isActive: true } }
    );
    
    // Create new theme configuration
    const newConfig = await WebsiteThemeConfig.create({
      websiteId,
      themeTemplateId,
      customColors: customizations.colors || null,
      customLayout: customizations.layout || null,
      customTypography: customizations.typography || null,
      customComponents: customizations.components || null,
      customCSS: customizations.customCSS || null,
      isActive: true,
      appliedAt: new Date()
    });
    
    // Update website theme field for backward compatibility
    await Website.update(
      { theme: themeTemplate.name },
      { where: { id: websiteId } }
    );
    
    // Get the complete configuration
    const appliedConfig = await WebsiteThemeConfig.findByPk(newConfig.id, {
      include: [{ model: ThemeTemplate }]
    });
    
    res.json({
      success: true,
      message: 'Theme applied successfully',
      appliedTheme: {
        template: appliedConfig.ThemeTemplate,
        customizations: {
          colors: appliedConfig.customColors,
          layout: appliedConfig.customLayout,
          typography: appliedConfig.customTypography,
          components: appliedConfig.customComponents,
          customCSS: appliedConfig.customCSS
        },
        appliedAt: appliedConfig.appliedAt
      }
    });
  } catch (error) {
    console.error('Error applying theme:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error applying theme', 
      error: error.message 
    });
  }
});

// Update theme customizations for website
router.put('/website/:websiteId/customize', authMiddleware, async (req, res) => {
  try {
    const { websiteId } = req.params;
    const { customizations } = req.body;
    
    // Verify website ownership
    const website = await Website.findOne({ 
      where: { id: websiteId, userId: req.user.id } 
    });
    
    if (!website) {
      return res.status(404).json({ 
        success: false, 
        message: 'Website not found or access denied' 
      });
    }
    
    // Get current active theme configuration
    const currentConfig = await WebsiteThemeConfig.findOne({
      where: { websiteId, isActive: true },
      include: [{ model: ThemeTemplate }]
    });
    
    if (!currentConfig) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active theme configuration found' 
      });
    }
    
    // Update customizations
    await currentConfig.update({
      customColors: customizations.colors || currentConfig.customColors,
      customLayout: customizations.layout || currentConfig.customLayout,
      customTypography: customizations.typography || currentConfig.customTypography,
      customComponents: customizations.components || currentConfig.customComponents,
      customCSS: customizations.customCSS || currentConfig.customCSS
    });
    
    res.json({
      success: true,
      message: 'Theme customizations updated successfully',
      updatedTheme: {
        template: currentConfig.ThemeTemplate,
        customizations: {
          colors: currentConfig.customColors,
          layout: currentConfig.customLayout,
          typography: currentConfig.customTypography,
          components: currentConfig.customComponents,
          customCSS: currentConfig.customCSS
        }
      }
    });
  } catch (error) {
    console.error('Error updating theme customizations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating theme customizations', 
      error: error.message 
    });
  }
});

// Get theme configuration for public website (for rendering)
router.get('/public/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Find website by domain
    const website = await Website.findOne({ 
      where: { domain, isActive: true } 
    });
    
    if (!website) {
      return res.status(404).json({ 
        success: false, 
        message: 'Website not found' 
      });
    }
    
    // Get theme configuration
    const themeConfig = await WebsiteThemeConfig.findOne({
      where: { websiteId: website.id, isActive: true },
      include: [{ model: ThemeTemplate }]
    });
    
    if (!themeConfig) {
      // Return basic theme configuration
      const basicTheme = await ThemeTemplate.findOne({ 
        where: { name: 'basic', isActive: true } 
      });
      
      return res.json({
        success: true,
        theme: {
          name: 'basic',
          displayName: basicTheme.displayName,
          colors: basicTheme.colors,
          layout: basicTheme.layout,
          typography: basicTheme.typography,
          components: basicTheme.components,
          customCSS: basicTheme.customCSS
        }
      });
    }
    
    // Merge template with customizations
    const template = themeConfig.ThemeTemplate;
    const mergedTheme = {
      name: template.name,
      displayName: template.displayName,
      colors: { ...template.colors, ...(themeConfig.customColors || {}) },
      layout: { ...template.layout, ...(themeConfig.customLayout || {}) },
      typography: { ...template.typography, ...(themeConfig.customTypography || {}) },
      components: { ...template.components, ...(themeConfig.customComponents || {}) },
      customCSS: themeConfig.customCSS || template.customCSS
    };
    
    res.json({
      success: true,
      theme: mergedTheme
    });
  } catch (error) {
    console.error('Error fetching public theme:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching theme configuration', 
      error: error.message 
    });
  }
});

module.exports = router;