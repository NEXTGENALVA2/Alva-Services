'use client';

import { useEffect, useState } from 'react';
import { Eye, Trash2, Package, Phone, MapPin, Mail, Calendar, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    images?: string[];
  }>;
  OrderItems?: Array<{
    Product: {
      name: string;
      price: number;
      quantity?: number;
      images?: string[];
      // add other product fields as needed
    };
    quantity?: number;
    // add other order item fields as needed
  }>;
  customerDivision?: string;
  customerDistrict?: string;
  vatTax?: number;
  deliveryCharge?: number;
  advancePayment?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  // For editing order details
  const [editDivision, setEditDivision] = useState<string>("");
  const [editDistrict, setEditDistrict] = useState<string>("");
  const [editDeliveryCharge, setEditDeliveryCharge] = useState<number>(0);
  const [advancePayment, setAdvancePayment] = useState<number>(0);

  // Calculate delivery charge based on district selection
  const calculateDeliveryCharge = (district: string) => {
    if (district === "Dhaka") return 60;
    else if (district) return 120;
    return 0;
  };

  // Calculate remaining amount after advance payment
  const calculateRemainingAmount = (total: number, advance: number) => {
    return Math.max(0, total - advance);
  };

  // Handle Download functionality - Generate PDF
  const handleDownload = async () => {
    if (!selectedOrder) return;
    
    try {
      // Create a temporary div with order details for PDF generation
      const element = document.createElement('div');
      element.style.padding = '20px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.backgroundColor = 'white';
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">Order Invoice</h1>
          <p style="color: #666;">Order ID: ${selectedOrder.id}</p>
          <p style="color: #666;">Date: ${new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3 style="color: #333; margin-bottom: 15px;">Customer Information</h3>
            <p><strong>Name:</strong> ${selectedOrder.customerName}</p>
            <p><strong>Phone:</strong> ${selectedOrder.customerPhone}</p>
            <p><strong>Email:</strong> ${selectedOrder.customerEmail || 'N/A'}</p>
            <p><strong>Address:</strong> ${selectedOrder.customerAddress}</p>
            <p><strong>Division:</strong> ${editDivision || 'N/A'}</p>
            <p><strong>District:</strong> ${editDistrict || 'N/A'}</p>
          </div>
          <div>
            <h3 style="color: #333; margin-bottom: 15px;">Order Information</h3>
            <p><strong>Status:</strong> ${selectedOrder.status}</p>
            <p><strong>Payment Method:</strong> ${selectedOrder.paymentMethod}</p>
            <p><strong>Advance Paid:</strong> ৳${advancePayment}</p>
            <p><strong>Remaining:</strong> ৳${calculateRemainingAmount(selectedOrder.totalAmount, advancePayment)}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 15px;">Products</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Image</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Quantity</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${await Promise.all((selectedOrder.OrderItems || selectedOrder.items || []).map(async (item: any) => {
                const name = item.Product?.name || item.productName || item.name || 'N/A';
                const price = item.Product?.price || item.price || 0;
                const quantity = item.Product?.quantity || item.quantity || 1;
                const total = price * quantity;
                
                // Get image URL
                const imageUrl = item.Product?.images?.[0] || item.productImage || item.image || '';
                let imageHtml = '<span style="color: #999;">No Image</span>';
                
                if (imageUrl) {
                  try {
                    // Convert image to base64 for better PDF compatibility
                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    const base64 = await new Promise((resolve) => {
                      reader.onloadend = () => resolve(reader.result);
                      reader.readAsDataURL(blob);
                    });
                    imageHtml = `<img src="${base64}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />`;
                  } catch (error) {
                    console.error('Error loading image:', error);
                    imageHtml = '<span style="color: #999;">Image Error</span>';
                  }
                }
                
                return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${imageHtml}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">৳${price}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">৳${total}</td>
                </tr>
                `;
              })).then(rows => rows.join(''))}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Sub Total:</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">৳${selectedOrder.totalAmount - editDeliveryCharge}</td>
              </tr>
              <tr>
                <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Delivery Charge:</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">৳${editDeliveryCharge}</td>
              </tr>
              <tr style="background-color: #f5f5f5;">
                <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold; font-size: 16px;">Total:</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold; font-size: 16px;">৳${selectedOrder.totalAmount}</td>
              </tr>
              <tr>
                <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; color: green; font-weight: bold;">Advance Paid:</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: green; font-weight: bold;">৳${advancePayment}</td>
              </tr>
              <tr>
                <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; color: red; font-weight: bold;">Remaining:</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: red; font-weight: bold;">৳${calculateRemainingAmount(selectedOrder.totalAmount, advancePayment)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
      
      // Temporarily add to DOM for rendering
      document.body.appendChild(element);
      
      // Generate canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white'
      });
      
      // Remove temporary element
      document.body.removeChild(element);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download PDF
      pdf.save(`order-${selectedOrder.id}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Handle Print functionality
  const handlePrint = () => {
    // Create a new window with print-optimized content
    const printWindow = window.open('', '_blank');
    if (!printWindow || !selectedOrder) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Invoice - ${selectedOrder.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 12px;
              line-height: 1.3; 
              color: #333;
              padding: 15px;
              max-width: 210mm;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .header h1 { 
              font-size: 20px; 
              margin-bottom: 5px; 
            }
            .header p { 
              font-size: 11px; 
              color: #666;
            }
            .info-section { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 15px;
              gap: 15px;
            }
            .info-box { 
              flex: 1;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 10px;
            }
            .info-box h3 { 
              margin-bottom: 8px; 
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 3px;
              font-size: 12px;
            }
            .info-box p { 
              margin-bottom: 3px; 
              line-height: 1.2;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px;
              font-size: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
              font-size: 10px;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { 
              background-color: #f9f9f9; 
              font-weight: bold;
              font-size: 11px;
            }
            .advance-row { color: #2563eb; }
            .remaining-row { color: #dc2626; }
            .product-img {
              width: 30px;
              height: 30px;
              object-fit: cover;
              border-radius: 3px;
            }
            .footer {
              margin-top: 15px;
              text-align: center;
              font-size: 9px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              body { 
                margin: 0; 
                padding: 0; 
                font-size: 10px;
                max-width: none;
              }
              .info-section { 
                flex-direction: row; 
                page-break-inside: avoid;
              }
              .info-box { 
                margin-bottom: 10px; 
                font-size: 9px;
                padding: 8px;
              }
              .info-box h3 { 
                font-size: 10px; 
              }
              table { 
                font-size: 8px; 
                page-break-inside: avoid;
              }
              th, td { 
                padding: 4px; 
                font-size: 8px;
              }
              .product-img {
                width: 25px;
                height: 25px;
              }
              .header h1 {
                font-size: 18px;
              }
              .footer {
                font-size: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order Invoice</h1>
            <p><strong>Order ID:</strong> ${selectedOrder.id} | <strong>Date:</strong> ${new Date(selectedOrder.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${selectedOrder.customerName}</p>
              <p><strong>Phone:</strong> ${selectedOrder.customerPhone}</p>
              <p><strong>Email:</strong> ${selectedOrder.customerEmail || 'N/A'}</p>
              <p><strong>Address:</strong> ${selectedOrder.customerAddress}</p>
              <p><strong>Division:</strong> ${editDivision || 'N/A'}</p>
              <p><strong>District:</strong> ${editDistrict || 'N/A'}</p>
            </div>
            <div class="info-box">
              <h3>Order Information</h3>
              <p><strong>Status:</strong> ${selectedOrder.status.toUpperCase()}</p>
              <p><strong>Payment Method:</strong> ${selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : selectedOrder.paymentMethod}</p>
              <p><strong>Total Amount:</strong> ৳${selectedOrder.totalAmount}</p>
              <p><strong>Advance Paid:</strong> ৳${advancePayment}</p>
              <p><strong>Remaining:</strong> ৳${calculateRemainingAmount(selectedOrder.totalAmount, advancePayment)}</p>
            </div>
          </div>
          
          <div>
            <h3 style="margin-bottom: 8px; font-size: 12px;">Products</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">Image</th>
                  <th>Product</th>
                  <th class="text-right" style="width: 60px;">Price</th>
                  <th class="text-center" style="width: 40px;">Qty</th>
                  <th class="text-right" style="width: 70px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${(selectedOrder.OrderItems || selectedOrder.items || []).map((item: any) => {
                  const name = item.Product?.name || item.productName || item.name || 'N/A';
                  const price = item.Product?.price || item.price || 0;
                  const quantity = item.Product?.quantity || item.quantity || 1;
                  const total = price * quantity;
                  const imageUrl = item.Product?.images?.[0] || item.productImage || item.image || '';
                  
                  return `
                    <tr>
                      <td class="text-center">
                        ${imageUrl ? `<img src="${imageUrl}" class="product-img" onerror="this.style.display='none';" />` : 'No Image'}
                      </td>
                      <td>${name}</td>
                      <td class="text-right">৳${price}</td>
                      <td class="text-center">${quantity}</td>
                      <td class="text-right">৳${total}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right"><strong>Sub Total:</strong></td>
                  <td class="text-right">৳${selectedOrder.totalAmount - editDeliveryCharge}</td>
                </tr>
                <tr>
                  <td colspan="4" class="text-right"><strong>Delivery Charge:</strong></td>
                  <td class="text-right">৳${editDeliveryCharge}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" class="text-right"><strong>Total:</strong></td>
                  <td class="text-right"><strong>৳${selectedOrder.totalAmount}</strong></td>
                </tr>
                <tr class="advance-row">
                  <td colspan="4" class="text-right"><strong>Advance Paid:</strong></td>
                  <td class="text-right"><strong>৳${advancePayment}</strong></td>
                </tr>
                <tr class="remaining-row">
                  <td colspan="4" class="text-right"><strong>Remaining:</strong></td>
                  <td class="text-right"><strong>৳${calculateRemainingAmount(selectedOrder.totalAmount, advancePayment)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for images to load, then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  // Handle Save functionality
  const handleSave = async () => {
    if (!selectedOrder) return;
    
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        customerDivision: editDivision,
        customerDistrict: editDistrict,
        advancePayment: advancePayment,
        deliveryCharge: editDeliveryCharge
      };
      
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        alert('Order updated successfully!');
        fetchOrders(); // Refresh orders list
        setShowOrderDetails(false);
      } else {
        alert('Failed to update order.');
      }
    } catch (error) {
      alert('Error updating order.');
      console.error('Save error:', error);
    }
  };

  // Bangladesh division & district data
  const divisions: { [key: string]: string[] } = {
    "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
    "Chattogram": ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Comilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati"],
    "Barisal": ["Barisal", "Barguna", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur"],
    "Khulna": ["Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
    "Mymensingh": ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
    "Rajshahi": ["Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj"],
    "Rangpur": ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
    "Sylhet": ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"]
  };

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


  console.log("DFASDFADS ASD FDASFASD FASDF A", selectedOrder );


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
                          setEditDivision(order.customerDivision || "");
                          setEditDistrict(order.customerDistrict || "");
                          setEditDeliveryCharge(order.deliveryCharge || 0);
                          setAdvancePayment(order.advancePayment || 0);
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
                  <button 
                    onClick={handleDownload}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Download
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Print
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
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
                    <select 
                      className="border rounded px-3 py-2 w-full" 
                      value={editDivision} 
                      onChange={e => {
                        setEditDivision(e.target.value);
                        setEditDistrict("");
                        setEditDeliveryCharge(0);
                      }}
                    >
                      <option value="">Select Division</option>
                      {Object.keys(divisions).map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                    <select 
                      className="border rounded px-3 py-2 w-full" 
                      value={editDistrict} 
                      onChange={e => {
                        const selectedDistrict = e.target.value;
                        setEditDistrict(selectedDistrict);
                        const newDeliveryCharge = calculateDeliveryCharge(selectedDistrict);
                        setEditDeliveryCharge(newDeliveryCharge);
                      }}
                      disabled={editDivision === ""}
                    >
                      <option value="">Select District</option>
                      {editDivision !== "" && divisions[editDivision] && divisions[editDivision].map((district: string) => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      className="border rounded px-3 py-2 w-full" 
                      value={advancePayment === 0 ? "" : advancePayment} 
                      onChange={e => {
                        const value = e.target.value === "" ? 0 : Number(e.target.value);
                        if (value < 0) {
                          alert("Advance payment cannot be negative!");
                          return;
                        }
                        if (value > selectedOrder.totalAmount) {
                          alert("Advance payment cannot be more than total amount!");
                          return;
                        }
                        setAdvancePayment(value);
                      }}
                      placeholder="0" 
                      min="0"
                      max={selectedOrder.totalAmount}
                    />
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
                      {(selectedOrder.OrderItems && Array.isArray(selectedOrder.OrderItems) && selectedOrder.OrderItems.length > 0) ? (
                        selectedOrder.OrderItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              {item.Product.images && item.Product.images.length > 0 ? (
                                <img
                                  src={item.Product.images[0]}
                                  alt={item.Product.name}
                                  className="h-16 w-16 rounded"
                                />
                              ) : (
                                <span className="text-gray-400">No image</span>
                              )}
                            </td>
                            <td className="px-4 py-2">{item.Product.name}</td>
                            <td className="px-4 py-2">৳{item.Product.price}</td>
                            <td className="px-4 py-2">{item.Product.quantity || item.quantity}</td>
                            <td className="px-4 py-2">৳{item.Product.price * (item.Product.quantity || item.quantity || 1)}</td>
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
                        <td colSpan={4} className="px-4 py-2 text-right font-medium">Sub Total:</td>
                        <td className="px-4 py-2">৳{selectedOrder.totalAmount - editDeliveryCharge}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right font-medium">VAT/TAX (0%):</td>
                        <td className="px-4 py-2">৳{selectedOrder.vatTax ?? 0}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right font-medium">Delivery Charge:</td>
                        <td className="px-4 py-2">৳{editDeliveryCharge}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan={4} className="px-4 py-2 text-right font-bold text-lg">Total:</td>
                        <td className="px-4 py-2 font-bold text-lg">৳{selectedOrder.totalAmount}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right font-medium">Advance Paid:</td>
                        <td className="px-4 py-2 font-medium text-green-600">৳{advancePayment}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right font-bold">Remaining:</td>
                        <td className="px-4 py-2 font-bold text-red-600">৳{calculateRemainingAmount(selectedOrder.totalAmount, advancePayment)}</td>
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
