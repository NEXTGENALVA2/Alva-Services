'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

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
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch dashboard stats
      const [statsResponse, expiringResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard/stats', { headers }),
        axios.get('http://localhost:5000/api/admin/users/expiring', { headers })
      ])

      setStats(statsResponse.data)
      setExpiringUsers(expiringResponse.data)
    } catch (error: any) {
      setError('ড্যাশবোর্ড ডেটা লোড করতে সমস্যা হয়েছে')
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'মেয়াদ শেষ'
    if (diffDays === 0) return 'আজ শেষ'
    if (diffDays === 1) return '১ দিন বাকি'
    return `${diffDays} দিন বাকি`
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">স্বাগতম, অ্যাডমিন!</h2>
        <p className="mt-1 text-sm text-gray-600">
          আজকের তারিখ: {new Date().toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">মোট ইউজার</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats?.totalUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600">আজকে নতুন: {stats?.usersToday || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">সক্রিয় ইউজার</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats?.activeUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="text-gray-600">মোট ইউজারের {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">ট্রায়াল ইউজার</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats?.trialUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="text-gray-600">বিনামূল্যে পরীক্ষা করছে</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">পেইড ইউজার</dt>
                  <dd className="text-lg font-semibold text-gray-900">{stats?.paidUsers || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <div className="text-sm">
              <span className="text-gray-600">সাবস্ক্রিপশন কিনেছে</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {stats && stats.expiringTotal > 0 && (
        <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                সতর্কতা: {stats.expiringTotal}টি সাবস্ক্রিপশন শীঘ্রই শেষ হবে
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {stats.expiringTrials} ট্রায়াল এবং {stats.expiringSubscriptions} পেইড সাবস্ক্রিপশন পরবর্তী ৩ দিনে শেষ হবে।
                  এই ইউজারদের নোটিফিকেশন পাঠাতে ভুলবেন না!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expiring Users Section */}
      {expiringUsers && expiringUsers.total > 0 && (
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              শীঘ্রই মেয়াদ শেষ হবে ({expiringUsers.total})
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              পরবর্তী ৩ দিনে যাদের সাবস্ক্রিপশন শেষ হবে
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {expiringUsers.expiringTrials.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    ট্রায়াল ইউজার ({expiringUsers.expiringTrials.length})
                  </h4>
                  <div className="space-y-2">
                    {expiringUsers.expiringTrials.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {user.trialEndsAt && formatDate(user.trialEndsAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expiringUsers.expiringSubscriptions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    পেইড সাবস্ক্রিপশন ({expiringUsers.expiringSubscriptions.length})
                  </h4>
                  <div className="space-y-2">
                    {expiringUsers.expiringSubscriptions.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.subscriptionType}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {user.subscriptionEndsAt && formatDate(user.subscriptionEndsAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {expiringUsers.total > 10 && (
              <div className="mt-4 text-center">
                <a
                  href="/admin/dashboard/notifications"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  সব দেখুন ({expiringUsers.total - 10} আরো)
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/dashboard/users"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">ইউজার ম্যানেজমেন্ট</h3>
              <p className="text-sm text-gray-600">সব ইউজার দেখুন ও পরিচালনা করুন</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/dashboard/subscriptions"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">সাবস্ক্রিপশন</h3>
              <p className="text-sm text-gray-600">সাবস্ক্রিপশন ও পেমেন্ট ট্র্যাক করুন</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/dashboard/notifications"
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.462A17.848 17.848 0 003 12c0-9.941 8.059-18 18-18s18 8.059 18 18c0 2.506-.512 4.894-1.437 7.077" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">নোটিফিকেশন</h3>
              <p className="text-sm text-gray-600">ইউজারদের নোটিফিকেশন পাঠান</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
