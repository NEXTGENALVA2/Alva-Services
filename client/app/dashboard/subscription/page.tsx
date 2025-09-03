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
  const [loading, setLoading] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
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
  }, [])

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await axios.get('http://localhost:5000/api/subscription/current', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setCurrentSubscription(response.data)
    } catch (error) {
      console.error('Fetch subscription error:', error)
    }
  }

  const handleSubscribe = async (planId: string, price: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (planId === 'trial') {
        // Handle trial subscription
        const response = await axios.post('http://localhost:5000/api/subscription/trial', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.success) {
          alert('ট্রায়াল সফলভাবে চালু হয়েছে! ৩ দিনের জন্য সেবা উপভোগ করুন।')
          router.push('/dashboard')
        }
      } else {
        // Handle paid subscription
        alert(`${planId} প্ল্যানের জন্য পেমেন্ট পেজে যাচ্ছেন... (${price} টাকা)`)
        
        // Here you would integrate with payment gateway
        const response = await axios.post('http://localhost:5000/api/subscription/create', {
          planId,
          price
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.paymentUrl) {
          // Redirect to payment page
          window.location.href = response.data.paymentUrl
        }
      }
    } catch (error: any) {
      alert('সাবস্ক্রিপশন প্রসেস করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।')
      console.error('Subscription error:', error)
    } finally {
      setLoading(false)
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
        </div>

        {/* Current Subscription Info */}
        {currentSubscription && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-blue-900">
                বর্তমান সাবস্ক্রিপশন: {currentSubscription.subscriptionType === 'trial' ? 'ট্রায়াল' : currentSubscription.subscriptionType}
              </h3>
              <p className="text-blue-700">
                {currentSubscription.isActive 
                  ? 'আপনার সেবা চালু রয়েছে' 
                  : 'আপনার সেবা বন্ধ রয়েছে - নীচে থেকে নতুন প্ল্যান বেছে নিন'
                }
              </p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg shadow-sm divide-y divide-gray-200 ${
                plan.popular
                  ? 'border-blue-500 ring-2 ring-blue-500'
                  : 'border-gray-200'
              }`}
            >
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
              </div>
            </div>
          ))}
        </div>

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
