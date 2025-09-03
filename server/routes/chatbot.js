const express = require('express');
const { Product, Order, OrderItem, Website } = require('../models');

const router = express.Router();

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Initialize Groq (free AI) as backup
let groq = null;
if (process.env.GROQ_API_KEY) {
  const Groq = require('groq-sdk');
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
}

// If no API key is set, use Groq's free tier (requires signup at https://console.groq.com/)
if (!openai && !groq) {
  console.log('No AI API key found. Using fallback responses. Get free Groq API key from https://console.groq.com/');
}

// Simple fallback responses for when OpenAI is not available
const fallbackResponses = {
  greeting: {
    en: 'Assalamu Alaikum! How can I help you today? You can ask about our products or place an order.',
    bn: 'আস্সালামু আলাইকুম! আমি আপনাকে কিভাবে সাহায্য করতে পারি? আপনি আমাদের পণ্য সম্পর্কে জানতে পারেন এবং অর্ডার করতে পারেন।'
  },
  order: {
    en: 'Want to place an order? Great! Please provide your:\n• Name\n• Phone number\n• Address\nI will confirm your order.',
    bn: 'অর্ডার করতে চান? দুর্দান্ত! অনুগ্রহ করে আপনার:\n• নাম\n• ফোন নম্বর\n• ঠিকানা\nএই তথ্যগুলো দিন। আমি আপনার অর্ডার নিশ্চিত করে দেব।'
  },
  products: {
    en: 'Want to see our products? I can show you our best products.',
    bn: 'আমাদের পণ্য দেখতে চান? আমি আপনাকে আমাদের সেরা পণ্যগুলো দেখাতে পারি।'
  },
  default: {
    en: 'Sorry, I didn\'t understand that. You can ask about our products or place an order.',
    bn: 'দুঃখিত, আমি এটি বুঝতে পারিনি। আপনি আমাদের পণ্য সম্পর্কে জানতে পারেন বা অর্ডার করতে পারেন।'
  }
};

// Language detection function
function detectLanguage(message) {
  // Check for Bengali characters or common Bengali words
  const bengaliPattern = /[\u0980-\u09FF]/;
  const bengaliWords = ['আমি', 'আপনি', 'কি', 'করতে', 'চাই', 'দেখতে', 'জানতে', 'অর্ডার', 'পণ্য', 'দাম', 'স্টক'];
  
  if (bengaliPattern.test(message) || bengaliWords.some(word => message.includes(word))) {
    return 'bn';
  }
  
  // Default to English
  return 'en';
}

