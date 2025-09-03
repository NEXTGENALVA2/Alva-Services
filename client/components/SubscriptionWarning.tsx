'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface SubscriptionWarningProps {
  onClose?: () => void
}

interface UserSubscription {
  subscriptionType: string
  subscriptionEndsAt?: string
  trialEndsAt?: string
  isActive: boolean
}

export default function SubscriptionWarning({ onClose }: SubscriptionWarningProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number>(0)
  const [showWarning, setShowWarning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get('http://localhost:5000/api/subscription/current', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = response.data
      setSubscription(data)

      // Check if user is deactivated by admin
      if (!data.isActive) {
        setShowWarning(true)
        setDaysRemaining(0)
        return
      }

      // Calculate days remaining
      const now = new Date()
      let endDate: Date | null = null

      if (data.subscriptionType === 'trial' && data.trialEndsAt) {
        endDate = new Date(data.trialEndsAt)
      } else if (data.subscriptionEndsAt) {
        endDate = new Date(data.subscriptionEndsAt)
      }

      if (endDate) {
        const diffTime = endDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setDaysRemaining(diffDays)

        // Show warning if less than or equal to 3 days remaining or expired
        if (diffDays <= 3) {
          setShowWarning(true)
        }
      }
    } catch (error: any) {
      // Check if it's a subscription expired error
      if (error.response?.status === 403 && error.response?.data?.subscriptionExpired) {
        setShowWarning(true)
        setDaysRemaining(0)
        setSubscription({
          subscriptionType: error.response.data.subscriptionType || 'trial',
          isActive: false,
          subscriptionEndsAt: undefined,
          trialEndsAt: undefined
        })
      }
      console.error('Subscription check error:', error)
    }
  }

  const handleRenewClick = () => {
    router.push('/dashboard/subscription')
    if (onClose) onClose()
  }

  const handleCloseWarning = () => {
    setShowWarning(false)
    if (onClose) onClose()
  }

  if (!showWarning || !subscription) return null

  const isExpired = daysRemaining <= 0 || !subscription.isActive
  const isTrial = subscription.subscriptionType === 'trial'
  const isAdminDeactivated = !subscription.isActive

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className={`px-6 py-4 rounded-t-lg ${
          isExpired 
            ? 'bg-red-600' 
            : daysRemaining <= 1 
              ? 'bg-red-500' 
              : 'bg-orange-500'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold">
                {isExpired ? 'সেবা বন্ধ!' : 'সতর্কতা!'}
              </h3>
            </div>
            {!isExpired && (
              <button
                onClick={handleCloseWarning}
                className="text-white hover:text-gray-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="text-center">
            {isExpired ? (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {isAdminDeactivated 
                      ? 'আপনার একাউন্ট বর্তমানে নিষ্ক্রিয় রয়েছে!'
                      : `আপনার ${isTrial ? 'ট্রায়াল পিরিয়ড' : 'সাবস্ক্রিপশন'} শেষ হয়ে গেছে!`
                    }
                  </h2>
                  <p className="text-gray-600">
                    {isAdminDeactivated 
                      ? 'আপনার সেবা বর্তমানে বন্ধ রয়েছে। সেবা চালু করতে এখনই সাবস্ক্রিপশন নিন।'
                      : 'আপনার সেবা বর্তমানে বন্ধ রয়েছে। সেবা চালু করতে এখনই নবায়ন করুন।'
                    }
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>গুরুত্বপূর্ণ:</strong> {isAdminDeactivated 
                      ? 'সাবস্ক্রিপশন না নেওয়া পর্যন্ত আপনার ওয়েবসাইট বন্ধ থাকবে এবং গ্রাহকরা অর্ডার করতে পারবেন না।'
                      : 'নবায়ন না করা পর্যন্ত আপনার ওয়েবসাইট বন্ধ থাকবে এবং গ্রাহকরা অর্ডার করতে পারবেন না।'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    আপনার {isTrial ? 'ট্রায়াল' : 'সাবস্ক্রিপশন'} শীঘ্রই শেষ হবে!
                  </h2>
                  <p className="text-gray-600">
                    আর মাত্র <span className="font-bold text-red-600">{daysRemaining} দিন</span> বাকি আছে।
                    সেবা অব্যাহত রাখতে এখনই নবায়ন করুন।
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">নবায়ন না করলে কী হবে?</h3>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    <li>আপনার ওয়েবসাইট বন্ধ হয়ে যাবে</li>
                    <li>গ্রাহকরা অর্ডার করতে পারবেন না</li>
                    <li>ড্যাশবোর্ড অ্যাক্সেস বন্ধ হবে</li>
                    <li>সব ডেটা সংরক্ষিত থাকবে</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleRenewClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium text-lg flex items-center justify-center space-x-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {isExpired ? 'এখনই নবায়ন করুন' : 'নবায়ন করুন'}
                </span>
              </button>

              {!isExpired && (
                <button
                  onClick={handleCloseWarning}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium"
                >
                  পরে মনে করিয়ে দিন
                </button>
              )}
            </div>
          </div>
        </div>

        {isTrial && !isExpired && (
          <div className="bg-blue-50 border-t border-blue-200 px-6 py-4 rounded-b-lg">
            <div className="flex items-center text-sm text-blue-800">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>বিশেষ ছাড়:</strong> প্রথম মাসে ২০% ছাড় পাবেন!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
