'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  subscriptionType: string
  isActive: boolean
  createdAt: string
  trialEndsAt?: string
  subscriptionEndsAt?: string
  daysRemaining: number
  subscriptionStatus: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalUsers: number
  hasNext: boolean
  hasPrev: boolean
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [currentPage, search, subscriptionFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search,
        subscriptionType: subscriptionFilter,
        status: statusFilter
      })

      const response = await axios.get(`http://localhost:5000/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (error: any) {
      setError('ইউজার ডেটা লোড করতে সমস্যা হয়েছে')
      console.error('Users fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken')
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/status`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ))
    } catch (error: any) {
      alert('ইউজার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে')
      console.error('Update user status error:', error)
    }
  }

  const manageTrial = async (userId: string, action: 'activate' | 'deactivate', days: number = 3) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.put(`http://localhost:5000/api/admin/users/${userId}/trial`, 
        { action, days },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...response.data.user } : user
      ))
      
      alert(response.data.message)
      
    } catch (error: any) {
      alert('ট্রায়াল ম্যানেজমেন্ট করতে সমস্যা হয়েছে')
      console.error('Trial management error:', error)
    }
  }

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">নিষ্ক্রিয়</span>
    }

    if (user.subscriptionStatus === 'expired') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">মেয়াদ শেষ</span>
    }

    if (user.subscriptionType === 'trial') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">ট্রায়াল</span>
    }

    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">সক্রিয়</span>
  }

  const getSubscriptionBadge = (subscriptionType: string) => {
    const colors = {
      trial: 'bg-yellow-100 text-yellow-800',
      monthly: 'bg-blue-100 text-blue-800',
      '6month': 'bg-purple-100 text-purple-800',
      yearly: 'bg-green-100 text-green-800'
    }

    const labels = {
      trial: 'ট্রায়াল',
      monthly: 'মাসিক',
      '6month': '৬ মাস',
      yearly: 'বার্ষিক'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[subscriptionType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[subscriptionType as keyof typeof labels] || subscriptionType}
      </span>
    )
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ইউজার ম্যানেজমেন্ট</h2>
          <p className="text-sm text-gray-600">সব ইউজার দেখুন এবং পরিচালনা করুন</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">অনুসন্ধান</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="নাম বা ইমেইল দিয়ে খুঁজুন"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">সাবস্ক্রিপশন</label>
            <select
              value={subscriptionFilter}
              onChange={(e) => {
                setSubscriptionFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">সব ধরনের</option>
              <option value="trial">ট্রায়াল</option>
              <option value="monthly">মাসিক</option>
              <option value="6month">৬ মাস</option>
              <option value="yearly">বার্ষিক</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">সব স্ট্যাটাস</option>
              <option value="active">সক্রিয়</option>
              <option value="inactive">নিষ্ক্রিয়</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('')
                setSubscriptionFilter('')
                setStatusFilter('')
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
            >
              রিসেট
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ইউজার
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  সাবস্ক্রিপশন
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  বাকি সময়
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  রেজিস্ট্রেশন
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={!user.isActive ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSubscriptionBadge(user.subscriptionType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.subscriptionStatus === 'active' ? (
                      <span className="text-green-600 font-medium">
                        {user.daysRemaining} দিন
                      </span>
                    ) : (
                      <span className="text-red-600">মেয়াদ শেষ</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-1">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className={`px-3 py-1 text-xs rounded-md font-medium ${
                          user.isActive
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'নিষ্ক্রিয়' : 'সক্রিয়'} করুন
                      </button>
                      
                      {/* Trial Management Buttons */}
                      {user.subscriptionType === 'trial' && (
                        <>
                          <button
                            onClick={() => manageTrial(user.id, 'activate', 3)}
                            className="px-3 py-1 text-xs rounded-md font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            title="৩ দিনের ট্রায়াল চালু করুন"
                          >
                            ট্রায়াল চালু
                          </button>
                          <button
                            onClick={() => manageTrial(user.id, 'deactivate')}
                            className="px-3 py-1 text-xs rounded-md font-medium bg-orange-100 text-orange-800 hover:bg-orange-200"
                            title="ট্রায়াল বন্ধ করুন - ইউজার রিনিউ অপশন দেখবে"
                          >
                            ট্রায়াল বন্ধ
                          </button>
                        </>
                      )}
                      
                      {user.subscriptionType !== 'trial' && (
                        <button
                          onClick={() => manageTrial(user.id, 'activate', 3)}
                          className="px-3 py-1 text-xs rounded-md font-medium bg-purple-100 text-purple-800 hover:bg-purple-200"
                          title="৩ দিনের ট্রায়াল দিন"
                        >
                          ট্রায়াল দিন
                        </button>
                      )}
                      
                      <a
                        href={`/admin/dashboard/users/${user.id}`}
                        className="px-3 py-1 text-xs rounded-md font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        বিস্তারিত
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">কোনো ইউজার পাওয়া যায়নি</h3>
            <p className="mt-1 text-sm text-gray-500">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg border">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              আগের পাতা
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              পরের পাতা
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">{pagination.totalUsers}</span> জন ইউজারের মধ্যে{' '}
                <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> থেকে{' '}
                <span className="font-medium">{Math.min(currentPage * 10, pagination.totalUsers)}</span> দেখানো হচ্ছে
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  আগের পাতা
                </button>
                
                {/* Page numbers */}
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1
                  const isCurrentPage = pageNum === currentPage
                  
                  if (
                    pageNum === 1 || 
                    pageNum === pagination.totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  }
                  
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )
                  }
                  
                  return null
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  পরের পাতা
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
