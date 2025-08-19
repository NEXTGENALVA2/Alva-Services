'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'

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
    products: currentLang === 'bn' ? 'পণ্য' : 'Products',
    orders: currentLang === 'bn' ? 'অর্ডার' : 'Orders',
    analytics: currentLang === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics',
    settings: currentLang === 'bn' ? 'সেটিংস' : 'Settings'
  };
  
  return fallback[key] || key;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
    // Listen for language changes
    const handleLanguageChange = () => {
      // Force re-render when language changes
      setMounted(false);
      setTimeout(() => setMounted(true), 0);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const navigation = [
    { name: mounted ? t('dashboard') : 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard },
    { name: mounted ? t('products') : 'প্রোডাক্ট', href: '/dashboard/products', icon: Package },
    { name: mounted ? t('orders') : 'অর্ডার', href: '/dashboard/orders', icon: ShoppingCart },
    { name: mounted ? t('analytics') : 'অ্যানালিটিক্স', href: '/dashboard/analytics', icon: BarChart3 },
    { name: mounted ? t('settings') : 'সেটিংস', href: '/dashboard/settings', icon: Settings },
    { name: mounted ? t('customization') : 'কাস্টমাইজেশন', href: '/dashboard/customization', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        navigation={navigation}
      />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
