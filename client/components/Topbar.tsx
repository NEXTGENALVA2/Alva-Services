import React, { Dispatch, SetStateAction } from 'react';
import { Menu } from 'lucide-react';

interface TopbarProps {
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Topbar({ setSidebarOpen }: TopbarProps) {
  // Try to get website domain from localStorage (set by dashboard page)
  const handleWebsiteClick = () => {
    let websiteDomain = null;
    try {
      const website = JSON.parse(localStorage.getItem('website') || 'null');
      websiteDomain = website?.domain;
    } catch {}
    if (websiteDomain) {
      window.open(`http://localhost:3000/${websiteDomain}`, '_blank', 'noopener,noreferrer');
    } else {
      alert('No website found! Please create your website first.');
    }
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
        <button
          className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
          onClick={handleWebsiteClick}
        >
          Website
        </button>
        <button className="bg-purple-100 text-purple-700 px-4 py-1 rounded hover:bg-purple-200">Copy</button>
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">P</div>
      </div>
    </header>
  );
}
