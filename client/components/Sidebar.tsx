import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, X } from 'lucide-react';
import { Badge } from './ui/badge';
import axios from 'axios';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  navigation: NavigationItem[];
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, navigation }: SidebarProps) {
  const pathname = usePathname();
  const [isUserActive, setIsUserActive] = useState(true);

  useEffect(() => {
    checkUserStatus();
    
    // Listen for user status updates
    const handleUserStatusUpdate = () => {
      console.log('Sidebar: Received userStatusUpdated event');
      checkUserStatus();
    };
    
    window.addEventListener('userStatusUpdated', handleUserStatusUpdate);
    
    return () => {
      window.removeEventListener('userStatusUpdated', handleUserStatusUpdate);
    };
  }, []);

  const checkUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Sidebar: Checking user status...');

      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Sidebar: User status response:', response.data);
      
      setIsUserActive(response.data.isActive);
    } catch (error) {
      console.error('Sidebar: Error checking user status:', error);
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-xl transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shadow-none lg:bg-white`}>
      {/* Mobile close button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EcomEasy</div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:flex items-center p-6 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EcomEasy</div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            // Allow subscription page always, disable others if user is inactive
            const isDisabled = !isUserActive && item.href !== '/dashboard/subscription';
            
            return (
              <li key={item.href}>
                {isDisabled ? (
                  <div className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-slate-400 cursor-not-allowed opacity-50`}>
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </div>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs opacity-50">
                        {item.badge}
                      </Badge>
                    )}
                    <div className="text-xs text-slate-400">🔒</div>
                  </div>
                ) : (
                  <Link 
                    href={item.href} 
                    className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after navigation
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 transition-transform duration-200 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                      {item.name}
                    </div>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
