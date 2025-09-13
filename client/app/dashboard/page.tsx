'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import axios from 'axios'
import { getDomain } from '../../lib/domain'
import { useRegion } from '@/components/RegionContext'
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"

// Define Analytics interface
interface Analytics {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyProfit: number;
  monthlyOrders?: number;
  monthlyRevenue?: number;
}

interface Website {
  id: number;
  name: string;
  domain: string;
  url: string;
}

export default function Dashboard() {
  const { formatPrice, t, currentLanguage } = useRegion()
  
  console.log('Dashboard current language:', currentLanguage)
  
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [domain, setDomain] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [website, setWebsite] = useState<Website | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [websiteName, setWebsiteName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        
        // Get domain first to check if user has website
        const domainData = await getDomain()
        console.log('Domain data:', domainData)
        
        if (!domainData?.domain) {
          // No domain found, user needs to create website
          setShowCreateModal(true)
          setLoading(false)
          return
        }

        // User has domain, try to get full website details
        try {
          const websiteRes = await axios.get('http://localhost:5000/api/website', {
            headers: { Authorization: `Bearer ${token}` }
          })
          setWebsite(websiteRes.data)
          console.log('Website found:', websiteRes.data)
        } catch (websiteError: any) {
          console.error('Website API error:', websiteError.response?.data || websiteError.message)
          // Even if website API fails, continue with domain data
          setWebsite({ 
            id: 0, 
            domain: domainData.domain, 
            name: 'Your Website',
            url: `http://localhost:3000/${domainData.domain}`
          })
        }

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

        // Set domain from previously fetched data
        setDomain(domainData?.domain || '')
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const createWebsite = async () => {
    if (!websiteName.trim()) {
  alert(t('fillAllFields'))
      return
    }

    setIsCreating(true)
    try {
      const token = localStorage.getItem('token')
      console.log('=== Website Creation Debug ===')
      console.log('Creating website with name:', websiteName)
      console.log('Token exists:', !!token)
      console.log('Token value:', token?.substring(0, 20) + '...')
      
      // Test server connectivity first
      console.log('Testing server connectivity...')
      const healthCheck = await fetch('http://localhost:5000/api/website', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Health check status:', healthCheck.status)
      
      const response = await axios.post('http://localhost:5000/api/website/create', {
        name: websiteName,
        theme: 'default'
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })
      
      console.log('Website creation response:', response.data)
      setWebsite(response.data.website)
      setShowCreateModal(false)
      setWebsiteName('')
      
      // Show success message
  alert(t('orderSuccess'))
      
      // Refresh the page to load analytics
      window.location.reload()
    } catch (error: any) {
      console.error('=== Website Creation Error ===')
      console.error('Error:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      if (error.code === 'ECONNREFUSED') {
  alert(t('serverConnectionError'))
      } else if (error.response?.status === 401) {
  alert(t('sessionExpired'))
        localStorage.removeItem('token')
        window.location.href = '/auth/login'
      } else if (error.response?.status === 400) {
  alert(error.response.data.message || t('websiteCreateError'))
      } else {
  alert(t('websiteCreateError'))
      }
    } finally {
      setIsCreating(false)
    }
  }

  if (showCreateModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">🌟 {t('createWebsite')}</CardTitle>
            <CardDescription className="text-center">
              {t('createWebsiteDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="websiteName">{t('websiteName')}</Label>
              <Input
                id="websiteName"
                type="text"
                placeholder={t('websiteNamePlaceholder')}
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={createWebsite} 
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? t('creating') : `🚀 ${t('createWebsite')}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
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
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
              <p className="text-gray-600">{t('dashboardDesc')}</p>
            </div>
            <div className="flex space-x-3">
              {website && (
                <Button variant="outline" asChild>
                  <a href={`https://${website.domain}.yourplatform.com`} target="_blank">{t('viewWebsite')}</a>
                </Button>
              )}
              <Button asChild>
                <a href="/dashboard/products">{t('addProduct')}</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Website Info */}
        {website && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">🌐 {website.name}</CardTitle>
                  <CardDescription>
                    {t('websiteSuccess')}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✅ সক্রিয়
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ওয়েবসাইট ঠিকানা:</p>
                  <p className="text-sm text-gray-600">{t('websiteAddress')}</p>
                  <p className="font-medium text-blue-600">{website.domain}.yourplatform.com</p>
                </div>
                <Button asChild>
                  <a href={`https://${website.domain}.yourplatform.com`} target="_blank">
                    🚀 {t('viewWebsite')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalProducts')}</CardTitle>
              <div className="h-4 w-4 text-blue-600">📦</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">সক্রিয় প্রোডাক্ট</p>
              <p className="text-xs text-muted-foreground">{t('activeProducts')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalOrders')}</CardTitle>
              <div className="h-4 w-4 text-green-600">🛒</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">সম্পূর্ণ অর্ডার</p>
              <p className="text-xs text-muted-foreground">{t('completedOrders')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
              <div className="h-4 w-4 text-yellow-600">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(analytics?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">সর্বমোট বিক্রয়</p>
              <p className="text-xs text-muted-foreground">{t('totalSales')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মাসিক লাভ</CardTitle>
            <CardTitle className="text-sm font-medium">{t('monthlyProfit')}</CardTitle>
              <div className="h-4 w-4 text-purple-600">📈</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(analytics?.monthlyProfit || 0)}</div>
              <p className="text-xs text-muted-foreground">এই মাসের লাভ</p>
              <p className="text-xs text-muted-foreground">{t('thisMonthProfit')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('recentOrders')}</CardTitle>
            <CardDescription>
              {t('recentOrdersDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">কোনো অর্ডার পাওয়া যায়নি</p>
                <p className="text-gray-500">{t('noOrdersFound')}</p>
                <Button className="mt-4" asChild>
                  <a href="/dashboard/products">{t('addFirstProduct')}</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">অর্ডার #{order.id}</p>
                        <p className="font-medium">{t('order')} #{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status === 'completed' ? t('completed') : t('processing')}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <a href="/dashboard/orders">সব অর্ডার দেখুন</a>
                    <a href="/dashboard/orders">{t('viewAllOrders')}</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
            <CardDescription>
              {t('quickActionsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col space-y-2" asChild>
                <a href="/dashboard/products">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg">📦</span>
                    <span>{t('addProduct')}</span>
                  </div>
                </a>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/dashboard/orders">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg">🛒</span>
                    <span>{t('viewOrders')}</span>
                  </div>
                </a>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/dashboard/settings">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg">⚙️</span>
                    <span>{t('settings')}</span>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
