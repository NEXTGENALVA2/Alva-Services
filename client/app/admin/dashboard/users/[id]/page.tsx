"use client"

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Trial control state
  const [togglingTrial, setTogglingTrial] = useState(false)
  const [trialSuccess, setTrialSuccess] = useState('')
  const [trialError, setTrialError] = useState('')
  // Payment approval state
  const [approvingPayment, setApprovingPayment] = useState(false)
  const [approvalSuccess, setApprovalSuccess] = useState('')
  const [approvalError, setApprovalError] = useState('')
  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true)
        const token = localStorage.getItem('adminToken')
        if (!token) {
          setError('প্রবেশাধিকার নেই')
          return
        }

        const response = await axios.get(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
      } catch (err: any) {
        setError('ইউজার তথ্য লোড করতে সমস্যা হয়েছে')
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  // Admin approve payment function
  const handleApprovePayment = async () => {
    setApprovingPayment(true)
    setApprovalSuccess('')
    setApprovalError('')
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.post(`http://localhost:5000/api/admin/users/${id}/approve-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setApprovalSuccess('পেমেন্ট অনুমোদিত হয়েছে এবং সাবস্ক্রিপশন সক্রিয় করা হয়েছে!')
      // Refresh user data
      const userResponse = await axios.get(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(userResponse.data)
    } catch (err: any) {
      setApprovalError('পেমেন্ট অনুমোদন করতে সমস্যা হয়েছে')
    } finally {
      setApprovingPayment(false)
    }
  }

  const handleToggleTrial = async () => {
    setTogglingTrial(true)
    setTrialSuccess('')
    setTrialError('')
    
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${id}/trial-toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      if (response.data.success) {
        setTrialSuccess(response.data.message)
        // Update user state
        setUser((prevUser: any) => ({
          ...prevUser,
          trialEnabledByAdmin: !prevUser.trialEnabledByAdmin
        }))
      }
    } catch (error: any) {
      console.error('Toggle trial error:', error)
      setTrialError('ট্রায়াল স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে')
    } finally {
      setTogglingTrial(false)
    }
  }

  // Admin activate user with fresh start
  const handleActivateUserWithFreshStart = async () => {
    setTogglingTrial(true)
    setTrialSuccess('')
    setTrialError('')

    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setTrialError('প্রবেশাধিকার নেই')
        return
      }

      const response = await axios.patch(`http://localhost:5000/api/admin/users/${id}/status`, 
        { isActive: true },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setUser(response.data.user)
      setTrialSuccess('✅ ইউজার সফলভাবে সক্রিয় করা হয়েছে নতুন ৩ দিনের ট্রায়াল সহ!\n\n🚀 ইউজারের Dashboard এখনই unlock হয়ে গেছে!')
      
      // Fire custom event to notify all components about user status change
      window.dispatchEvent(new CustomEvent('userStatusUpdated', { 
        detail: { userId: id, isActive: true } 
      }))
    } catch (err: any) {
      setTrialError('ইউজার সক্রিয় করতে সমস্যা হয়েছে')
      console.error('Activate user error:', err)
    } finally {
      setTogglingTrial(false)
    }
  }

  // Admin deactivate user
  const handleDeactivateUser = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ইউজারকে নিষ্ক্রিয় করতে চান?')) {
      return
    }

    setTogglingTrial(true)
    setTrialSuccess('')
    setTrialError('')

    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setTrialError('প্রবেশাধিকার নেই')
        return
      }

      const response = await axios.patch(`http://localhost:5000/api/admin/users/${id}/status`, 
        { isActive: false },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setUser(response.data.user)
      setTrialSuccess('✅ ইউজার সফলভাবে নিষ্ক্রিয় করা হয়েছে')
    } catch (err: any) {
      setTrialError('ইউজার নিষ্ক্রিয় করতে সমস্যা হয়েছে')
      console.error('Deactivate user error:', err)
    } finally {
      setTogglingTrial(false)
    }
  }

  if (loading) return <div className="text-center py-8">লোড হচ্ছে...</div>
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>
  if (!user) return <div className="text-center py-8">ইউজার পাওয়া যায়নি</div>

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">ইউজার বিস্তারিত</h2>
      <div className="space-y-2 mb-8">
        <div><span className="font-semibold">নাম:</span> {user.name}</div>
        <div><span className="font-semibold">ইমেইল:</span> {user.email}</div>
        <div><span className="font-semibold">ফোন:</span> {user.phone || 'N/A'}</div>
        <div><span className="font-semibold">স্ট্যাটাস:</span> {user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</div>
        <div><span className="font-semibold">সাবস্ক্রিপশন:</span> {user.subscriptionType}</div>
        <div><span className="font-semibold">রেজিস্ট্রেশন:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
        
        {/* Payment Info */}
        {user.paymentMethod && (
          <div className="mt-6 p-4 bg-blue-50 rounded border">
            <h4 className="font-bold mb-3 text-lg">পেমেন্ট তথ্য</h4>
            <div className="space-y-2">
              <div><span className="font-semibold">পেমেন্ট মেথড:</span> {user.paymentMethod}</div>
              <div><span className="font-semibold">ট্রানজেকশন আইডি:</span> {user.transactionId}</div>
              <div><span className="font-semibold">ফোন নাম্বার:</span> {user.paymentPhone}</div>
              {user.paymentPlanId && <div><span className="font-semibold">প্ল্যান:</span> {user.paymentPlanId}</div>}
              {user.paymentScreenshot && (
                <div className="mt-3">
                  <span className="font-semibold">স্ক্রিনশট:</span><br />
                  <div className="mt-2">
                    <img 
                      src={`http://localhost:5000${user.paymentScreenshot}`} 
                      alt="Payment Screenshot" 
                      className="max-w-sm rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setShowImageModal(true)}
                      style={{ maxHeight: '300px', objectFit: 'contain' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">ছবিতে ক্লিক করুন বড় করে দেখার জন্য</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Admin Approval Section */}
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={handleApprovePayment}
                disabled={approvingPayment}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {approvingPayment ? 'অনুমোদন করা হচ্ছে...' : 'পেমেন্ট অনুমোদন করুন'}
              </button>
              {approvalSuccess && <div className="text-green-600 mt-2">{approvalSuccess}</div>}
              {approvalError && <div className="text-red-600 mt-2">{approvalError}</div>}
            </div>
          </div>
        )}

        {/* Admin User Control Section */}
        <div className="mt-6 p-4 bg-emerald-50 rounded border border-emerald-200">
          <h4 className="font-bold mb-3 text-lg">অ্যাডমিন কন্ট্রোল</h4>
          <div className="space-y-3">
            <div><span className="font-semibold">বর্তমান স্ট্যাটাস:</span> 
              <span className={`ml-2 px-3 py-1 rounded text-sm font-medium ${
                user.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? '✅ সক্রিয়' : '❌ নিষ্ক্রিয়'}
              </span>
            </div>
            
            <div className="flex gap-3">
              {!user.isActive ? (
                <button
                  onClick={handleActivateUserWithFreshStart}
                  disabled={togglingTrial}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                >
                  {togglingTrial ? 'সক্রিয় করা হচ্ছে...' : '🚀 Admin Activate (Fresh Start)'}
                </button>
              ) : (
                <button
                  onClick={handleDeactivateUser}
                  disabled={togglingTrial}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {togglingTrial ? 'নিষ্ক্রিয় করা হচ্ছে...' : '🔒 ইউজার নিষ্ক্রিয় করুন'}
                </button>
              )}
            </div>
            
            {!user.isActive && (
              <div className="text-sm text-emerald-700 bg-emerald-100 p-3 rounded">
                <strong>Fresh Start এর সুবিধা:</strong><br />
                • ইউজার সক্রিয় হবে<br />
                • নতুন ৩ দিনের ট্রায়াল পাবে<br />
                • পুরো সিস্টেম ব্যবহার করতে পারবে<br />
                • Dashboard এর সব ফিচার এক্সেস পাবে
              </div>
            )}
            
            {trialSuccess && <div className="text-green-600 font-medium">{trialSuccess}</div>}
            {trialError && <div className="text-red-600 font-medium">{trialError}</div>}
          </div>
        </div>

        {/* Trial Control Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded border">
          <h4 className="font-bold mb-3 text-lg">ট্রায়াল নিয়ন্ত্রণ</h4>
          <div className="space-y-2 mb-4">
            <div><span className="font-semibold">ট্রায়াল ব্যবহার করেছে:</span> {user.hasUsedTrial ? 'হ্যাঁ' : 'না'}</div>
            <div><span className="font-semibold">অ্যাডমিন ট্রায়াল সক্রিয়:</span> {user.trialEnabledByAdmin ? 'হ্যাঁ' : 'না'}</div>
            <div><span className="font-semibold">বর্তমান স্ট্যাটাস:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                user.subscriptionType === 'expired_trial' 
                  ? 'bg-red-100 text-red-800' 
                  : user.subscriptionType === 'trial' && user.isActive 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {user.subscriptionType === 'expired_trial' 
                  ? 'ট্রায়াল মেয়াদ শেষ' 
                  : user.subscriptionType === 'trial' && user.isActive
                    ? 'সক্রিয় ট্রায়াল'
                    : user.subscriptionType || 'কোনো সাবস্ক্রিপশন নেই'
                }
              </span>
            </div>
            {user.trialEndsAt && (
              <div><span className="font-semibold">ট্রায়াল শেষ:</span> {new Date(user.trialEndsAt).toLocaleDateString('bn-BD')}</div>
            )}
          </div>
          
          {(user.hasUsedTrial || user.subscriptionType === 'expired_trial') && (
            <button
              onClick={handleToggleTrial}
              disabled={togglingTrial}
              className={`px-6 py-2 rounded text-white transition-colors ${
                user.trialEnabledByAdmin 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {togglingTrial 
                ? 'আপডেট করা হচ্ছে...' 
                : user.trialEnabledByAdmin 
                  ? 'ট্রায়াল বন্ধ করুন' 
                  : user.subscriptionType === 'expired_trial'
                    ? 'ট্রায়াল পুনরায় চালু করুন (৩ দিন)'
                    : 'ট্রায়াল পুনরায় সক্রিয় করুন'
              }
            </button>
          )}
          
          {trialSuccess && <div className="text-green-600 mt-2">{trialSuccess}</div>}
          {trialError && <div className="text-red-600 mt-2">{trialError}</div>}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && user.paymentScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-screen p-4">
            <button
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>
            <img 
              src={`http://localhost:5000${user.paymentScreenshot}`} 
              alt="Payment Screenshot" 
              className="max-w-full max-h-full rounded-lg"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}