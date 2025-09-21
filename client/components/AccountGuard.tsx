'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import axios from 'axios'

interface AccountGuardProps {
  children: React.ReactNode
}

interface UserStatus {
  isActive: boolean
  subscriptionType: string
  hasValidSubscription: boolean
}

export default function AccountGuard({ children }: AccountGuardProps) {
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Pages that are always accessible (even when deactivated)
  const allowedPages = [
    '/dashboard/subscription',
    '/auth/login',
    '/auth/register'
  ]

  useEffect(() => {
    console.log('🚀 AccountGuard: Initializing with pathname:', pathname)
    checkUserStatus()
    
    // Set up polling to check user status every 3 seconds for debugging
    console.log('⏰ AccountGuard: Setting up 3-second polling interval')
    const interval = setInterval(() => {
      console.log('🔄 AccountGuard: Polling interval triggered - checking user status...')
      checkUserStatus()
    }, 3000)

    // Also check when window gains focus (user might have been activated in another tab)
    const handleFocus = () => {
      console.log('👁️ AccountGuard: Window focus detected - checking user status')
      checkUserStatus()
    }
    
    // Listen for custom user status update events
    const handleUserStatusUpdate = () => {
      console.log('📢 AccountGuard: Received userStatusUpdated event - checking user status')
      checkUserStatus()
    }
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('userStatusUpdated', handleUserStatusUpdate)
    console.log('👂 AccountGuard: Event listeners set up')
    
    return () => {
      console.log('🧹 AccountGuard: Cleaning up interval and event listeners')
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('userStatusUpdated', handleUserStatusUpdate)
    }
  }, [])

  const checkUserStatus = async () => {
    try {
      console.log('🔄 AccountGuard: Starting checkUserStatus...')
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('❌ AccountGuard: No token found, redirecting to login')
        router.push('/auth/login')
        return
      }

      console.log('📡 AccountGuard: Making API calls...')
      // Check user profile and subscription status
      const [profileResponse, subscriptionResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/subscription/current', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const profile = profileResponse.data
      const subscription = subscriptionResponse.data

      console.log('🔍 AccountGuard: API responses received!')
      console.log('👤 Profile:', profile)
      console.log('📋 Subscription:', subscription)
      console.log('✅ Is Active:', profile.isActive)
      console.log('🔑 Current Path:', pathname)
      console.log('🚪 Allowed Pages:', allowedPages)

      const userStatus = {
        isActive: profile.isActive,
        subscriptionType: subscription.subscriptionType || 'none',
        hasValidSubscription: subscription.isActive && (
          subscription.subscriptionType !== 'expired_trial' && 
          subscription.subscriptionType !== 'trial' || 
          (subscription.subscriptionType === 'trial' && subscription.isActive)
        )
      }

      console.log('🎯 AccountGuard: Setting user status:', userStatus)
      setUserStatus(userStatus)

      // If account is deactivated and not on allowed page, redirect to subscription
      if (!userStatus.isActive && pathname && !allowedPages.includes(pathname)) {
        console.log('🚨 AccountGuard: User inactive, redirecting to subscription page')
        router.push('/dashboard/subscription')
        return
      } else {
        console.log('✅ AccountGuard: User access granted')
      }

    } catch (error: any) {
      console.error('❌ AccountGuard: Error during status check:', error)
      if (error.response) {
        console.error('❌ AccountGuard: Response status:', error.response.status)
        console.error('❌ AccountGuard: Response data:', error.response.data)
      }
      if (error.response?.status === 401) {
        console.log('🔓 AccountGuard: Unauthorized, removing token and redirecting')
        localStorage.removeItem('token')
        router.push('/auth/login')
      }
    } finally {
      console.log('🏁 AccountGuard: Status check completed, setting loading to false')
      setLoading(false)
    }
  }

  // Show loading spinner while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">অ্যাকাউন্ট যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    )
  }

  // If user is deactivated and not on allowed page, show restriction message
  if (userStatus && !userStatus.isActive && pathname && !allowedPages.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            অ্যাকাউন্ট নিষ্ক্রিয় রয়েছে
          </h2>
          <p className="text-gray-600 mb-6">
            আপনার অ্যাকাউন্ট বর্তমানে নিষ্ক্রিয় অবস্থায় রয়েছে। ড্যাশবোর্ড এবং অন্যান্য ফিচার ব্যবহার করতে প্রথমে একটি সাবস্ক্রিপশন প্ল্যান নিন।
          </p>
          <button
            onClick={() => router.push('/dashboard/subscription')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            সাবস্ক্রিপশন প্ল্যান দেখুন
          </button>
        </div>
      </div>
    )
  }

  // Render children normally for active users or allowed pages
  return <>{children}</>
}