const { sequelize } = require('../config/database');

async function createThemeTables() {
  try {
    console.log('Creating theme tables...');
    
    // Create ThemeTemplates table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "ThemeTemplates" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) UNIQUE NOT NULL,
        "displayName" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "category" VARCHAR(50) DEFAULT 'basic' CHECK ("category" IN ('basic', 'premium', 'enterprise')),
        "isActive" BOOLEAN DEFAULT true,
        "previewImage" VARCHAR(500),
        "colors" JSONB DEFAULT '{"primary": "#2563EB", "secondary": "#E5E7EB", "background": "#FFFFFF", "text": "#1F2937", "accent": "#10B981"}',
        "layout" JSONB DEFAULT '{"headerStyle": "modern", "footerStyle": "simple", "productCardStyle": "card", "bannerStyle": "carousel", "buttonStyle": "rounded", "navigationStyle": "horizontal"}',
        "typography" JSONB DEFAULT '{"primaryFont": "Inter", "secondaryFont": "Inter", "headingSize": "large", "bodySize": "medium", "fontWeight": "normal"}',
        "components" JSONB DEFAULT '{"borderRadius": "8px", "spacing": "medium", "shadows": true, "animations": true, "productHover": "scale", "buttonHover": "darken"}',
        "customCSS" TEXT,
        "price" DECIMAL(10, 2) DEFAULT 0.00,
        "isSubscriptionRequired" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Create WebsiteThemeConfigs table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "WebsiteThemeConfigs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "websiteId" UUID NOT NULL,
        "themeTemplateId" UUID NOT NULL,
        "customColors" JSONB,
        "customLayout" JSONB,
        "customTypography" JSONB,
        "customComponents" JSONB,
        "customCSS" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "appliedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY ("websiteId") REFERENCES "Websites"("id") ON DELETE CASCADE,
        FOREIGN KEY ("themeTemplateId") REFERENCES "ThemeTemplates"("id") ON DELETE RESTRICT
      );
    `);
    
    console.log('Theme tables created successfully!');
    
    // Insert default theme templates
    console.log('Inserting default theme templates...');
    
    await sequelize.query(`
      INSERT INTO "ThemeTemplates" ("id", "name", "displayName", "description", "category", "colors", "layout", "typography", "components", "price", "isSubscriptionRequired") VALUES
      
      -- Basic Theme (Free)
      (gen_random_uuid(), 'basic', 'বেসিক', 'সাধারণ এবং পরিষ্কার ডিজাইন - ছোট ব্যবসার জন্য উপযুক্ত', 'basic', 
       '{"primary": "#2563EB", "secondary": "#E5E7EB", "background": "#FFFFFF", "text": "#1F2937", "accent": "#10B981"}',
       '{"headerStyle": "simple", "footerStyle": "minimal", "productCardStyle": "card", "bannerStyle": "static", "buttonStyle": "rounded", "navigationStyle": "horizontal"}',
       '{"primaryFont": "Inter", "secondaryFont": "Inter", "headingSize": "medium", "bodySize": "medium", "fontWeight": "normal"}',
       '{"borderRadius": "6px", "spacing": "medium", "shadows": false, "animations": false, "productHover": "none", "buttonHover": "darken"}',
       0.00, false),
      
      -- Premium Theme 1: Modern E-commerce
      (gen_random_uuid(), 'modern-ecommerce', 'আধুনিক ই-কমার্স', 'আধুনিক এবং প্রফেশনাল ডিজাইন - মাঝারি ব্যবসার জন্য', 'premium',
       '{"primary": "#1F2937", "secondary": "#F3F4F6", "background": "#F9FAFB", "text": "#111827", "accent": "#3B82F6"}',
       '{"headerStyle": "modern", "footerStyle": "detailed", "productCardStyle": "elevated", "bannerStyle": "carousel", "buttonStyle": "rounded", "navigationStyle": "mega-menu"}',
       '{"primaryFont": "Roboto", "secondaryFont": "Open Sans", "headingSize": "large", "bodySize": "medium", "fontWeight": "medium"}',
       '{"borderRadius": "12px", "spacing": "relaxed", "shadows": true, "animations": true, "productHover": "scale", "buttonHover": "scale"}',
       299.00, true),
      
      -- Premium Theme 2: Aurora Fashion
      (gen_random_uuid(), 'aurora-fashion', 'অরোরা ফ্যাশন', 'রঙিন এবং আকর্ষণীয় ডিজাইন - ফ্যাশন এবং লাইফস্টাইল পণ্যের জন্য', 'premium',
       '{"primary": "#EF4444", "secondary": "#FEE2E2", "background": "#FFFFFF", "text": "#1F2937", "accent": "#F59E0B"}',
       '{"headerStyle": "elegant", "footerStyle": "detailed", "productCardStyle": "fashion", "bannerStyle": "hero-slider", "buttonStyle": "pill", "navigationStyle": "centered"}',
       '{"primaryFont": "Playfair Display", "secondaryFont": "Source Sans Pro", "headingSize": "large", "bodySize": "medium", "fontWeight": "light"}',
       '{"borderRadius": "16px", "spacing": "relaxed", "shadows": true, "animations": true, "productHover": "shadow", "buttonHover": "lighten"}',
       399.00, true),
      
      -- Premium Theme 3: Minimal Pro
      (gen_random_uuid(), 'minimal-pro', 'মিনিমাল প্রো', 'সাদামাটা এবং পেশাদার ডিজাইন - টেক এবং ইলেকট্রনিক্স পণ্যের জন্য', 'premium',
       '{"primary": "#000000", "secondary": "#F5F5F5", "background": "#FFFFFF", "text": "#333333", "accent": "#6366F1"}',
       '{"headerStyle": "minimal", "footerStyle": "clean", "productCardStyle": "minimal", "bannerStyle": "split", "buttonStyle": "square", "navigationStyle": "sidebar"}',
       '{"primaryFont": "SF Pro Display", "secondaryFont": "SF Pro Text", "headingSize": "medium", "bodySize": "small", "fontWeight": "medium"}',
       '{"borderRadius": "4px", "spacing": "tight", "shadows": false, "animations": false, "productHover": "border", "buttonHover": "background"}',
       499.00, true),
      
      -- Premium Theme 4: Vibrant Market
      (gen_random_uuid(), 'vibrant-market', 'প্রাণবন্ত মার্কেট', 'রঙিন এবং জীবন্ত ডিজাইন - খাদ্য এবং গৃহস্থালী পণ্যের জন্য', 'premium',
       '{"primary": "#059669", "secondary": "#D1FAE5", "background": "#F0FDF4", "text": "#065F46", "accent": "#F59E0B"}',
       '{"headerStyle": "colorful", "footerStyle": "rich", "productCardStyle": "vibrant", "bannerStyle": "parallax", "buttonStyle": "rounded", "navigationStyle": "dropdown"}',
       '{"primaryFont": "Nunito", "secondaryFont": "Nunito Sans", "headingSize": "large", "bodySize": "medium", "fontWeight": "bold"}',
       '{"borderRadius": "20px", "spacing": "relaxed", "shadows": true, "animations": true, "productHover": "lift", "buttonHover": "glow"}',
       349.00, true),
      
      -- Enterprise Theme: Luxury Store
      (gen_random_uuid(), 'luxury-store', 'লাক্সারি স্টোর', 'প্রিমিয়াম এবং বিলাসবহুল ডিজাইন - উচ্চমানের পণ্যের জন্য', 'enterprise',
       '{"primary": "#92400E", "secondary": "#FEF3C7", "background": "#FFFBEB", "text": "#451A03", "accent": "#DC2626"}',
       '{"headerStyle": "luxury", "footerStyle": "premium", "productCardStyle": "luxury", "bannerStyle": "cinematic", "buttonStyle": "elegant", "navigationStyle": "luxury-mega"}',
       '{"primaryFont": "Cormorant Garamond", "secondaryFont": "Lato", "headingSize": "extra-large", "bodySize": "medium", "fontWeight": "light"}',
       '{"borderRadius": "0px", "spacing": "generous", "shadows": true, "animations": true, "productHover": "gold-glow", "buttonHover": "slide"}',
       799.00, true)
      
      ON CONFLICT ("name") DO NOTHING;
    `);
    
    console.log('Default theme templates inserted successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error creating theme tables:', error);
    process.exit(1);
  }
}

createThemeTables();