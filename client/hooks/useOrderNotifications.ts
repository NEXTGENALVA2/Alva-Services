import { useEffect, useState } from 'react'
import axios from 'axios'

interface UseOrderNotificationsProps {
  onNewOrder?: (order: any) => void
  pollInterval?: number
}

export function useOrderNotifications({ onNewOrder, pollInterval = 5000 }: UseOrderNotificationsProps = {}) {
  const [lastOrderId, setLastOrderId] = useState<number | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    // Get initial last order ID
    const getInitialOrderId = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.data.length > 0) {
          setLastOrderId(response.data[0].id)
        }
      } catch (error) {
        console.error('Error fetching initial orders:', error)
      }
    }

    getInitialOrderId()
  }, [])

  useEffect(() => {
    if (!lastOrderId) return

    const pollForNewOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        setIsPolling(true)
        const response = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        })

        const orders = response.data
        if (orders.length > 0) {
          const latestOrder = orders[0]
          
          // Check if there's a new order
          if (latestOrder.id > lastOrderId) {
            // Find all new orders since last check
            const newOrders = orders.filter((order: any) => order.id > lastOrderId)
            
            // Trigger notifications for each new order
            newOrders.reverse().forEach((order: any) => {
              if (onNewOrder) {
                onNewOrder(order)
              }
              
              // Also trigger the localStorage event for cross-component communication
              localStorage.setItem('newOrder', JSON.stringify(order))
              setTimeout(() => {
                localStorage.removeItem('newOrder')
              }, 100)
            })
            
            setLastOrderId(latestOrder.id)
          }
        }
      } catch (error) {
        console.error('Error polling for new orders:', error)
      } finally {
        setIsPolling(false)
      }
    }

    // Start polling
    const interval = setInterval(pollForNewOrders, pollInterval)

    return () => clearInterval(interval)
  }, [lastOrderId, onNewOrder, pollInterval])

  return { isPolling }
}

// Helper function to manually trigger order notification for testing
export const simulateNewOrder = () => {
  const mockOrder = {
    id: Date.now(),
    customerName: 'নতুন কাস্টমার',
    customerPhone: '০১৭১২৩৪৫৬৭৊',
    totalAmount: Math.floor(Math.random() * 2000) + 500,
    status: 'pending',
    createdAt: new Date().toISOString()
  }

  localStorage.setItem('newOrder', JSON.stringify(mockOrder))
  setTimeout(() => {
    localStorage.removeItem('newOrder')
  }, 100)

  return mockOrder
}