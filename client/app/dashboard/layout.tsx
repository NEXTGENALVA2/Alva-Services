'use client'

import React, { useState } from 'react'
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard },
    { name: 'প্রোডাক্ট', href: '/dashboard/products', icon: Package },
    { name: 'অর্ডার', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'অ্যানালিটিক্স', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'সেটিংস', href: '/dashboard/settings', icon: Settings },
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
