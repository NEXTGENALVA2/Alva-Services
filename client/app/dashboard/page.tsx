'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  ExternalLink,
  Globe,
  Plus,
  Eye,
  ArrowUpRight,
  Sparkles,
  BarChart3
} from 'lucide-react'
import axios from 'axios'
import { getDomain } from '../../lib/domain'
import { Button } from '@/components/ui'

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
    createWebsite: currentLang === 'bn' ? 'ওয়েবসাইট তৈরি করুন' : 'Create Website',
    quickActions: currentLang === 'bn' ? 'দ্রুত কাজ' : 'Quick Actions',
    addProduct: currentLang === 'bn' ? 'প্রোডাক্ট যোগ করুন' : 'Add Product',
    viewOrders: currentLang === 'bn' ? 'অর্ডার দেখুন' : 'View Orders',
    viewAnalytics: currentLang === 'bn' ? 'অ্যানালিটিক্স দেখুন' : 'View Analytics',
    overview: currentLang === 'bn' ? 'সারসংক্ষেপ' : 'Overview'
  };
  
  return fallback[key] || key;
};
export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [website, setWebsite] = useState<any>(null)
  const [mounted, setMounted] = useState(false);
  const [domainData, setDomainData] = useState<any>({});

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
    fetchWebsite();
    fetchProducts();
    fetchDomainData();
  }, []);

  const fetchDomainData = async () => {
    try {
      const data = await getDomain();
      setDomainData(data);
    } catch (error) {
      console.error('Domain fetch error:', error);
    }
  };

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <div className="text-slate-600 font-medium">{t('loading')}</div>
      </div>
    );
  }

  const visibleProductsCount = products.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('dashboard')}</h1>
        <p className="text-slate-600">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Website Card */}
      {website && (
        <div
          role="button"
          tabIndex={0}
          className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-xl p-6 text-white cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          title={t('viewWebsite')}
          onClick={e => {
            if ((e.target as HTMLElement).tagName === 'A') return;
            const displayUrl = domainData.url || `http://localhost:3000/${website.domain}`;
            window.open(displayUrl, '_blank', 'noopener,noreferrer');
          }}
          onKeyDown={e => { 
            if (e.key === 'Enter' || e.key === ' ') {
              const displayUrl = domainData.url || `http://localhost:3000/${website.domain}`;
              window.open(displayUrl, '_blank', 'noopener,noreferrer');
            }
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white rounded-full blur-xl"></div>
          </div>
          
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">{t('yourWebsite')}</h2>
                </div>
                <div className="space-y-1 text-emerald-50">
                  <div className="text-sm">{t('name')}: <span className="font-medium text-white">{website.name}</span></div>
                  <div className="text-sm">{t('domain')}: <span className="font-medium text-white">{domainData.domain || website.domain}</span></div>
                  <div className="text-sm">
                    URL: <a
                      href={domainData.url || `http://localhost:3000/${website.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-white hover:text-emerald-100 transition-colors"
                      tabIndex={0}
                      onClick={e => e.stopPropagation()}
                    >
                      {domainData.url || `http://localhost:3000/${website.domain}`}
                    </a>
                  </div>
                </div>
              </div>
              <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{t('totalProducts')}</p>
              <p className="text-3xl font-bold text-slate-900">{visibleProductsCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{t('totalOrders')}</p>
              <p className="text-3xl font-bold text-slate-900">{analytics?.totalOrders || 0}</p>
              <p className="text-xs text-slate-500">{t('thisMonth')}: {analytics?.monthlyOrders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+2.5%</span>
            <span className="text-slate-500 ml-1">from last month</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{t('totalRevenue')}</p>
              <p className="text-3xl font-bold text-emerald-600">{t('currency')}{analytics?.totalRevenue || 0}</p>
              <p className="text-xs text-slate-500">{t('thisMonth')}: {t('currency')}{analytics?.monthlyRevenue || 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12.3%</span>
            <span className="text-slate-500 ml-1">from last month</span>
          </div>
        </div>

        {/* Monthly Profit */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{t('monthlyProfit')}</p>
              <p className="text-3xl font-bold text-violet-600">{t('currency')}{analytics?.monthlyProfit || 0}</p>
            </div>
            <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-violet-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8.7%</span>
            <span className="text-slate-500 ml-1">from last month</span>
          </div>
        </div>
      </div>



      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('quickActions')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="subtle" size="lg" className="flex items-center justify-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>{t('addProduct')}</span>
          </Button>
          <Button variant="subtle" size="lg" className="flex items-center justify-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>{t('viewOrders')}</span>
          </Button>
          <Button variant="subtle" size="lg" className="flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>{t('viewAnalytics')}</span>
          </Button>
        </div>
      </div>

      {/* Welcome Section */}
      {(!website || !analytics || analytics.totalProducts === 0) && (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-8">
          {/* Background decoration */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
          
          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {t('welcomeTitle')}
                  </h2>
                  <p className="text-slate-600 text-lg">
                    {!website ? 'প্রথমে আপনার ওয়েবসাইট তৈরি করুন' : t('welcomeDesc')}
                  </p>
                </div>
                <Button onClick={handleCreateWebsite} size="lg">
                  <Plus className="w-4 h-4" />
                  <span>{t('createWebsite')}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
