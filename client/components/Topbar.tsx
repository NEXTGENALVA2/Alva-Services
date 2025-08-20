import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';
import { Menu } from 'lucide-react';
import dynamic from 'next/dynamic';

const LanguageCurrencySwitcher = dynamic(() => import('../app/components/LanguageCurrencySwitcher'), { ssr: false });

interface TopbarProps {
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Topbar({ setSidebarOpen }: TopbarProps) {
  const { cart } = useCart();
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get website info from localStorage (set by dashboard page)
    try {
      const website = JSON.parse(localStorage.getItem('website') || 'null');
      const websiteDomain = website?.domain;
      if (websiteDomain) {
  setWebsiteUrl(`http://localhost:3000/${websiteDomain}`);
      }
    } catch {}
  }, []);

  return (
    <header className="w-full h-16 bg-white border-b flex items-center px-6 justify-between">
  <div className="flex items-center gap-4">
        {/* Cart icon with count */}
        <div className="relative">
          <ShoppingCart className="w-6 h-6 text-gray-700" />
          {mounted && cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs">
              {cart.length}
            </span>
          )}
        </div>
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="text-xl font-bold text-purple-700 lg:hidden">EcomEasy</div>
      </div>
      
      <div className="flex items-center gap-4">
        <LanguageCurrencySwitcher />
        {mounted && websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 font-medium"
            title="Visit your site"
          >
            {websiteUrl}
          </a>
        )}
        <button className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700" onClick={() => {
          if (websiteUrl) {
            window.open(websiteUrl, '_blank', 'noopener,noreferrer');
          } else {
            alert('No website found! Please create your website first.');
          }
        }}>Website</button>
        <button className="bg-purple-100 text-purple-700 px-4 py-1 rounded hover:bg-purple-200">Copy</button>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">P</div>
      </div>
    </header>
  );
}
