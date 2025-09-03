import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
// import db from '../../../server/config/database'; // Not available in Next.js API routes

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getWebsiteContext(websiteId: string) {
  // Example: return mock products and faqs since db is not available in API route
  const products = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 200 },
    { id: 3, name: 'Product C', price: 300 }
  ];
  const faqs = [
    { question: 'How to order?', answer: 'Click the order button.' },
    { question: 'Payment methods?', answer: 'We accept cards and cash.' }
  ];
  return { products, faqs };
}

function isOrderIntent(message: string) {
  // Simple check for order intent
  return /name|address|phone|order|অর্ডার|ঠিকানা|নাম|ফোন/i.test(message);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { websiteId, message, conversationId } = req.body;

  // Get website context
  const context = await getWebsiteContext(websiteId);

  // Prepare prompt
  let prompt = `You are a helpful assistant for an e-commerce website. Answer only questions related to the website, products, or orders. If the question is not related, reply: 'Please ask about our website, products, or orders.'\n`;
  prompt += `Website products: ${context.products.map((p: any) => `${p.name} - ৳${p.price}`).join(', ')}\n`;
  prompt += `FAQs: ${context.faqs.map((f: any) => `${f.question}: ${f.answer}`).join(', ')}\n`;
  prompt += `User: ${message}\nAssistant:`;

  // Detect order intent
  let needsOrderDetails = false;
  if (isOrderIntent(message)) {
    // If user provides name, address, phone, trigger order placement
    // You can parse and validate here
    // For demo, just set needsOrderDetails = true
    needsOrderDetails = true;
    // TODO: Place order in DB if all info present
  }

  // Call OpenAI
  const completion = await openai.completions.create({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 200,
    temperature: 0.7,
  });

  const responseText = completion.choices[0].text?.trim() || '';

  // Optionally suggest products
  let suggestedProducts: any[] = [];
  if (/product|পণ্য|show|দেখান/i.test(message)) {
    suggestedProducts = context.products.slice(0, 3);
  }

  res.status(200).json({
    response: responseText,
    conversationId: conversationId || Date.now().toString(),
    suggestedProducts,
    needsOrderDetails,
  });
}
