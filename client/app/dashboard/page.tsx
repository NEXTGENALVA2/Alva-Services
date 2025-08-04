'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import axios from 'axios'

interface Analytics {
  totalProducts: number
  totalOrders: number
  monthlyOrders: number
  totalRevenue: number
  monthlyRevenue: number
  monthlyProfit: number
  recentOrders: any[]
  salesData: any[]
  topProducts: any[]
  lowStockProducts: any[]
}


export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [website, setWebsite] = useState<any>(null)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
    fetchWebsite();
  }, [])

  // ওয়েবসাইট ডিটেইলস আনার ফাংশন
  const fetchWebsite = async () => {
    try {
      const response = await axios.get('/api/website', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setWebsite(response.data);
      // Store website info in localStorage for Topbar access
      localStorage.setItem('website', JSON.stringify(response.data));
    } catch (error) {
      setWebsite(null);
      localStorage.removeItem('website');
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // ওয়েবসাইট তৈরি করার ফাংশন
  const handleCreateWebsite = async () => {
    const name = prompt('আপনার ওয়েবসাইটের নাম লিখুন:');
    if (!name || name.trim() === '') {
      alert('ওয়েবসাইটের নাম দিতে হবে!');
      return;
    }
    try {
      const response = await axios.post('/api/website/create',
        { name },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('ওয়েবসাইট সফলভাবে তৈরি হয়েছে!');
      fetchAnalytics();
      fetchWebsite();
    } catch (error) {
      alert('ওয়েবসাইট তৈরি করতে সমস্যা হয়েছে!');
    }
  }


  if (!mounted) {
    // Prevent SSR/client mismatch
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ওয়েবসাইট ডিটেইলস দেখান */}
        {website && (
          <div
            role="button"
            tabIndex={0}
            className="w-full text-left bg-green-50 border border-green-200 rounded-lg p-4 mb-6 hover:bg-green-100 focus:outline-none transition cursor-pointer"
            title="ওয়েবসাইট দেখুন"
            onClick={e => {
              // Prevent double open if link is clicked
              if ((e.target as HTMLElement).tagName === 'A') return;
              window.open(`http://localhost:3000/${website.domain}`, '_blank', 'noopener,noreferrer');
            }}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.open(`http://localhost:3000/${website.domain}`, '_blank', 'noopener,noreferrer'); }}
          >
            <h2 className="text-lg font-bold text-green-800 mb-1">আপনার ওয়েবসাইট</h2>
            <div className="text-green-900">নাম: {website.name}</div>
            <div className="text-green-900">ডোমেইন: {website.domain}</div>
            <div className="text-green-900">
              URL: <a
                href={`http://localhost:3000/${website.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-700 cursor-pointer"
                tabIndex={0}
                onClick={e => e.stopPropagation()}
              >
                {`http://localhost:3000/${website.domain}`}
              </a>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics?.totalProducts || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics?.totalOrders || 0}</p>
            <p className="text-sm text-gray-600">This month: {analytics?.monthlyOrders || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">৳{analytics?.totalRevenue || 0}</p>
            <p className="text-sm text-gray-600">This month: ৳{analytics?.monthlyRevenue || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Monthly Profit</h3>
            <p className="text-2xl font-bold text-green-600">৳{analytics?.monthlyProfit || 0}</p>
          </div>
        </div>

        {/* Welcome Message if no data */}
        {(!analytics || analytics.totalProducts === 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              স্বাগতম! আপনার ই-কমার্স যাত্রা শুরু করুন
            </h2>
            <p className="text-blue-700 mb-4">
              আপনার ওয়েবসাইট তৈরি করুন এবং প্রথম প্রোডাক্ট যোগ করুন
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={handleCreateWebsite}
            >
              ওয়েবসাইট তৈরি করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
