import React, { useState, useEffect } from 'react'
import { Bell, X, Check, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

interface OrderNotification {
  id: number
  orderId: number
  customerName: string
  totalAmount: number
  timestamp: Date
  status: 'pending' | 'confirmed' | 'dismissed'
}

interface OrderNotificationProps {
  onConfirmOrder?: (orderId: number) => void
}

export default function OrderNotificationSystem({ onConfirmOrder }: OrderNotificationProps) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Load notifications from localStorage on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('orderNotifications')
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }))
      setNotifications(parsed)
    }

    // Listen for new orders from localStorage changes (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newOrder') {
        const newOrder = JSON.parse(e.newValue || '{}')
        addNewOrderNotification(newOrder)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Save notifications to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem('orderNotifications', JSON.stringify(notifications))
  }, [notifications])

  // Function to add new order notification
  const addNewOrderNotification = (orderData: any) => {
    const newNotification: OrderNotification = {
      id: Date.now(),
      orderId: orderData.id || Date.now(),
      customerName: orderData.customerName || 'Unknown Customer',
      totalAmount: orderData.totalAmount || 0,
      timestamp: new Date(),
      status: 'pending'
    }

    setNotifications(prev => [newNotification, ...prev])
    setIsVisible(true)

    // Auto-hide after 10 seconds
    setTimeout(() => {
      setIsVisible(false)
    }, 10000)
  }

  // Function to confirm an order
  const confirmOrder = (notificationId: number, orderId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'confirmed' }
          : notification
      )
    )

    if (onConfirmOrder) {
      onConfirmOrder(orderId)
    }

    // Remove confirmed notification after 2 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      )
    }, 2000)
  }

  // Function to dismiss a notification
  const dismissNotification = (notificationId: number) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  // Get pending notifications
  const pendingNotifications = notifications.filter(n => n.status === 'pending')

  // Function to manually trigger test notification (for demo purposes)
  const addTestNotification = () => {
    const testOrder = {
      id: Math.floor(Math.random() * 1000),
      customerName: `কাস্টমার-${Math.floor(Math.random() * 100)}`,
      totalAmount: Math.floor(Math.random() * 2000) + 500,
      customerPhone: '০১৭১২৩৪৫৬৭৮'
    }
    addNewOrderNotification(testOrder)
  }

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {pendingNotifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {pendingNotifications.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      {isVisible && (
        <div className="fixed top-4 right-4 z-50 w-80 max-h-96 overflow-y-auto">
          <Card className="shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">নতুন অর্ডার</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTestNotification}
                    className="text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    title="নতুন অর্ডার টেস্ট করুন"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    টেস্ট
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {pendingNotifications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">কোনো নতুন অর্ডার নেই</p>
              ) : (
                <div className="space-y-3">
                  {pendingNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          অর্ডার {index + 1}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleTimeString('bn-BD')}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="font-medium text-sm">{notification.customerName}</p>
                        <p className="text-sm text-gray-600">
                          মোট: ৳{notification.totalAmount.toLocaleString('bn-BD')}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => confirmOrder(notification.id, notification.orderId)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          নিশ্চিত
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dismissNotification(notification.id)}
                          className="flex-1"
                        >
                          <X className="h-3 w-3 mr-1" />
                          বাতিল
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success message for confirmed orders */}
      {notifications.some(n => n.status === 'confirmed') && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">অর্ডার নিশ্চিত করা হয়েছে!</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Helper function to trigger new order notification from anywhere in the app
export const triggerOrderNotification = (orderData: any) => {
  localStorage.setItem('newOrder', JSON.stringify(orderData))
  // Remove the trigger data after a brief moment
  setTimeout(() => {
    localStorage.removeItem('newOrder')
  }, 100)
}