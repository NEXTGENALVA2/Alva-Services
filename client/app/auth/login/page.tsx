
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface FormData {
  email: string
  password: string
}

export default function Login() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check if server is running first
      const response = await axios.post('/api/auth/login', formData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError('সার্ভার চালু নেই। অনুগ্রহ করে সার্ভার চালু করুন।')
      } else if (error.response?.status === 404) {
        setError('API endpoint পাওয়া যাচ্ছে না। সার্ভার সেটআপ চেক করুন।')
      } else if (error.response?.status === 400 || error.response?.status === 401) {
        setError('ভুল ইমেইল বা পাসওয়ার্ড')
      } else {
        setError(error.response?.data?.message || 'লগিনে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-blue-600 hover:text-blue-700">
            EcommerceSaaS
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            আপনার একাউন্টে লগিন করুন
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            অথবা{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              নতুন একাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                ইমেইল ঠিকানা
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="আপনার ইমেইল লিখুন"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                পাসওয়ার্ড
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    লগিন হচ্ছে...
                  </>
                ) : (
                  'লগিন করুন'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">অথবা</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">
                নতুন ব্যবহারকারী?{' '}
                <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                  ৩ দিনের ফ্রি ট্রায়াল শুরু করুন
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
