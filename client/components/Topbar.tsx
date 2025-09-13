import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, ExternalLink, Copy, LogOut, User } from 'lucide-react';
import { useCart } from './CartContext';
import dynamic from 'next/dynamic';
import { getDomain } from '../lib/domain';
import CountryRegionSelector from './CountryRegionSelector';

interface TopbarProps {
  setSidebarOpen?: (open: boolean) => void;
}

export default function Topbar({ setSidebarOpen }: TopbarProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    window.addEventListener('domainUpdated', fetchUrl);
    return () => window.removeEventListener('domainUpdated', fetchUrl);
  }, []);

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
        {mounted && websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            title="Visit your site"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm truncate max-w-32 lg:max-w-none">{websiteUrl}</span>
          </a>
        )}
        
        <button 
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={async () => {
            if (websiteUrl) {
              try {
                await navigator.clipboard.writeText(websiteUrl);
                alert('Website URL copied to clipboard!');
              } catch (err) {
                // Fallback for older browsers
                try {
                  const textArea = document.createElement('textarea');
                  textArea.value = websiteUrl;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('Website URL copied to clipboard!');
                } catch (fallbackErr) {
                  alert('Failed to copy URL. Please copy manually: ' + websiteUrl);
                }
              }
            } else {
              alert('No website URL available to copy.');
            }
          }}
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
        
        <button 
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          onClick={() => {
            if (websiteUrl) {
              window.open(websiteUrl, '_blank', 'noopener,noreferrer');
            } else {
              alert('No website found! Please create your website first.');
            }
          }}
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
