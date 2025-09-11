'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  trialUsers: number
  paidUsers: number
  usersToday: number
  expiringTrials: number
  expiringSubscriptions: number
  expiringTotal: number
}

interface ExpiringUser {
  id: string
  name: string
  email: string
  subscriptionType: string
  trialEndsAt?: string
  subscriptionEndsAt?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [expiringUsers, setExpiringUsers] = useState<{
    expiringTrials: ExpiringUser[]
    expiringSubscriptions: ExpiringUser[]
  }>({ expiringTrials: [], expiringSubscriptions: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        if (!token) {
          window.location.href = '/admin'
          return
        }

        // Fetch dashboard stats
        const statsResponse = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setStats(statsResponse.data)

        // Fetch expiring users
        const expiringResponse = await axios.get('http://localhost:5000/api/admin/dashboard/expiring-users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setExpiringUsers(expiringResponse.data)

      } catch (error: any) {
        console.error('Error fetching admin data:', error)
        setError('ডেটা লোড করতে সমস্যা হয়েছে')
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken')
          window.location.href = '/admin'
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    window.location.href = '/admin'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>আবার চেষ্টা করুন</Button>
          </CardContent>
        </Card>
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
              <h1 className="text-3xl font-bold text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h1>
              <p className="text-gray-600">সিস্টেম ওভারভিউ এবং ব্যবস্থাপনা</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" asChild>
                <a href="/admin/dashboard/users">ইউজার ম্যানেজমেন্ট</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/dashboard/notifications">নোটিফিকেশন</a>
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                লগআউট
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট ইউজার</CardTitle>
              <div className="h-4 w-4 text-blue-600">👥</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">রেজিস্টার্ড ইউজার</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">সক্রিয় ইউজার</CardTitle>
              <div className="h-4 w-4 text-green-600">✅</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">একটিভ ইউজার</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ট্রায়াল ইউজার</CardTitle>
              <div className="h-4 w-4 text-yellow-600">🔄</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.trialUsers || 0}</div>
              <p className="text-xs text-muted-foreground">ফ্রি ট্রায়ালে</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">পেইড ইউজার</CardTitle>
              <div className="h-4 w-4 text-purple-600">💎</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.paidUsers || 0}</div>
              <p className="text-xs text-muted-foreground">সাবস্ক্রিপশন একটিভ</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">আজকের তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.usersToday || 0}</div>
              <p className="text-sm text-gray-600">নতুন রেজিস্ট্রেশন</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">মেয়াদ শেষ হচ্ছে</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats?.expiringTotal || 0}</div>
              <p className="text-sm text-gray-600">আগামী ৭ দিনে</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ট্রায়াল শেষ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats?.expiringTrials || 0}</div>
              <p className="text-sm text-gray-600">ট্রায়াল মেয়াদ শেষ</p>
            </CardContent>
          </Card>
        </div>

        {/* Expiring Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Expiring Trials */}
          <Card>
            <CardHeader>
              <CardTitle>ট্রায়াল মেয়াদ শেষ হচ্ছে</CardTitle>
              <CardDescription>
                আগামী ৭ দিনে ট্রায়াল শেষ হবে
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiringUsers.expiringTrials.length === 0 ? (
                <p className="text-center text-gray-500 py-4">কোনো ট্রায়াল মেয়াদ শেষ হচ্ছে না</p>
              ) : (
                <div className="space-y-3">
                  {expiringUsers.expiringTrials.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">ট্রায়াল</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('bn-BD') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiring Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle>সাবস্ক্রিপশন মেয়াদ শেষ হচ্ছে</CardTitle>
              <CardDescription>
                আগামী ৭ দিনে সাবস্ক্রিপশন শেষ হবে
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiringUsers.expiringSubscriptions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">কোনো সাবস্ক্রিপশন মেয়াদ শেষ হচ্ছে না</p>
              ) : (
                <div className="space-y-3">
                  {expiringUsers.expiringSubscriptions.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">{user.subscriptionType}</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt).toLocaleDateString('bn-BD') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>দ্রুত অ্যাকশন</CardTitle>
            <CardDescription>
              সাধারণ অ্যাডমিন কাজগুলো দ্রুত করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-20 flex flex-col space-y-2" asChild>
                <a href="/admin/dashboard/users">
                  <span className="text-lg">👥</span>
                  <span>ইউজার ম্যানেজমেন্ট</span>
                </a>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/admin/dashboard/notifications">
                  <span className="text-lg">🔔</span>
                  <span>নোটিফিকেশন পাঠান</span>
                </a>
              </Button>
              
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/admin/dashboard/reports">
                  <span className="text-lg">📊</span>
                  <span>রিপোর্ট দেখুন</span>
                </a>
              </Button>

              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/admin/dashboard/settings">
                  <span className="text-lg">⚙️</span>
                  <span>সিস্টেম সেটিংস</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
