import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface NotificationContextType {
  pendingOrdersCount: number
  setPendingOrdersCount: (count: number) => void
  refreshPendingOrders: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  const refreshPendingOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const ordersRes = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const pending = ordersRes.data.filter(
        (order: any) => order.status === 'pending' || order.status === 'processing'
      ).length
      
      setPendingOrdersCount(pending)
    } catch (error) {
      console.error('Error fetching pending orders:', error)
    }
  }

  useEffect(() => {
    refreshPendingOrders()
    
    // Refresh every 30 seconds
    const interval = setInterval(refreshPendingOrders, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <NotificationContext.Provider value={{
      pendingOrdersCount,
      setPendingOrdersCount,
      refreshPendingOrders
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}