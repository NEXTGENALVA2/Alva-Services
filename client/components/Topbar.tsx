import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu } from 'lucide-react';
import { useCart } from './CartContext';
import dynamic from 'next/dynamic';
import { getDomain } from '../lib/domain';


export default function Topbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <header className="w-full h-16 bg-white border-b flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
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
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          onClick={handleLogout}
        >
          লগআউট
        </button>
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


  return (
    <header className="w-full h-16 bg-white border-b flex items-center px-6 justify-between">
  <div className="flex items-center gap-4">
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
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/auth/login';
          }}
        >
          লগআউট
        </button>
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
