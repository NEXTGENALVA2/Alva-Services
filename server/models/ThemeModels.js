const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Theme Templates Model - For storing predefined theme configurations
const ThemeTemplate = sequelize.define('ThemeTemplate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  displayName: { type: DataTypes.STRING, allowNull: false }, // Bengali/English display name
  description: DataTypes.TEXT,
  category: { type: DataTypes.ENUM('basic', 'premium', 'enterprise'), defaultValue: 'basic' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  previewImage: DataTypes.STRING, // Screenshot/preview image URL
  
  // Theme Configuration
  colors: {
    type: DataTypes.JSONB,
    defaultValue: {
      primary: '#2563EB',
      secondary: '#E5E7EB', 
      background: '#FFFFFF',
      text: '#1F2937',
      accent: '#10B981'
    }
  },
  
  // Layout Configuration
  layout: {
    type: DataTypes.JSONB,
    defaultValue: {
      headerStyle: 'modern', // modern, classic, minimal
      footerStyle: 'simple',
      productCardStyle: 'card', // card, list, grid
      bannerStyle: 'carousel', // carousel, static, slider
      buttonStyle: 'rounded', // rounded, square, pill
      navigationStyle: 'horizontal' // horizontal, vertical, dropdown
    }
  },
  
  // Typography Configuration  
  typography: {
    type: DataTypes.JSONB,
    defaultValue: {
      primaryFont: 'Inter',
      secondaryFont: 'Inter',
      headingSize: 'large', // small, medium, large
      bodySize: 'medium',
      fontWeight: 'normal' // light, normal, bold
    }
  },
  
  // Component Styles
  components: {
    type: DataTypes.JSONB,
    defaultValue: {
      borderRadius: '8px',
      spacing: 'medium', // tight, medium, relaxed
      shadows: true,
      animations: true,
      productHover: 'scale', // scale, shadow, none
      buttonHover: 'darken' // darken, lighten, scale
    }
  },
  
  // Custom CSS
  customCSS: DataTypes.TEXT,
  
  // Pricing
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  isSubscriptionRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
  
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

// Website Theme Configuration - For storing website-specific theme customizations
const WebsiteThemeConfig = sequelize.define('WebsiteThemeConfig', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  websiteId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: { model: 'Websites', key: 'id' }
  },
  themeTemplateId: { 
    type: DataTypes.UUID, 
    allowNull: false,
    references: { model: 'ThemeTemplates', key: 'id' }
  },
  
  // Customized configuration (overrides template defaults)
  customColors: DataTypes.JSONB,
  customLayout: DataTypes.JSONB,
  customTypography: DataTypes.JSONB,
  customComponents: DataTypes.JSONB,
  customCSS: DataTypes.TEXT,
  
  // Configuration status
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  appliedAt: DataTypes.DATE,
  
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
});

// Define associations
ThemeTemplate.hasMany(WebsiteThemeConfig, { foreignKey: 'themeTemplateId' });
WebsiteThemeConfig.belongsTo(ThemeTemplate, { foreignKey: 'themeTemplateId' });

// Add to existing Website model association (this would be added to main models/index.js)
// Website.hasOne(WebsiteThemeConfig, { foreignKey: 'websiteId' });
// WebsiteThemeConfig.belongsTo(Website, { foreignKey: 'websiteId' });

module.exports = {
  ThemeTemplate,
  WebsiteThemeConfig
};