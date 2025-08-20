'use client';

import { useEffect, useState } from 'react';
import { Eye, Trash2, Package, Phone, MapPin, Mail, Calendar, DollarSign } from 'lucide-react';

// Translation function for Orders page
const t = (key: string): string => {
  if (typeof window === 'undefined') return key;
  
  const currentLang = localStorage.getItem('lang') || 'en';
  
  const translations: Record<string, Record<string, string>> = {
    bn: {
      order: 'অর্ডার',
      orderManagement: 'অর্ডার ম্যানেজমেন্ট',
      totalOrders: 'মোট অর্ডার',
      noOrders: 'কোনো অর্ডার নেই',
      noOrdersDesc: 'এখনও কোনো অর্ডার আসেনি।',
      loading: 'লোড হচ্ছে...',
      customerName: 'কাস্টমারের নাম',
      phone: 'ফোন',
      amount: 'পরিমাণ',
      status: 'স্ট্যাটাস',
      date: 'তারিখ',
      actions: 'অ্যাকশন',
      viewDetails: 'বিস্তারিত দেখুন',
      delete: 'মুছুন',
      deleteOrder: 'অর্ডার মুছুন',
      orderDetails: 'অর্ডার বিস্তারিত',
      orderInfo: 'অর্ডার তথ্য',
      customerInfo: 'কাস্টমারের তথ্য',
      address: 'ঠিকানা',
      email: 'ইমেইল',
      paymentMethod: 'পেমেন্ট পদ্ধতি',
      orderItems: 'অর্ডার আইটেম',
      product: 'পণ্য',
      quantity: 'পরিমাণ',
      price: 'দাম',
      total: 'মোট',
      close: 'বন্ধ',
      pending: 'অপেক্ষমান',
      confirmed: 'নিশ্চিত',
      shipped: 'পাঠানো হয়েছে',
      delivered: 'ডেলিভার হয়েছে',
      cancelled: 'বাতিল',
      deleteConfirm: 'আপনি কি এই অর্ডারটি মুছে ফেলতে চান?',
      deleteError: 'অর্ডার মুছতে সমস্যা হয়েছে।',
      deleteSuccess: 'অর্ডার মুছে ফেলা হয়েছে!'
    },
    en: {
      order: 'Order',
      orderManagement: 'Order Management',
      totalOrders: 'Total Orders',
      noOrders: 'No Orders',
      noOrdersDesc: 'No orders have been placed yet.',
      loading: 'Loading...',
      customerName: 'Customer Name',
      phone: 'Phone',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
      viewDetails: 'View Details',
      delete: 'Delete',
      deleteOrder: 'Delete Order',
      orderDetails: 'Order Details',
      orderInfo: 'Order Information',
      customerInfo: 'Customer Information',
      address: 'Address',
      email: 'Email',
      paymentMethod: 'Payment Method',
      orderItems: 'Order Items',
      product: 'Product',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      close: 'Close',
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      deleteConfirm: 'Are you sure you want to delete this order?',
      deleteError: 'Failed to delete order.',
      deleteSuccess: 'Order deleted successfully!'
    }
  };
  
  return translations[currentLang]?.[key] || key;
};

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail?: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    productName?: string;
    productImage?: string;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        alert('অর্ডার স্ট্যাটাস আপডেট হয়েছে!');
      } else {
        alert('অর্ডার আপডেট করতে সমস্যা হয়েছে।');
      }
    } catch (error) {
      alert('অর্ডার আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOrders(orders.filter(order => order.id !== orderId));
        alert(t('deleteSuccess'));
      } else {
        alert(t('deleteError'));
      }
    } catch (error) {
      alert(t('deleteError'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('pending');
      case 'confirmed': return t('confirmed');
      case 'shipped': return t('shipped');
      case 'delivered': return t('delivered');
      case 'cancelled': return t('cancelled');
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('orderManagement')}</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {t('totalOrders')}: <span className="font-semibold">{orders.length}</span>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noOrders')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('noOrdersDesc')}</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {t('order')} #{order.id}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {order.customerName} - {order.customerPhone}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ৳{order.totalAmount}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-sm text-gray-600">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {order.customerAddress}
                      </div>
                      {order.customerEmail && (
                        <div className="text-sm text-gray-600 mt-1">
                          <Mail className="inline h-4 w-4 mr-1" />
                          {order.customerEmail}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('viewDetails')}
                      </button>
                      
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value="pending">{t('pending')}</option>
                        <option value="confirmed">{t('confirmed')}</option>
                        <option value="shipped">{t('shipped')}</option>
                        <option value="delivered">{t('delivered')}</option>
                        <option value="cancelled">{t('cancelled')}</option>
                      </select>

                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowOrderDetails(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full mx-auto mt-12 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <div className="flex gap-2">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded">Download</button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded">Print</button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <input type="text" className="border rounded px-3 py-2 w-full" defaultValue={selectedOrder.customerName} />
                    <input type="text" className="border rounded px-3 py-2 w-full" defaultValue={selectedOrder.customerPhone} />
                    <input type="text" className="border rounded px-3 py-2 w-full" defaultValue={selectedOrder.customerAddress} />
                    <input type="email" className="border rounded px-3 py-2 w-full" defaultValue={selectedOrder.customerEmail || ""} />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="space-y-2">
                    <div><strong>Order ID:</strong> {selectedOrder.id}</div>
                    <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString('bn-BD')}</div>
                    <select className="border rounded px-3 py-2 w-full" defaultValue={selectedOrder.status}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select className="border rounded px-3 py-2 w-full" defaultValue={selectedOrder.paymentMethod}>
                      <option value="cash_on_delivery">Cash On Delivery</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Products</h3>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Image</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Product</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Price</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Quantity</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0) ? (
                        selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              {(item.productImage || item.image) && (
                                <img src={item.productImage || item.image} alt={item.productName || item.name} className="h-16 w-16 rounded" />
                              )}
                            </td>
                            <td className="px-4 py-2">{item.productName || item.name}</td>
                            <td className="px-4 py-2">৳{item.price}</td>
                            <td className="px-4 py-2">{item.quantity}</td>
                            <td className="px-4 py-2">৳{item.price * item.quantity}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No items found in order.</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right font-medium">Total:</td>
                        <td className="px-4 py-2 font-bold">৳{selectedOrder.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
