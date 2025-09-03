'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

interface ExpiringUser {
  id: string
  name: string
  email: string
  subscriptionType: string
  trialEndsAt?: string
  subscriptionEndsAt?: string
}

interface NotificationResult {
  message: string
  sent: number
  failed: number
  total: number
}

export default function NotificationsPage() {
  const [expiringUsers, setExpiringUsers] = useState<{
    expiringTrials: ExpiringUser[]
    expiringSubscriptions: ExpiringUser[]
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<NotificationResult | null>(null)

  // Custom notification
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customSubject, setCustomSubject] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [customType, setCustomType] = useState('info')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  useEffect(() => {
    fetchExpiringUsers()
  }, [])

  const fetchExpiringUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get('http://localhost:5000/api/admin/users/expiring', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setExpiringUsers(response.data)
    } catch (error: any) {
      setError('ডেটা লোড করতে সমস্যা হয়েছে')
      console.error('Expiring users fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendExpiryReminders = async () => {
    if (!expiringUsers || expiringUsers.total === 0) {
      alert('কোনো ইউজার পাওয়া যায়নি যাদের সাবস্ক্রিপশন শীঘ্রই শেষ হবে')
      return
    }

    if (!confirm(`${expiringUsers.total} জন ইউজারকে নোটিফিকেশন পাঠাতে চান?`)) {
      return
    }

    setSending(true)
    setResult(null)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.post('http://localhost:5000/api/notifications/send-expiry-reminders', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResult(response.data)
    } catch (error: any) {
      setError('নোটিফিকেশন পাঠাতে সমস্যা হয়েছে')
      console.error('Send notifications error:', error)
    } finally {
      setSending(false)
    }
  }

  const sendCustomNotification = async () => {
    if (!customSubject.trim() || !customMessage.trim()) {
      alert('বিষয় এবং বার্তা লিখুন')
      return
    }

    if (selectedUsers.length === 0) {
      alert('কমপক্ষে একজন ইউজার নির্বাচন করুন')
      return
    }

    if (!confirm(`${selectedUsers.length} জন ইউজারকে কাস্টম নোটিফিকেশন পাঠাতে চান?`)) {
      return
    }

    setSending(true)
    setResult(null)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.post('http://localhost:5000/api/notifications/send-custom', {
        userIds: selectedUsers,
        subject: customSubject,
        message: customMessage,
        type: customType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setResult(response.data)
      setShowCustomForm(false)
      setCustomSubject('')
      setCustomMessage('')
      setSelectedUsers([])
    } catch (error: any) {
      setError('কাস্টম নোটিফিকেশন পাঠাতে সমস্যা হয়েছে')
      console.error('Send custom notification error:', error)
    } finally {
      setSending(false)
    }
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

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllExpiring = () => {
    if (!expiringUsers) return
    
    const allIds = [
      ...expiringUsers.expiringTrials.map(u => u.id),
      ...expiringUsers.expiringSubscriptions.map(u => u.id)
    ]
    
    setSelectedUsers(allIds)
  }

  if (loading) {
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
          <h2 className="text-2xl font-bold text-gray-900">নোটিফিকেশন সেন্টার</h2>
          <p className="text-sm text-gray-600">ইউজারদের নোটিফিকেশন পাঠান</p>
        </div>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium"
        >
          কাস্টম নোটিফিকেশন
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h3 className="font-medium">{result.message}</h3>
          <p className="mt-1">পাঠানো হয়েছে: {result.sent} টি | ব্যর্থ: {result.failed} টি | মোট: {result.total} টি</p>
        </div>
      )}

      {/* Expiry Reminders Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                সাবস্ক্রিপশন মেয়াদ শেষের সতর্কতা
              </h3>
              <p className="text-sm text-gray-600">
                যাদের সাবস্ক্রিপশন পরবর্তী ৩ দিনে শেষ হবে তাদের স্বয়ংক্রিয় নোটিফিকেশন পাঠান
              </p>
            </div>
            <button
              onClick={sendExpiryReminders}
              disabled={sending || !expiringUsers || expiringUsers.total === 0}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>সতর্কতা পাঠান ({expiringUsers?.total || 0})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {expiringUsers && expiringUsers.total > 0 ? (
          <div className="p-6">
            <div className="space-y-6">
              {expiringUsers.expiringTrials.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    ট্রায়াল ইউজার ({expiringUsers.expiringTrials.length})
                  </h4>
                  <div className="space-y-2">
                    {expiringUsers.expiringTrials.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md border">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                          </div>
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
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    পেইড সাবস্ক্রিপশন ({expiringUsers.expiringSubscriptions.length})
                  </h4>
                  <div className="space-y-2">
                    {expiringUsers.expiringSubscriptions.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-red-50 rounded-md border">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.subscriptionType}
                            </span>
                          </div>
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

            {expiringUsers.total > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={selectAllExpiring}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  সব নির্বাচন করুন
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">সব ঠিক আছে!</h3>
            <p className="mt-1 text-sm text-gray-500">
              এই মুহূর্তে কোনো ইউজারের সাবস্ক্রিপশন পরবর্তী ৩ দিনে শেষ হবে না
            </p>
          </div>
        )}
      </div>

      {/* Custom Notification Form */}
      {showCustomForm && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">কাস্টম নোটিফিকেশন</h3>
            <p className="text-sm text-gray-600">নির্বাচিত ইউজারদের কাস্টম বার্তা পাঠান</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিষয়</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="ইমেইলের বিষয়"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ধরন</label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">তথ্য</option>
                  <option value="warning">সতর্কতা</option>
                  <option value="error">ত্রুটি</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">বার্তা</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={5}
                placeholder="আপনার বার্তা লিখুন..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                নির্বাচিত: {selectedUsers.length} জন ইউজার
              </p>
              <div className="space-x-3">
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
                >
                  বাতিল
                </button>
                <button
                  onClick={sendCustomNotification}
                  disabled={sending || !customSubject.trim() || !customMessage.trim() || selectedUsers.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'পাঠানো হচ্ছে...' : 'নোটিফিকেশন পাঠান'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">নোটিফিকেশন সিস্টেম সম্পর্কে</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>স্বয়ংক্রিয় সতর্কতা সিস্টেম প্রতিদিন যাদের সাবস্ক্রিপশন ৩ দিনে শেষ হবে তাদের ইমেইল পাঠায়</li>
                <li>কাস্টম নোটিফিকেশনের মাধ্যমে নির্বাচিত ইউজারদের বিশেষ বার্তা পাঠাতে পারেন</li>
                <li>সব ইমেইল HTML ফরম্যাটে পাঠানো হয় এবং ব্র্যান্ডেড টেমপ্লেট ব্যবহার করে</li>
                <li>ইমেইল পাঠানোর রেজাল্ট স্ট্যাটাস দেখে সফল/ব্যর্থতার পরিমাণ জানতে পারেন</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
