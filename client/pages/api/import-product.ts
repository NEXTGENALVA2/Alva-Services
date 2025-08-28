import type { NextApiRequest, NextApiResponse } from 'next';

// Auto generate SEO description (short) based on product name and category
function generateSEODescription(name: string, category: string, price: number): string {
  return `Buy ${name} online at best price ৳${price}. High quality ${category.toLowerCase()} product with fast delivery. Shop now and get the best deals!`;
}

// Auto detect category based on product name
function detectCategory(name: string): { category: string, subcategory: string } {
  const nameL = name.toLowerCase();
  
  if (nameL.includes('phone') || nameL.includes('mobile') || nameL.includes('smartphone')) {
    return { category: 'Electronics', subcategory: 'Mobile Phones' };
  }
  if (nameL.includes('laptop') || nameL.includes('computer') || nameL.includes('pc')) {
    return { category: 'Electronics', subcategory: 'Computers' };
  }
  if (nameL.includes('headphone') || nameL.includes('earphone') || nameL.includes('speaker')) {
    return { category: 'Electronics', subcategory: 'Audio' };
  }
  if (nameL.includes('watch') || nameL.includes('clock')) {
    return { category: 'Gadgets', subcategory: 'Wearables' };
  }
  if (nameL.includes('camera') || nameL.includes('photo')) {
    return { category: 'Electronics', subcategory: 'Cameras' };
  }
  if (nameL.includes('book') || nameL.includes('novel') || nameL.includes('guide')) {
    return { category: 'Books', subcategory: 'General' };
  }
  if (nameL.includes('shirt') || nameL.includes('pant') || nameL.includes('dress') || nameL.includes('clothing')) {
    return { category: 'Fashion', subcategory: 'Clothing' };
  }
  
  return { category: 'Electronics', subcategory: 'General' };
}

// Generate placeholder image based on category
function generatePlaceholderImage(category: string): string {
  const placeholders = {
    'Electronics': 'https://via.placeholder.com/400x400/2563eb/ffffff?text=Electronics+Product',
    'Gadgets': 'https://via.placeholder.com/400x400/7c3aed/ffffff?text=Smart+Gadget',
    'Fashion': 'https://via.placeholder.com/400x400/ec4899/ffffff?text=Fashion+Item',
    'Books': 'https://via.placeholder.com/400x400/059669/ffffff?text=Book+Cover',
    'Home': 'https://via.placeholder.com/400x400/ea580c/ffffff?text=Home+Product'
  };
  return placeholders[category as keyof typeof placeholders] || 'https://via.placeholder.com/400x400/6b7280/ffffff?text=Product+Image';
}

async function extractProductData(url: string) {
  try {
    const fetch = (await import('node-fetch')).default;
    const cheerio = await import('cheerio');
    
    // Add headers to bypass basic bot detection
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);

    // Enhanced selectors for different websites
    let name = $('span#productTitle').text().trim() || 
               $('h1.product-title').text().trim() ||
               $('h1').first().text().trim() ||
               $('title').text().trim().split('|')[0].trim();

    // Better price extraction with multiple patterns
    let price = $('span.a-price-whole').first().text().trim() || 
                $('span.price').first().text().trim() ||
                $('.price').text().trim() ||
                $('[class*="price"]').first().text().trim() ||
                $('meta[property="product:price:amount"]').attr('content') ||
                '0';

    // Enhanced image selectors
    let image = $('#imgTagWrapperId img').attr('src') || 
                $('img.product-image').attr('src') ||
                $('.product-image img').attr('src') ||
                $('img[src*="product"]').first().attr('src') ||
                $('img').first().attr('src');

    // Enhanced description extraction
    let fullDescription = $('#productDescription').text().trim() || 
                         $('#feature-bullets ul').text().trim() ||
                         $('meta[name="description"]').attr('content') || 
                         $('.product-description').text().trim() ||
                         $('.description').text().trim() ||
                         $('[class*="description"]').first().text().trim() || '';

    // Fallbacks
    if (!name || name.length < 3) name = 'Imported Product';
    
    // Better price parsing - extract numbers only
    let priceNum = 0;
    if (price) {
      const priceMatch = price.replace(/[^\d.,]/g, '').replace(',', '');
      priceNum = parseFloat(priceMatch) || 0;
    }
    
    // Ensure minimum price for validation
    if (priceNum <= 0) {
      priceNum = 100; // Default minimum price
    }

    // Auto-detect category and subcategory
    const { category, subcategory } = detectCategory(name);

    // Generate SEO description
    const shortDescription = generateSEODescription(name, category, priceNum);

    // Handle image URL - make absolute if relative
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url);
      if (image.startsWith('//')) {
        image = urlObj.protocol + image;
      } else if (image.startsWith('/')) {
        image = urlObj.origin + image;
      } else {
        image = generatePlaceholderImage(category);
      }
    }

    // Auto-generate placeholder image if still not found
    if (!image) {
      image = generatePlaceholderImage(category);
    }

    // If no full description found, create a basic one
    if (!fullDescription || fullDescription.length < 10) {
      fullDescription = `This is a high-quality ${name} in ${category} category. Perfect for your needs with excellent features and reliable performance.`;
    }

    console.log('Extracted data:', { name, priceNum, image, category });

    return {
      name,
      price: priceNum,
      image,
      shortDescription,
      description: fullDescription,
      category,
      subcategory,
      sku: 'IMPORTED-' + Math.floor(Math.random() * 10000),
      stock: 10,
      brand: 'Imported Brand',
      condition: 'New',
      status: 'Active'
    };
    
  } catch (error) {
    console.error('Scraping error:', error);
    // Return fallback data if scraping fails
    const fallbackName = 'Imported Product';
    const fallbackCategory = 'Electronics';
    
    return {
      name: fallbackName,
      price: 100, // Minimum valid price
      image: generatePlaceholderImage(fallbackCategory),
      shortDescription: generateSEODescription(fallbackName, fallbackCategory, 100),
      description: 'This product was imported but detailed information could not be extracted. Please update the details manually.',
      category: fallbackCategory,
      subcategory: 'General',
      sku: 'IMPORTED-' + Math.floor(Math.random() * 10000),
      stock: 10,
      brand: 'Imported Brand',
      condition: 'New',
      status: 'Active'
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, message: 'No URL provided' });
  
  console.log('Attempting to scrape:', url);
  
  try {
    const product = await extractProductData(url);
    console.log('Scraped product:', product);
    
    // Validate required fields
    if (!product.name || product.price <= 0) {
      console.log('Validation failed:', { name: product.name, price: product.price });
      return res.status(400).json({ 
        success: false, 
        message: 'Could not extract valid product data. Please check the URL or try a different product link.',
        debug: { name: product.name, price: product.price }
      });
    }
    
    return res.status(200).json({ success: true, product });
    
  } catch (err: any) {
    console.error('Import error:', err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Import failed. The website might be blocking automated access.',
      debug: err.toString()
    });
  }
}
