'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"

interface FormData {
  username: string
  password: string
}

export default function AdminLogin() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', formData)
      localStorage.setItem('adminToken', response.data.token)
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin))
      router.push('/admin/dashboard')
    } catch (error: any) {
      console.error('Admin login error:', error)
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
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">⚡</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            অ্যাডমিন প্যানেল
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            সিস্টেম অ্যাডমিনিস্ট্রেটর লগিন
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">অ্যাডমিন লগইন</CardTitle>
            <CardDescription className="text-center">
              আপনার অ্যাডমিন ক্রেডেনশিয়াল দিয়ে লগইন করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">ইউজারনেম অথবা ইমেইল</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="অ্যাডমিন ইউজারনেম লিখুন"
                  className="h-12"
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
                  placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন"
                  className="h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-red-600 hover:bg-red-700" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>লগইন হচ্ছে...</span>
                  </div>
                ) : (
                  'অ্যাডমিন লগইন'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 EcommerceSaaS Admin Panel. সকল অধিকার সংরক্ষিত।
          </p>
        </div>
      </div>
    </div>
  )
}
