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

// Simple fallback responses for when OpenAI is not available
const fallbackResponses = {
  greeting: 'আস্সালামু আলাইকুম! আমি আপনাকে সাহায্য করতে পারি। আপনি কি খুঁজছেন?',
  order: 'অর্ডার করতে চান? দয়া করে আপনার নাম, ফোন নম্বর এবং ঠিকানা দিন।',
  products: 'আমাদের পণ্য দেখতে চান? আমি আপনাকে আমাদের সেরা পণ্যগুলো দেখাতে পারি।',
  default: 'দুঃখিত, আমি এটি বুঝতে পারিনি। আপনি আমাদের পণ্য সম্পর্কে জানতে পারেন বা অর্ডার করতে পারেন।'
};

// Simple response generator without AI
function generateFallbackResponse(message, products) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('হাই') || lowerMessage.includes('হ্যালো')) {
    return fallbackResponses.greeting;
  }
  
  if (lowerMessage.includes('order') || lowerMessage.includes('buy') || lowerMessage.includes('অর্ডার') || lowerMessage.includes('কিনতে')) {
    return fallbackResponses.order;
  }
  
  if (lowerMessage.includes('product') || lowerMessage.includes('পণ্য') || lowerMessage.includes('item')) {
    const productList = products.slice(0, 3).map(p => `• ${p.name} - ৳${p.price}`).join('\n');
    return `এখানে আমাদের কিছু জনপ্রিয় পণ্য:\n${productList}`;
  }
  
  return fallbackResponses.default;
}

// Chat with bot
router.post('/chat', async (req, res) => {
  try {
    const { websiteId, message, conversationId } = req.body;

    // Get website and products for context
    const website = await Website.findByPk(websiteId, {
      include: [{ model: Product, where: { isActive: true }, required: false }]
    });

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const products = website.Products || [];
    let botResponse;

    if (openai) {
      // Use OpenAI if available
      try {
        const productContext = products.map(p => 
          `Product: ${p.name}, Price: ${p.price} BDT, Stock: ${p.stock}, Description: ${p.description}`
        ).join('\n');

        const systemPrompt = `You are a helpful sales assistant for ${website.name}. 
        Here are the available products:
        ${productContext}
        
        Help customers find products, answer questions about pricing, stock, and features.
        When a customer wants to place an order, collect their details: name, phone, address.
        Always be friendly and helpful in Bengali or English.`;

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
      } catch (aiError) {
        console.log('AI API error, using fallback:', aiError.message);
        botResponse = generateFallbackResponse(message, products);
      }
    } else {
      // Use fallback response system
      botResponse = generateFallbackResponse(message, products);
    }

    // Check if customer wants to place order
    const orderKeywords = ['order', 'buy', 'purchase', 'কিনতে', 'অর্ডার'];
    const isOrderIntent = orderKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    res.json({
      response: botResponse,
      conversationId: conversationId || Date.now().toString(),
      needsOrderDetails: isOrderIntent && !message.includes('phone'),
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
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product?.name}` });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
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
