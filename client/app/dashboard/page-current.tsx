'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import axios from 'axios'
import { getDomain } from '../../lib/domain'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"

// Define Analytics interface
interface Analytics {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyProfit: number;
  monthlyOrders?: number;
  monthlyRevenue?: number;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [domain, setDomain] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        
        // Fetch analytics
        const analyticsRes = await axios.get('http://localhost:5000/api/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAnalytics(analyticsRes.data)

        // Fetch orders
        const ordersRes = await axios.get(`http://localhost:5000/api/orders?websiteId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setOrders(ordersRes.data)

        // Get domain
        const domainData = await getDomain()
        setDomain(domainData?.domain || '')
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
              <p className="text-gray-600">আপনার ব্যবসার সম্পূর্ণ তথ্য এক জায়গায়</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <a href={`/${domain}`} target="_blank">ওয়েবসাইট দেখুন</a>
              </Button>
              <Button asChild>
                <a href="/dashboard/products">প্রোডাক্ট যোগ করুন</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট প্রোডাক্ট</CardTitle>
              <div className="h-4 w-4 text-blue-600">📦</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">সক্রিয় প্রোডাক্ট</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট অর্ডার</CardTitle>
              <div className="h-4 w-4 text-green-600">🛒</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">সম্পূর্ণ অর্ডার</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট আয়</CardTitle>
              <div className="h-4 w-4 text-yellow-600">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{analytics?.totalRevenue || 0}</div>
              <p className="text-xs text-muted-foreground">সর্বমোট বিক্রয়</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মাসিক লাভ</CardTitle>
              <div className="h-4 w-4 text-purple-600">📈</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{analytics?.monthlyProfit || 0}</div>
              <p className="text-xs text-muted-foreground">এই মাসের লাভ</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
            <CardDescription>
              আপনার সাম্প্রতিক অর্ডারগুলির তালিকা
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">কোনো অর্ডার পাওয়া যায়নি</p>
                <Button className="mt-4" asChild>
                  <a href="/dashboard/products">প্রথম প্রোডাক্ট যোগ করুন</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">অর্ডার #{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">৳{order.totalAmount}</p>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status === 'completed' ? 'সম্পূর্ণ' : 'প্রক্রিয়াধীন'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <a href="/dashboard/orders">সব অর্ডার দেখুন</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>দ্রুত অ্যাকশন</CardTitle>
            <CardDescription>
              সাধারণ কাজগুলো দ্রুত করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col space-y-2" asChild>
                <a href="/dashboard/products">
                  <span className="text-lg">📦</span>
                  <span>প্রোডাক্ট যোগ করুন</span>
                </a>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/dashboard/orders">
                  <span className="text-lg">🛒</span>
                  <span>অর্ডার দেখুন</span>
                </a>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/dashboard/settings">
                  <span className="text-lg">⚙️</span>
                  <span>সেটিংস</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