// Simple response generator without AI
function generateFallbackResponse(message, products) {
  const lang = detectLanguage(message);
  const lowerMessage = message.toLowerCase();
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('হাই') || lowerMessage.includes('হ্যালো') || lowerMessage.includes('আস্সালাম')) {
    return lang === 'bn' 
      ? 'আস্সালামু আলাইকুম! আমি আপনার সহায়ক। আমাদের পণ্য সম্পর্কে জানতে চান? নাকি অর্ডার করতে চান?'
      : 'Assalamu Alaikum! I\'m your assistant. Want to know about our products or place an order?';
  }
  
  // Product queries
  if (lowerMessage.includes('product') || lowerMessage.includes('পণ্য') || lowerMessage.includes('item') || lowerMessage.includes('কি আছে')) {
    const productList = products.slice(0, 3).map(p => `• ${p.name} - ৳${p.price}`).join('\n');
    return lang === 'bn'
      ? `আমাদের কিছু জনপ্রিয় পণ্য:\n${productList}\n\nকোন পণ্য সম্পর্কে বিস্তারিত জানতে চান?`
      : `Here are some popular products:\n${productList}\n\nWant details about any specific product?`;
  }
  
  // Price queries
  if (lowerMessage.includes('price') || lowerMessage.includes('দাম') || lowerMessage.includes('কত টাকা')) {
    return lang === 'bn'
      ? `আমাদের পণ্যের দাম ৳${Math.min(...products.map(p => p.price))} থেকে ৳${Math.max(...products.map(p => p.price))} পর্যন্ত। কোন নির্দিষ্ট পণ্যের দাম জানতে চান?`
      : `Our products range from ৳${Math.min(...products.map(p => p.price))} to ৳${Math.max(...products.map(p => p.price))}. Want to know about a specific product?`;
  }
  
  // Order queries
  if (lowerMessage.includes('order') || lowerMessage.includes('buy') || lowerMessage.includes('অর্ডার') || lowerMessage.includes('কিনতে') || lowerMessage.includes('কিনব')) {
    return lang === 'bn'
      ? 'অর্ডার করতে চান? দুর্দান্ত! অনুগ্রহ করে আপনার:\n• নাম\n• ফোন নম্বর\n• ঠিকানা\nএই তথ্যগুলো দিন। আমি আপনার অর্ডার নিশ্চিত করে দেব।'
      : 'Want to place an order? Great! Please provide your:\n• Name\n• Phone number\n• Address\nI will confirm your order.';
  }
  
  // Stock queries
  if (lowerMessage.includes('stock') || lowerMessage.includes('available') || lowerMessage.includes('স্টক') || lowerMessage.includes('পাওয়া যাবে')) {
    return lang === 'bn'
      ? `আমাদের সব পণ্য স্টকে আছে। মোট ${products.reduce((sum, p) => sum + p.stock, 0)}টি পণ্য রয়েছে। কোন নির্দিষ্ট পণ্যের স্টক জানতে চান?`
      : `All our products are in stock. We have ${products.reduce((sum, p) => sum + p.stock, 0)} items total. Want to check a specific product?`;
  }
  
  // Help queries
  if (lowerMessage.includes('help') || lowerMessage.includes('সাহায্য') || lowerMessage.includes('কিভাবে')) {
    return lang === 'bn'
      ? 'আমি আপনাকে সাহায্য করতে পারি:\n• পণ্য সম্পর্কে তথ্য\n• দাম জানা\n• অর্ডার করা\n• স্টক চেক করা\n\nআপনি কী জানতে চান?'
      : 'I can help you with:\n• Product information\n• Price inquiries\n• Placing orders\n• Stock checking\n\nWhat would you like to know?';
  }
  
  // Default for other queries
  return lang === 'bn'
    ? `আমি ${products.length}টি দুর্দান্ত পণ্য নিয়ে আছি। আমাদের ওয়েবসাইট এবং পণ্য সম্পর্কে প্রশ্ন করুন। পণ্য দেখতে চান, দাম জানতে চান, নাকি অর্ডার করতে চান?`
    : `I have ${products.length} great products. Ask me about our website and products. Want to see products, know prices, or place an order?`;
}
router.post('/chat', async (req, res) => {
  try {
    console.log('Chatbot API called with:', req.body);
    const { websiteId, message, conversationId } = req.body;

    // Get website and products for context
    const website = await Website.findByPk(websiteId, {
      include: [{ model: Product, where: { isActive: true }, required: false }]
    });

    if (!website) {
      console.log('Website not found for ID:', websiteId);
      return res.status(404).json({ message: 'Website not found' });
    }

    const products = website.Products || [];
    console.log('Found products:', products.length);
    let botResponse;

    // Try AI APIs in order: OpenAI -> Groq -> Fallback
    if (openai) {
      // Use OpenAI if available
      try {
        console.log('Using OpenAI for response...');
        const productContext = products.map(p => 
          `Product: ${p.name}, Price: ${p.price} BDT, Stock: ${p.stock}, Description: ${p.description}`
        ).join('\n');

        const systemPrompt = `You are a helpful sales assistant for ${website.name} e-commerce website. 
        Here are the available products:
        ${productContext}
        
        IMPORTANT: Detect the customer's language from their message.
        - If they use Bengali/অ-হ characters or Bengali words like 'আমি', 'আপনি', 'কি', 'চাই', respond in Bengali.
        - If they use English, respond in English.
        - Always match the customer's language exactly.
        
        Help customers find products, answer questions about pricing, stock, and features.
        When a customer wants to place an order, collect their details: name, phone, address.
        Always be friendly and helpful. Keep responses concise but informative.
        If asked about irrelevant topics, politely redirect to website/product questions.
        
        Response guidelines:
        - Use the same language as the customer
        - Be conversational and friendly
        - Provide specific product information when asked
        - Guide customers through the ordering process`;

        console.log('Calling OpenAI API...');
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        botResponse = completion.choices[0].message.content;
        console.log('OpenAI response:', botResponse);
      } catch (aiError) {
        console.log('OpenAI API error, trying Groq...', aiError.message);
        openai = null; // Disable for this session
      }
    }
    
    if (!botResponse && groq) {
      // Use Groq as backup (free and fast)
      try {
        console.log('Using Groq for response...');
        const productContext = products.map(p => 
          `Product: ${p.name}, Price: ${p.price} BDT, Stock: ${p.stock}, Description: ${p.description}`
        ).join('\n');

        const systemPrompt = `You are a helpful sales assistant for ${website.name} e-commerce website. 
        Here are the available products:
        ${productContext}
        
        IMPORTANT: Detect the customer's language from their message.
        - If they use Bengali/অ-হ characters or Bengali words like 'আমি', 'আপনি', 'কি', 'চাই', respond in Bengali.
        - If they use English, respond in English.
        - Always match the customer's language exactly.
        
        Help customers find products, answer questions about pricing, stock, and features.
        When a customer wants to place an order, collect their details: name, phone, address.
        Always be friendly and helpful. Keep responses concise but informative.
        If asked about irrelevant topics, politely redirect to website/product questions.
        
        Response guidelines:
        - Use the same language as the customer
        - Be conversational and friendly
        - Provide specific product information when asked
        - Guide customers through the ordering process`;

        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          model: "mixtral-8x7b-32768", // Free Groq model
          temperature: 0.7,
          max_tokens: 500,
        });

        botResponse = completion.choices[0].message.content;
        console.log('Groq response:', botResponse);
      } catch (groqError) {
        console.log('Groq API error, using fallback:', groqError.message);
      }
    }
    
    if (!botResponse) {
      // Use enhanced fallback response system
      console.log('Using fallback response system');
      botResponse = generateFallbackResponse(message, products);
    }

    // Check if customer wants to place order
    const orderKeywords = ['order', 'buy', 'purchase', 'কিনতে', 'অর্ডার', 'place'];
    const isOrderIntent = orderKeywords.some(keyword => message.toLowerCase().includes(keyword));

    // Extract order details from message
    let extractedName = null, extractedPhone = null, extractedAddress = null, extractedProduct = null;
    const nameMatch = message.match(/name[:\-]?\s*([A-Za-zঅ-হ\s]+)/i);
    if (nameMatch) extractedName = nameMatch[1].trim();
    const phoneMatch = message.match(/phone\s*number[:\-]?\s*(\d{10,15})/i);
    if (phoneMatch) extractedPhone = phoneMatch[1].trim();
    const addressMatch = message.match(/address[:\-]?\s*([A-Za-z0-9,\.অ-হ\s]+)/i);
    if (addressMatch) extractedAddress = addressMatch[1].trim();
    const productMatch = message.match(/product[:\-]?\s*([A-Za-z0-9,\.অ-হ\s\-]+)(?: order|$)/i);
    if (productMatch) {
      // Remove price and extra details from product string
      extractedProduct = productMatch[1].replace(/-?\s*৳[0-9,.]+/g, '').trim();
    }

    // If all details present, auto place order
    if (isOrderIntent && extractedName && extractedPhone && extractedAddress && extractedProduct) {
      // Find product by fuzzy/partial name match (case-insensitive)
      const selectedProduct = products.find(p => {
        // Remove price from product name for matching
        const cleanName = p.name.replace(/-?\s*৳[0-9,.]+/g, '').trim().toLowerCase();
        return cleanName.includes(extractedProduct.toLowerCase());
      });
      if (selectedProduct) {
        // Create order
        const order = await Order.create({
          websiteId,
          customerName: extractedName,
          customerPhone: extractedPhone,
          customerAddress: extractedAddress,
          totalAmount: selectedProduct.price,
          status: 'pending',
          paymentStatus: 'pending'
        });
        await OrderItem.create({
          productId: selectedProduct.id,
          quantity: 1,
          price: selectedProduct.price,
          orderId: order.id
        });
        await Product.decrement('stock', { by: 1, where: { id: selectedProduct.id } });
        return res.json({
          response: `Your order for ${selectedProduct.name} has been placed successfully!`,
          orderId: order.id,
          totalAmount: order.totalAmount,
          paymentUrl: `/payment/${order.id}`,
          conversationId: conversationId || Date.now().toString(),
          needsOrderDetails: false,
          suggestedProducts: []
        });
      }
    }

    res.json({
      response: botResponse,
      conversationId: conversationId || Date.now().toString(),
      needsOrderDetails: isOrderIntent && !(extractedName && extractedPhone && extractedAddress && extractedProduct),
      suggestedProducts: products.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price
      }))
    });

  } catch (error) {
    res.status(500).json({ message: 'Error processing chat', error: error.message });
  }
});

// Process order through chatbot
router.post('/process-order', async (req, res) => {
  try {
    const { websiteId, customerDetails, items } = req.body;
    const { name, phone, address, email } = customerDetails;

    // Calculate total
    let totalAmount = 0;
    let orderItems = [];
    // Example logic for items:
    for (const item of items) {
      // You may need to fetch product details from DB if needed
      // const product = await Product.findByPk(item.productId);
      // For now, assume item contains product info
      totalAmount += item.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        variation: item.variation || {}
      });
    }

    // Create order
    const order = await Order.create({
      websiteId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      customerAddress: address,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        ...item,
        orderId: order.id
      });

      // Update product stock
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.productId }
      });
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: order.id,
      totalAmount: order.totalAmount,
      paymentUrl: `/payment/${order.id}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing order', error: error.message });
  }
});

module.exports = router;
