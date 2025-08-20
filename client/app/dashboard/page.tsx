'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import axios from 'axios'

// Define Analytics interface
interface Analytics {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyProfit: number;
  monthlyOrders?: number;
  monthlyRevenue?: number;
}

// Simple translation function
const t = (key: string): string => {
  if (typeof window === 'undefined') return key;
  
  const currentLang = localStorage.getItem('lang') || 'en';
  const translations = (window as any).translations;
  
  if (translations && translations[currentLang] && translations[currentLang][key]) {
    return translations[currentLang][key];
  }
  
  // Fallback translations
  const fallback: Record<string, string> = {
    dashboard: currentLang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
    loading: currentLang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...',
    totalProducts: currentLang === 'bn' ? 'মোট পণ্য' : 'Total Products',
    totalOrders: currentLang === 'bn' ? 'মোট অর্ডার' : 'Total Orders',
    totalRevenue: currentLang === 'bn' ? 'মোট আয়' : 'Total Revenue',
    monthlyProfit: currentLang === 'bn' ? 'মাসিক লাভ' : 'Monthly Profit',
    thisMonth: currentLang === 'bn' ? 'এই মাস' : 'This month',
    currency: currentLang === 'bn' ? '৳' : '$',
    yourWebsite: currentLang === 'bn' ? 'আপনার ওয়েবসাইট' : 'Your Website',
    name: currentLang === 'bn' ? 'নাম' : 'Name',
    domain: currentLang === 'bn' ? 'ডোমেইন' : 'Domain',
    viewWebsite: currentLang === 'bn' ? 'আপনার ওয়েবসাইট দেখতে ক্লিক করুন' : 'Click to view your website',
    welcomeTitle: currentLang === 'bn' ? 'EcomEasy তে স্বাগতম!' : 'Welcome to EcomEasy!',
    welcomeDesc: currentLang === 'bn' ? 'সেকেন্ডেই আপনার অনলাইন স্টোর তৈরি করুন' : 'Create your online store in seconds',
    createWebsite: currentLang === 'bn' ? 'ওয়েবসাইট তৈরি করুন' : 'Create Website'
  };
  
  return fallback[key] || key;
};
export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [website, setWebsite] = useState<any>(null)
  const [mounted, setMounted] = useState(false);

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
    fetchWebsite();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    }
  };

  const fetchWebsite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setWebsite(null);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/websites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Website fetch response:', response.data);
      setWebsite(response.data);
      localStorage.setItem('website', JSON.stringify(response.data));
    } catch (error: any) {
      console.log('Website fetch error:', error.response?.status, error.response?.data);
      if (error.response?.status === 404) {
        // User doesn't have a website yet
        setWebsite(null);
      } else {
        setWebsite(null);
      }
      localStorage.removeItem('website');
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWebsite = async () => {
    const name = prompt('আপনার ওয়েবসাইটের নাম লিখুন:');
    if (!name || name.trim() === '') {
      alert('ওয়েবসাইটের নাম দিতে হবে!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/websites/create',
        { name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Website created:', response.data);
      alert('ওয়েবসাইট সফলভাবে তৈরি হয়েছে!');
      
      // Refresh data
      await fetchWebsite();
      await fetchAnalytics();
    } catch (error: any) {
      console.error('Website creation error:', error.response?.data);
      if (error.response?.status === 400) {
        alert('আপনার ইতিমধ্যে একটি ওয়েবসাইট আছে! Page reload করুন।');
        // Force refresh website data
        await fetchWebsite();
      } else {
        alert('ওয়েবসাইট তৈরি করতে সমস্যা হয়েছে!');
      }
    }
  }

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  const visibleProductsCount = products.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {website && (
          <div
            role="button"
            tabIndex={0}
            className="w-full text-left bg-green-50 border border-green-200 rounded-lg p-4 mb-6 hover:bg-green-100 focus:outline-none transition cursor-pointer"
            title={t('viewWebsite')}
            onClick={e => {
              if ((e.target as HTMLElement).tagName === 'A') return;
              window.open(`http://localhost:3000/${website.domain}`, '_blank', 'noopener,noreferrer');
            }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.open(`http://localhost:3000/${website.domain}`, '_blank', 'noopener,noreferrer'); }}
          >
            <h2 className="text-lg font-bold text-green-800 mb-1">{t('yourWebsite')}</h2>
            <div className="text-green-900">{t('name')}: {website.name}</div>
            <div className="text-green-900">{t('domain')}: {website.domain}</div>
            <div className="text-green-900">
              URL: <a
                href={`http://localhost:3000/${website.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-700 cursor-pointer"
                tabIndex={0}
                onClick={e => e.stopPropagation()}
              >
                {`http://localhost:3000/${website.domain}`}
              </a>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('dashboard')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{t('totalProducts')}</h3>
            <p className="text-2xl font-bold text-gray-900">{visibleProductsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{t('totalOrders')}</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics?.totalOrders || 0}</p>
            <p className="text-sm text-gray-600">{t('thisMonth')}: {analytics?.monthlyOrders || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{t('totalRevenue')}</h3>
            <p className="text-2xl font-bold text-green-600">{t('currency')}{analytics?.totalRevenue || 0}</p>
            <p className="text-sm text-gray-600">{t('thisMonth')}: {t('currency')}{analytics?.monthlyRevenue || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{t('monthlyProfit')}</h3>
            <p className="text-2xl font-bold text-green-600">{t('currency')}{analytics?.monthlyProfit || 0}</p>
          </div>
        </div>
        {(!website || !analytics || analytics.totalProducts === 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              {t('welcomeTitle')}
            </h2>
            <p className="text-blue-700 mb-4">
              {!website ? 'প্রথমে আপনার ওয়েবসাইট তৈরি করুন' : t('welcomeDesc')}
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={handleCreateWebsite}
            >
              {t('createWebsite')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
