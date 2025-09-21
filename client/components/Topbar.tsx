import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, ExternalLink, Copy, LogOut, User } from 'lucide-react';
import { useCart } from './CartContext';
import dynamic from 'next/dynamic';
import { getDomain } from '../lib/domain';
import CountryRegionSelector from './CountryRegionSelector';
import OrderNotificationSystem from './OrderNotificationSystem';
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

interface TopbarProps {
  setSidebarOpen?: (open: boolean) => void;
}

export default function Topbar({ setSidebarOpen }: TopbarProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const { refreshPendingOrders } = useNotification();

  // Use order notifications hook
  const { isPolling } = useOrderNotifications({
    onNewOrder: (order) => {
      console.log('New order received in topbar:', order)
      // Refresh pending orders count
      refreshPendingOrders()
    }
  });

  // Function to handle order confirmation
  const handleOrderConfirmation = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: 'confirmed'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Order confirmed:', orderId)
      // Refresh pending orders count after confirmation
      refreshPendingOrders()
    } catch (error) {
      console.error('Error confirming order:', error)
    }
  };

  useEffect(() => {
    setMounted(true);
    checkUserStatus();
    const fetchUrl = () => {
      getDomain().then((d) => {
        try {
          if (d?.url) {
            setWebsiteUrl(d.url);
          } else if (d?.domain) {
            setWebsiteUrl(`http://localhost:3000/${d.domain}`);
          }
        } catch {}
      }).catch(() => {
        try {
          const website = JSON.parse(localStorage.getItem('website') || 'null');
          if (website?.url) {
            setWebsiteUrl(website.url);
          } else if (website?.domain) {
            setWebsiteUrl(`http://localhost:3000/${website.domain}`);
          }
        } catch {}
      });
    };
    fetchUrl();
    
    // Listen for user status updates
    const handleUserStatusUpdate = () => {
      checkUserStatus();
    };
    
    window.addEventListener('domainUpdated', fetchUrl);
    window.addEventListener('userStatusUpdated', handleUserStatusUpdate);
    
    return () => {
      window.removeEventListener('domainUpdated', fetchUrl);
      window.removeEventListener('userStatusUpdated', handleUserStatusUpdate);
    };
  }, []);

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsUserActive(response.data.isActive);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleVisitWebsite = () => {
    if (!isUserActive) {
      alert('Your account is deactivated. Please contact support or upgrade your subscription.');
      return;
    }
    
    if (websiteUrl) {
      window.open(websiteUrl, '_blank');
    }
  };

  const handleCopyWebsiteUrl = () => {
    if (!isUserActive) {
      alert('Your account is deactivated. Please contact support or upgrade your subscription.');
      return;
    }
    
    if (websiteUrl) {
      navigator.clipboard.writeText(websiteUrl);
      alert('Website URL copied to clipboard!');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  return (
    <header className="w-full h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen?.(true)}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2 lg:hidden">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md"></div>
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EcomEasy</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Order Notifications */}
        <OrderNotificationSystem onConfirmOrder={handleOrderConfirmation} />
        
        {/* Live Status Indicator */}
        {isPolling && (
          <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-700">লাইভ</span>
          </div>
        )}
        
        {mounted && websiteUrl && (
          <button
            onClick={handleVisitWebsite}
            className={`hidden sm:flex items-center gap-2 font-medium transition-colors ${
              !isUserActive 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-700'
            }`}
            title={!isUserActive ? "Account deactivated" : "Visit your site"}
            disabled={!isUserActive}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm truncate max-w-32 lg:max-w-none">{websiteUrl}</span>
          </button>
        )}
        
        <button 
          className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            !isUserActive 
              ? 'text-gray-400 hover:text-gray-400 hover:bg-gray-50 cursor-not-allowed' 
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
          onClick={handleCopyWebsiteUrl}
          disabled={!isUserActive}
          title={!isUserActive ? "Account deactivated" : "Copy website URL"}
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
        
        <button 
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            !isUserActive 
              ? 'text-gray-400 bg-gray-50 hover:bg-gray-50 cursor-not-allowed' 
              : 'text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100'
          }`}
          onClick={handleVisitWebsite}
          disabled={!isUserActive}
          title={!isUserActive ? "Account deactivated" : "Visit your website"}
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">Website</span>
        </button>
        
        <button
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">লগআউট</span>
        </button>
        
        {/* Country/Region Selector */}
        <CountryRegionSelector />
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      </div>
    </header>
  );
}
