'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface SubscriptionPlan {
  id: string
  name: string
  nameEn: string
  price: number
  duration: number
  features: string[]
  popular?: boolean
}

export default function SubscriptionPage() {
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [paymentPhone, setPaymentPhone] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const router = useRouter()

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'trial',
      name: '৩ দিন ট্রায়াল',
      nameEn: '3 Days Trial',
      price: 0,
      duration: 3,
      features: [
        'সীমাহীন পণ্য যোগ',
        'অর্ডার ম্যানেজমেন্ট',
        'বেসিক রিপোর্ট',
        'ইমেইল সাপোর্ট'
      ]
    },
    {
      id: 'monthly',
      name: 'মাসিক প্ল্যান',
      nameEn: 'Monthly Plan',
      price: 500,
      duration: 30,
      features: [
        'সীমাহীন পণ্য যোগ',
        'উন্নত অর্ডার ম্যানেজমেন্ট',
        'বিস্তারিত রিপোর্ট ও অ্যানালিটিক্স',
        'কাস্টম ডোমেইন',
        'প্রায়োরিটি সাপোর্ট',
        'SMS নোটিফিকেশন'
      ],
      popular: true
    },
    {
      id: '6month',
      name: '৬ মাস প্ল্যান',
      nameEn: '6 Months Plan',
      price: 2500,
      duration: 180,
      features: [
        'মাসিক প্ল্যানের সব সুবিধা',
        '৬ মাসে ১৭% ছাড়',
        'ফ্রি কাস্টমাইজেশন',
        'ডেডিকেটেড সাপোর্ট'
      ]
    },
    {
      id: 'yearly',
      name: 'বার্ষিক প্ল্যান',
      nameEn: 'Yearly Plan',
      price: 4500,
      duration: 365,
      features: [
        'মাসিক প্ল্যানের সব সুবিধা',
        'বছরে ২৫% ছাড়',
        'ফ্রি থিম কাস্টমাইজেশন',
        'প্রিমিয়াম সাপোর্ট',
        'মার্কেটিং টুলস'
      ]
    }
  ]

  useEffect(() => {
    fetchCurrentSubscription()
    fetchUserInfo()
    
    // Load debug script for user status checking
    const script = document.createElement('script');
    script.src = '/comprehensive-debug.js';
    document.head.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [])

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setUserInfo(response.data)
    } catch (error: any) {
      console.error('Fetch user info error:', error.response?.data)
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token found in localStorage')
        return
      }

      console.log('Token found:', token.substring(0, 20) + '...')
      const response = await axios.get('http://localhost:5000/api/subscription/current', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setCurrentSubscription(response.data)
    } catch (error: any) {
      console.error('Fetch subscription error:', error.response?.status, error.response?.data)
      
      // Only redirect to login if token is actually invalid (401)
      // Don't redirect for 403 (which might be just deactivated account)
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, redirecting to login')
        localStorage.removeItem('token')
        window.location.href = '/auth/login'
      } else if (error.response?.status === 403) {
        console.log('Account deactivated - allowing subscription page access for renewal')
        // Set a default subscription object for deactivated users
        setCurrentSubscription({
          subscriptionType: 'expired_trial',
          isActive: false,
          needsRenewal: true,
          hasUsedTrial: true,
          trialEnabledByAdmin: false
        })
      }
    }
  }

  const handleSubscribe = async (planId: string, price: number) => {
    if (planId === 'trial') {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        // Handle trial subscription
        const response = await axios.post('http://localhost:5000/api/subscription/trial', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.success) {
          alert('ট্রায়াল সফলভাবে চালু হয়েছে! ৩ দিনের জন্য সেবা উপভোগ করুন।')
          router.push('/dashboard')
        }
      } catch (error: any) {
        alert('সাবস্ক্রিপশন প্রসেস করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।')
        console.error('Subscription error:', error)
      } finally {
        setLoading(false)
      }
    } else {
      // Show payment modal for paid plans
      const plan = subscriptionPlans.find(p => p.id === planId) || null
      setSelectedPlan(plan)
      setShowPaymentModal(true)
    }
  }

  // Payment form submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentSubmitting(true)
    setPaymentSuccess('')
    setPaymentError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setPaymentError('আপনার সেশন মেয়াদ শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।')
        return
      }

      console.log('Submitting payment with token:', token.substring(0, 20) + '...')
      const formData = new FormData()
      formData.append('planId', selectedPlan?.id || '')
      formData.append('paymentMethod', paymentMethod)
      formData.append('transactionId', transactionId)
      formData.append('paymentPhone', paymentPhone)
      if (screenshot) formData.append('screenshot', screenshot)
      
      const response = await axios.post('http://localhost:5000/api/subscription/payment', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      
      console.log('Payment response:', response.data)
      setPaymentSuccess('পেমেন্ট তথ্য সফলভাবে জমা হয়েছে! অ্যাডমিন অনুমোদনের পর আপনার সাবস্ক্রিপশন সক্রিয় হবে।')
      setPaymentMethod('')
      setTransactionId('')
      setPaymentPhone('')
      setScreenshot(null)
      setShowPaymentModal(false)
      
      // Show delivered confirmation
      setTimeout(() => {
        alert('✅ Delivered! আপনার পেমেন্ট তথ্য সফলভাবে জমা হয়েছে।')
      }, 500)
      
      fetchCurrentSubscription()
    } catch (err: any) {
      console.error('Payment error:', err.response?.status, err.response?.data)
      if (err.response?.status === 401) {
        setPaymentError('আপনার সেশন মেয়াদ শেষ হয়ে গেছে। দয়া করে আবার লগইন করুন।')
        localStorage.removeItem('token')
        setTimeout(() => window.location.href = '/auth/login', 2000)
      } else if (err.response?.status === 403) {
        setPaymentError('আপনার একাউন্ট নিষ্ক্রিয় রয়েছে। তবুও পেমেন্ট করতে পারবেন।')
        // Don't redirect for 403, just show error but allow payment
      } else {
        setPaymentError('পেমেন্ট তথ্য জমা দিতে সমস্যা হয়েছে')
      }
    } finally {
      setPaymentSubmitting(false)
    }
  }

  const calculateSavings = (originalPrice: number, discountedPrice: number, months: number) => {
    const monthlyRate = originalPrice
    const totalOriginal = monthlyRate * months
    return totalOriginal - discountedPrice
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            সাবস্ক্রিপশন প্ল্যান
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            আপনার ব্যবসার জন্য উপযুক্ত প্ল্যান বেছে নিন
          </p>
          
          {/* Debug/Refresh Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                console.log('🔄 Manual debug triggered');
                if ((window as any).debugUserStatus) {
                  (window as any).debugUserStatus();
                } else {
                  console.log('Debug script not loaded yet, refreshing page...');
                  window.location.reload();
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              � Debug User Status
            </button>
          </div>
        </div>

        {/* Current Subscription Info */}
        {currentSubscription && (
          <div className={`mt-8 border rounded-lg p-6 ${
            !currentSubscription.isActive 
              ? 'bg-red-50 border-red-200' 
              : currentSubscription.needsRenewal || currentSubscription.isTrialExpired 
                ? 'bg-orange-50 border-orange-200'
                : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="text-center">
              {!currentSubscription.isActive ? (
                <>
                  <h3 className="text-lg font-medium text-red-900">
                    🚫 সেবা নিষ্ক্রিয় রয়েছে
                  </h3>
                  <p className="text-red-700 mt-2">
                    আপনার একাউন্ট বর্তমানে নিষ্ক্রিয় করা হয়েছে। সেবা পুনরায় চালু করতে নতুন সাবস্ক্রিপশন প্ল্যান নিন।
                  </p>
                  <div className="mt-3 text-sm text-red-600 bg-red-100 p-3 rounded">
                    <p><strong>⚠️ গুরুত্বপূর্ণ:</strong> এই মুহূর্তে আপনার ওয়েবসাইট সম্পূর্ণ বন্ধ রয়েছে। কাস্টমাররা কোনো অর্ডার করতে পারবেন না।</p>
                    <p className="mt-1"><strong>📞 সমাধান:</strong> নিচে থেকে যেকোনো একটি প্ল্যান নিন এবং পেমেন্ট সম্পন্ন করুন।</p>
                  </div>
                </>
              ) : currentSubscription.needsRenewal || currentSubscription.isTrialExpired ? (
                <>
                  <h3 className="text-lg font-medium text-orange-900">
                    ⚠️ চুক্তি নবায়ন প্রয়োজন
                  </h3>
                  <p className="text-orange-700 mt-2">
                    {currentSubscription.subscriptionType === 'expired_trial' || currentSubscription.isTrialExpired
                      ? 'আপনার ৩ দিনের ট্রায়াল শেষ হয়ে গেছে। সেবা চালু রাখতে নীচে থেকে একটি পেইড প্ল্যান বেছে নিন।'
                      : 'আপনার সাবস্ক্রিপশন শেষ হয়ে গেছে। সেবা চালু রাখতে চুক্তি নবায়ন করুন।'
                    }
                  </p>
                  <div className="mt-3 text-sm text-orange-600">
                    <p>🔒 সেবা বন্ধ রয়েছে - অর্ডার গ্রহণ করা যাবে না</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-blue-900">
                    বর্তমান সাবস্ক্রিপশন: {currentSubscription.subscriptionType === 'trial' ? 'ট্রায়াল' : currentSubscription.subscriptionType}
                  </h3>
                  <p className="text-blue-700">
                    আপনার সেবা চালু রয়েছে
                  </p>
                  {currentSubscription.trialEndsAt && currentSubscription.subscriptionType === 'trial' && (
                    <p className="text-sm text-blue-600 mt-1">
                      ট্রায়াল শেষ: {new Date(currentSubscription.trialEndsAt).toLocaleDateString('bn-BD')}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Hide payment status if account is deactivated */}
        {currentSubscription?.isActive && (
          <>
            {/* Payment Approved Status */}
            {currentSubscription?.paymentApproved && currentSubscription?.subscriptionType !== 'trial' && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-green-900">
                    ✅ পেমেন্ট অনুমোদিত হয়েছে!
                  </h3>
                  <p className="text-green-700 mt-2">
                    আপনার {currentSubscription.paymentPlanId} সাবস্ক্রিপশন সক্রিয় করা হয়েছে। ধন্যবাদ!
                  </p>
                </div>
              </div>
            )}

            {/* Payment Status Info */}
            {currentSubscription?.paymentMethod && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-yellow-900">
                    পেমেন্ট অনুমোদনের জন্য অপেক্ষমাণ
                  </h3>
                  <p className="text-yellow-700 mt-2">
                    আপনার {currentSubscription.paymentMethod} পেমেন্ট জমা হয়েছে। অ্যাডমিন অনুমোদনের পর আপনার সাবস্ক্রিপশন সক্রিয় হবে।
                  </p>
                  <div className="mt-3 text-sm text-yellow-600">
                    <p><strong>ট্রানজেকশন আইডি:</strong> {currentSubscription.transactionId}</p>
                    <p><strong>প্ল্যান:</strong> {currentSubscription.paymentPlanId}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Pricing Cards */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
          {subscriptionPlans
            .filter(plan => {
              // If account is deactivated, show all plans (fresh start)
              if (!currentSubscription?.isActive) {
                return true;
              }
              
              // Hide trial if:
              // 1. User has used trial AND admin hasn't enabled it, OR
              // 2. Trial is expired/needs renewal
              if (plan.id === 'trial') {
                const trialExpiredOrNeedsRenewal = currentSubscription?.needsRenewal || currentSubscription?.isTrialExpired
                const trialNotAllowed = userInfo?.hasUsedTrial && !userInfo?.trialEnabledByAdmin
                
                if (trialExpiredOrNeedsRenewal || trialNotAllowed) {
                  return false
                }
                return true
              }
              return true
            })
            .map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg shadow-sm divide-y divide-gray-200 relative ${
                plan.popular
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200'
              } ${
                // Only highlight if account is active and plan is current
                currentSubscription?.isActive && (
                  (currentSubscription?.paymentApproved && currentSubscription?.paymentPlanId === plan.id) ||
                  (currentSubscription?.isActive && currentSubscription?.subscriptionType === plan.id)
                ) ? 'ring-2 ring-green-500 border-green-500' : ''
              }`}
            >
              {/* Current Plan Badge - only show if account is active */}
              {currentSubscription?.isActive && (
                ((currentSubscription?.paymentApproved && currentSubscription?.paymentPlanId === plan.id) ||
                (currentSubscription?.isActive && currentSubscription?.subscriptionType === plan.id))
              ) && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                  বর্তমান প্ল্যান
                </div>
              )}
              <div className="p-6">
                {plan.popular && (
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide text-center mb-3">
                    জনপ্রিয় প্ল্যান
                  </p>
                )}
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">
                  {plan.name}
                </h3>
                <div className="mt-4 text-center">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ৳{plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    /{plan.duration} দিন
                  </span>
                </div>
                {/* Savings Badge */}
                {plan.id === '6month' && (
                  <div className="mt-2 text-center">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      ৳{calculateSavings(500, plan.price, 6)} সাশ্রয়!
                    </span>
                  </div>
                )}
                {plan.id === 'yearly' && (
                  <div className="mt-2 text-center">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      ৳{calculateSavings(500, plan.price, 12)} সাশ্রয়!
                    </span>
                  </div>
                )}
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6 pb-8 px-6">
                {(() => {
                  // If account is deactivated, all plans are available (reset state)
                  if (!currentSubscription?.isActive) {
                    return (
                      <button
                        onClick={() => handleSubscribe(plan.id, plan.price)}
                        disabled={loading}
                        className={`w-full font-medium py-2 px-4 rounded-md transition-colors ${
                          plan.popular
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-800 hover:bg-gray-900 text-white'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? 'প্রক্রিয়াধীন...' : plan.price === 0 ? 'ট্রায়াল শুরু করুন' : 'এই প্ল্যান নিন'}
                      </button>
                    );
                  }

                  // Check if this plan is already purchased/approved
                  const isPlanPurchased = currentSubscription?.paymentApproved && 
                    currentSubscription?.paymentPlanId === plan.id;
                  
                  // Check if this plan has pending payment
                  const hasPendingPayment = currentSubscription?.paymentMethod && 
                    !currentSubscription?.paymentApproved &&
                    currentSubscription?.paymentPlanId === plan.id;
                  
                  // Check if this is the currently active subscription type
                  const isCurrentActiveSubscription = currentSubscription?.isActive && 
                    currentSubscription?.subscriptionType === plan.id;
                  
                  if (isPlanPurchased || isCurrentActiveSubscription) {
                    return (
                      <button
                        disabled={true}
                        className="w-full font-medium py-2 px-4 rounded-md bg-green-600 text-white cursor-not-allowed opacity-75"
                      >
                        ✅ এই প্ল্যান নেওয়া হয়েছে
                      </button>
                    );
                  }
                  
                  if (hasPendingPayment) {
                    return (
                      <button
                        disabled={true}
                        className="w-full font-medium py-2 px-4 rounded-md bg-yellow-600 text-white cursor-not-allowed opacity-75"
                      >
                        ⏳ পেমেন্ট অনুমোদনের অপেক্ষায়
                      </button>
                    );
                  }
                  
                  return (
                    <button
                      onClick={() => handleSubscribe(plan.id, plan.price)}
                      disabled={loading}
                      className={`w-full font-medium py-2 px-4 rounded-md transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-800 hover:bg-gray-900 text-white'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'প্রক্রিয়াধীন...' : plan.price === 0 ? 'ট্রায়াল শুরু করুন' : 'এই প্ল্যান নিন'}
                    </button>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-4 text-center">{selectedPlan.name} - Send Money Payment</h3>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="upay">Upay</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter Transaction ID"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={paymentPhone}
                    onChange={e => setPaymentPhone(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter Phone Number"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Screenshot</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setScreenshot(e.target.files?.[0] || null)}
                    required
                    className="w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                  {paymentSubmitting ? 'Submitting...' : 'Submit Payment'}
                </button>
                {paymentSuccess && <div className="text-green-600 mt-2">{paymentSuccess}</div>}
                {paymentError && <div className="text-red-600 mt-2">{paymentError}</div>}
              </form>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900">প্রায়শই জিজ্ঞাসিত প্রশ্ন</h3>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h4 className="text-lg font-medium text-gray-900 mb-2">ট্রায়াল পিরিয়ড কী?</h4>
              <p className="text-gray-600">
                ৩ দিনের বিনামূল্যে ট্রায়াল যেখানে আপনি সব ফিচার ব্যবহার করে দেখতে পারবেন।
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h4 className="text-lg font-medium text-gray-900 mb-2">পেমেন্ট মেথড কী কী?</h4>
              <p className="text-gray-600">
                বিকাশ, নগদ, রকেট এবং ব্যাংক ট্রান্সফার গ্রহণযোগ্য।
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h4 className="text-lg font-medium text-gray-900 mb-2">রিফান্ড পলিসি কী?</h4>
              <p className="text-gray-600">
                সেবা ব্যবহার না করলে ৭ দিনের মধ্যে সম্পূর্ণ রিফান্ড।
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h4 className="text-lg font-medium text-gray-900 mb-2">সাপোর্ট কীভাবে পাবো?</h4>
              <p className="text-gray-600">
                হোয়াটসঅ্যাপ, ইমেইল এবং ফোনের মাধ্যমে ২৪/৭ সাপোর্ট।
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-blue-600 rounded-lg">
          <div className="px-6 py-12 text-center">
            <h3 className="text-2xl font-bold text-white">সাহায্য দরকার?</h3>
            <p className="mt-4 text-lg text-blue-100">
              আমাদের সাথে যোগাযোগ করুন যেকোনো প্রশ্নের জন্য
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-white">
                <strong>হোয়াটসঅ্যাপ:</strong> +88 01XXXXXXXXX
              </p>
              <p className="text-white">
                <strong>ইমেইল:</strong> support@yoursite.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
