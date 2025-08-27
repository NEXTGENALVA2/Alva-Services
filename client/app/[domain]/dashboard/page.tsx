'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DomainDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p>Taking you to the dashboard...</p>
      </div>
    </div>
  )
}
