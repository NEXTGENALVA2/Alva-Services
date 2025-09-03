const express = require('express');
const nodemailer = require('nodemailer');
const { User } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { Admin } = require('../models');
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Create email transporter
const createTransporter = () => {
  // For development, you can use Gmail SMTP
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Send reminder emails to users expiring soon
router.post('/send-expiry-reminders', adminAuth, async (req, res) => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Get trial users expiring
    const expiringTrials = await User.findAll({
      where: {
        subscriptionType: 'trial',
        trialEndsAt: {
          [Op.between]: [new Date(), threeDaysFromNow]
        },
        isActive: true
      }
    });

    // Get paid subscription users expiring
    const expiringSubscriptions = await User.findAll({
      where: {
        subscriptionType: { [Op.ne]: 'trial' },
        subscriptionEndsAt: {
          [Op.between]: [new Date(), threeDaysFromNow]
        },
        isActive: true
      }
    });

    const transporter = createTransporter();
    let sentEmails = 0;
    let failedEmails = 0;

    // Send emails to trial users
    for (const user of expiringTrials) {
      try {
        const daysRemaining = Math.ceil((new Date(user.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
        
        const mailOptions = {
          from: process.env.EMAIL_USER || 'noreply@alvaecommerce.com',
          to: user.email,
          subject: '🚨 আপনার ট্রায়াল পিরিয়ড শীঘ্রই শেষ হবে!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">AlvaEcommerce</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">আপনার ই-কমার্স সমাধান</p>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-bottom: 20px;">প্রিয় ${user.name},</h2>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                  <h3 style="color: #856404; margin-top: 0;">⚠️ গুরুত্বপূর্ণ সতর্কবার্তা</h3>
                  <p style="color: #856404; margin-bottom: 0; font-size: 16px;">
                    আপনার ট্রায়াল পিরিয়ড আর মাত্র <strong>${daysRemaining} দিন</strong> বাকি আছে!
                  </p>
                </div>

                <p style="color: #333; line-height: 1.6; font-size: 16px;">
                  আপনার AlvaEcommerce ট্রায়াল অ্যাকাউন্টটি শীঘ্রই মেয়াদ শেষ হয়ে যাবে। 
                  নিরবচ্ছিন্ন সেবা পেতে এখনই আপনার সাবস্ক্রিপশন নবায়ন করুন।
                </p>

                <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h3 style="color: #333; margin-top: 0;">🎯 কেন এখনই নবায়ন করবেন?</h3>
                  <ul style="color: #555; line-height: 1.8;">
                    <li>✅ সম্পূর্ণ ই-কমার্স সমাধান</li>
                    <li>✅ অসীমিত পণ্য আপলোড</li>
                    <li>✅ ২৪/৭ কাস্টমার সাপোর্ট</li>
                    <li>✅ নিরাপদ পেমেন্ট গেটওয়ে</li>
                    <li>✅ মোবাইল রেসপন্সিভ ডিজাইন</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:3000/dashboard/subscription" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            font-weight: bold;
                            font-size: 16px;
                            display: inline-block;">
                    🚀 এখনই নবায়ন করুন
                  </a>
                </div>

                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 25px;">
                  <p style="color: #1565c0; margin: 0; font-size: 14px; text-align: center;">
                    🎁 <strong>বিশেষ ছাড়:</strong> প্রথম মাসে ২০% ছাড় পাবেন!
                  </p>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  কোনো সহায়তার প্রয়োজন হলে আমাদের সাথে যোগাযোগ করুন: support@alvaecommerce.com
                </p>
              </div>
              
              <div style="background: #333; color: white; padding: 20px; text-align: center;">
                <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                  © 2024 AlvaEcommerce. সর্বস্বত্ব সংরক্ষিত।
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        sentEmails++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        failedEmails++;
      }
    }

    // Send emails to paid subscription users
    for (const user of expiringSubscriptions) {
      try {
        const daysRemaining = Math.ceil((new Date(user.subscriptionEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
        
        const mailOptions = {
          from: process.env.EMAIL_USER || 'noreply@alvaecommerce.com',
          to: user.email,
          subject: '⚠️ আপনার সাবস্ক্রিপশন শীঘ্রই শেষ হবে!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">AlvaEcommerce</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">আপনার ই-কমার্স সমাধান</p>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-bottom: 20px;">প্রিয় ${user.name},</h2>
                
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                  <h3 style="color: #721c24; margin-top: 0;">🚨 সাবস্ক্রিপশন নবায়ন প্রয়োজন</h3>
                  <p style="color: #721c24; margin-bottom: 0; font-size: 16px;">
                    আপনার <strong>${user.subscriptionType}</strong> সাবস্ক্রিপশন আর মাত্র <strong>${daysRemaining} দিন</strong> বাকি আছে!
                  </p>
                </div>

                <p style="color: #333; line-height: 1.6; font-size: 16px;">
                  আপনার AlvaEcommerce সাবস্ক্রিপশন শীঘ্রই মেয়াদ শেষ হয়ে যাবে। 
                  আপনার ব্যবসার ধারাবাহিকতা বজায় রাখতে এখনই নবায়ন করুন।
                </p>

                <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h3 style="color: #333; margin-top: 0;">💼 আপনার সাবস্ক্রিপশন তথ্য</h3>
                  <ul style="color: #555; line-height: 1.8; list-style: none; padding: 0;">
                    <li>📦 <strong>প্ল্যান:</strong> ${user.subscriptionType}</li>
                    <li>📅 <strong>মেয়াদ শেষ:</strong> ${new Date(user.subscriptionEndsAt).toLocaleDateString('bn-BD')}</li>
                    <li>⏰ <strong>বাকি সময়:</strong> ${daysRemaining} দিন</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:3000/dashboard/subscription" 
                     style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                            color: white; 
                            padding: 15px 30px; 
                            text-decoration: none; 
                            border-radius: 25px; 
                            font-weight: bold;
                            font-size: 16px;
                            display: inline-block;">
                    💳 সাবস্ক্রিপশন নবায়ন করুন
                  </a>
                </div>

                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-top: 25px;">
                  <p style="color: #856404; margin: 0; font-size: 14px; text-align: center;">
                    ⚠️ <strong>গুরুত্বপূর্ণ:</strong> মেয়াদ শেষ হলে আপনার সাইট বন্ধ হয়ে যাবে!
                  </p>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  কোনো সহায়তার প্রয়োজন হলে আমাদের সাথে যোগাযোগ করুন: support@alvaecommerce.com
                </p>
              </div>
              
              <div style="background: #333; color: white; padding: 20px; text-align: center;">
                <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                  © 2024 AlvaEcommerce. সর্বস্বত্ব সংরক্ষিত।
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        sentEmails++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        failedEmails++;
      }
    }

    res.json({
      message: 'নোটিফিকেশন পাঠানো হয়েছে',
      sent: sentEmails,
      failed: failedEmails,
      total: expiringTrials.length + expiringSubscriptions.length
    });

  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'নোটিফিকেশন পাঠাতে সমস্যা হয়েছে', error: error.message });
  }
});

// Send custom notification to specific users
router.post('/send-custom', adminAuth, async (req, res) => {
  try {
    const { userIds, subject, message, type = 'info' } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ message: 'কমপক্ষে একজন ইউজার নির্বাচন করুন' });
    }

    if (!subject || !message) {
      return res.status(400).json({ message: 'বিষয় এবং বার্তা প্রয়োজন' });
    }

    const users = await User.findAll({
      where: {
        id: { [Op.in]: userIds }
      }
    });

    const transporter = createTransporter();
    let sentEmails = 0;
    let failedEmails = 0;

    for (const user of users) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER || 'noreply@alvaecommerce.com',
          to: user.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">AlvaEcommerce</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">আপনার ই-কমার্স সমাধান</p>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-bottom: 20px;">প্রিয় ${user.name},</h2>
                
                <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid ${type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#007bff'};">
                  <div style="white-space: pre-wrap; color: #333; line-height: 1.6; font-size: 16px;">${message}</div>
                </div>

                <div style="margin-top: 30px; text-align: center;">
                  <a href="http://localhost:3000/dashboard" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 12px 25px; 
                            text-decoration: none; 
                            border-radius: 20px; 
                            font-weight: bold;
                            font-size: 14px;
                            display: inline-block;">
                    ড্যাশবোর্ডে যান
                  </a>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  কোনো সহায়তার প্রয়োজন হলে আমাদের সাথে যোগাযোগ করুন: support@alvaecommerce.com
                </p>
              </div>
              
              <div style="background: #333; color: white; padding: 20px; text-align: center;">
                <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                  © 2024 AlvaEcommerce. সর্বস্বত্ব সংরক্ষিত।
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        sentEmails++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        failedEmails++;
      }
    }

    res.json({
      message: 'কাস্টম নোটিফিকেশন পাঠানো হয়েছে',
      sent: sentEmails,
      failed: failedEmails,
      total: users.length
    });

  } catch (error) {
    console.error('Send custom notification error:', error);
    res.status(500).json({ message: 'নোটিফিকেশন পাঠাতে সমস্যা হয়েছে', error: error.message });
  }
});

module.exports = router;
