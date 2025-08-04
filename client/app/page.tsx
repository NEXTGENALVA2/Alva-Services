'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, BarChart3, MessageCircle, CreditCard } from 'lucide-react'

export default function Home() {
  const [email, setEmail] = useState('')

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "10 সেকেন্ডে ওয়েবসাইট",
      description: "মাত্র এক ক্লিকে ১০ সেকেন্ডের মধ্যে আপনার ই-কমার্স ওয়েবসাইট তৈরি হয়ে যাবে"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-600" />,
      title: "সম্পূর্ণ ড্যাশবোর্ড",
      description: "বিক্রয়, মুনাফা, স্টক - সব কিছুর সম্পূর্ণ হিসাব এক জায়গায়"
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-600" />,
      title: "এআই চ্যাটবট",
      description: "গ্রাহকরা চ্যাটবটের সাথে কথা বলে সরাসরি অর্ডার করতে পারবেন"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-orange-600" />,
      title: "পেমেন্ট গেটওয়ে",
      description: "SSLCommerz, পাঠাও এবং স্টেডফাস্ট কুরিয়ার ইন্টিগ্রেশন"
    }
  ]

  const plans = [
    {
      name: "ট্রায়াল",
      price: "ফ্রি",
      duration: "৩ দিন",
      features: ["সব ফিচার", "৩ দিনের জন্য", "সাপোর্ট"]
    },
    {
      name: "মাসিক",
      price: "৫০০ টাকা",
      duration: "মাসিক",
      features: ["সব ফিচার", "কাস্টমার সাপোর্ট", "আনলিমিটেড প্রোডাক্ট"]
    },
    {
      name: "৬ মাস",
      price: "২৪০০ টাকা",
      duration: "৬ মাস",
      features: ["২০% ছাড়", "প্রায়োরিটি সাপোর্ট", "অ্যাডভান্স অ্যানালিটিক্স"],
      popular: true
    },
    {
      name: "বার্ষিক",
      price: "৩৬০০ টাকা",
      duration: "১২ মাস",
      features: ["৪০% ছাড়", "ডেডিকেটেড সাপোর্ট", "কাস্টম ফিচার"]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EcommerceSaaS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                লগিন
              </Link>
              <Link href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                রেজিস্টার
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            ১০ সেকেন্ডে তৈরি করুন<br />
            <span className="text-yellow-300">আপনার ই-কমার্স ওয়েবসাইট</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            সাবস্ক্রিপশন ভিত্তিক সম্পূর্ণ ই-কমার্স সলিউশন। এআই চ্যাটবট, পেমেন্ট গেটওয়ে, কুরিয়ার ট্র্যাকিং সব কিছু。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/register" className="bg-yellow-500 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 flex items-center">
              ৩ দিনের ফ্রি ট্রায়াল শুরু করুন
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600">
              ডেমো দেখুন
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              কেন আমাদের প্ল্যাটফর্ম?
            </h2>
            <p className="text-xl text-gray-600">
              সব কিছু এক জায়গায় - সহজ, দ্রুত এবং কার্যকর
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              প্রাইসিং প্ল্যান
            </h2>
            <p className="text-xl text-gray-600">
              আপনার প্রয়োজন অনুযায়ী প্ল্যান বেছে নিন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-white p-6 rounded-xl shadow-lg ${plan.popular ? 'ring-2 ring-blue-600 relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      জনপ্রিয়
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{plan.price}</div>
                  <div className="text-gray-600 mb-6">{plan.duration}</div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-3 rounded-lg font-semibold ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}>
                    {index === 0 ? 'ট্রায়াল শুরু করুন' : 'সাবস্ক্রাইব করুন'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            আজই শুরু করুন আপনার ই-কমার্স যাত্রা
          </h2>
          <p className="text-xl mb-8 opacity-90">
            ৩ দিনের ফ্রি ট্রায়াল - কোন ক্রেডিট কার্ড প্রয়োজন নেই
          </p>
          <Link href="/auth/register" className="bg-yellow-500 text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 inline-flex items-center">
            এখনই শুরু করুন
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">EcommerceSaaS</h3>
              <p className="text-gray-400">
                বাংলাদেশের সেরা ই-কমার্স ওয়েবসাইট তৈরির প্ল্যাটফর্ম
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">ফিচার</h4>
              <ul className="space-y-2 text-gray-400">
                <li>ওয়েবসাইট বিল্ডার</li>
                <li>এআই চ্যাটবট</li>
                <li>পেমেন্ট গেটওয়ে</li>
                <li>কুরিয়ার ইন্টিগ্রেশন</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">সাপোর্ট</h4>
              <ul className="space-y-2 text-gray-400">
                <li>হেল্প সেন্টার</li>
                <li>ডকুমেন্টেশন</li>
                <li>কমিউনিটি</li>
                <li>যোগাযোগ</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">কোম্পানি</h4>
              <ul className="space-y-2 text-gray-400">
                <li>আমাদের সম্পর্কে</li>
                <li>ব্লগ</li>
                <li>ক্যারিয়ার</li>
                <li>প্রাইভেসি পলিসি</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EcommerceSaaS. সকল অধিকার সংরক্ষিত।</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
