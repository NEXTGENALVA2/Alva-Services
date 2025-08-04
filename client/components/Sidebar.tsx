import React, { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, X } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  navigation: NavigationItem[];
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, navigation }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      {/* Mobile close button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <div className="text-2xl font-bold text-purple-700">EcomEasy</div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop header */}
      <div className="hidden lg:flex items-center p-4 border-b">
        <div className="text-2xl font-bold text-purple-700">EcomEasy</div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after navigation
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
