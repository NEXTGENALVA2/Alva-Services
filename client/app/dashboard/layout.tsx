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
  X,
  Palette
} from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import SubscriptionWarning from '../../components/SubscriptionWarning'
import { NotificationProvider, useNotification } from '../../contexts/NotificationContext'

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

function DashboardContent({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const { pendingOrdersCount } = useNotification()

  useEffect(() => {
    setMounted(true);
    // Check subscription status on mount
    setShowWarning(true)
    
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
    { name: mounted ? t('orders') : 'অর্ডার', href: '/dashboard/orders', icon: ShoppingCart, badge: pendingOrdersCount },
    { name: mounted ? t('analytics') : 'অ্যানালিটিক্স', href: '/dashboard/analytics', icon: BarChart3 },
    { name: mounted ? t('customization') : 'কাস্টমাইজেশন', href: '/dashboard/customization', icon: Palette },
    { name: mounted ? t('settings') : 'সেটিংস', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Subscription Warning Modal */}
      {showWarning && <SubscriptionWarning onClose={() => setShowWarning(false)} />}
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      <DashboardContent>{children}</DashboardContent>
    </NotificationProvider>
  )
}
