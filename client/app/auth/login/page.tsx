'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"

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
      const response = await axios.post('http://localhost:5000/api/auth/login', formData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            আপনার অ্যাকাউন্টে লগইন করুন
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            অথবা{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">লগইন</CardTitle>
            <CardDescription className="text-center">
              আপনার ইমেইল এবং পাসওয়ার্ড দিয়ে লগইন করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="আপনার ইমেইল লিখুন"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="remember-me" className="ml-2 text-sm">
                    আমাকে মনে রাখুন
                  </Label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    পাসওয়ার্ড ভুলে গেছেন?
                  </a>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            এখনও অ্যাকাউন্ট নেই?{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              এখনই রেজিস্ট্রেশন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
