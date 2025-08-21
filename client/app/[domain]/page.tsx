'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '../../components/CartContext';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Star, Menu, X, Search, Heart, User, Globe } from 'lucide-react';

function BannerSlider({ domain }: { domain: string }) {
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    fetch(`http://localhost:5000/api/banner?domain=${domain}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          // Filter only valid imageUrl
          const valid = (Array.isArray(data) ? data : data ? [data] : []).filter(b => b && b.imageUrl && b.imageUrl !== 'null');
          setBanners(valid);
        }
      })
      .catch(error => {
        if (isMounted) {
          console.error('Banner fetch error:', error);
          setBanners([]);
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, [domain]);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrent(c => (c + 1) % banners.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setCurrent(0);
    }
  }, [banners]);

  if (!banners.length) return null;

  return (
    <div className="relative h-64 md:h-96 overflow-hidden bg-gray-200">
      <img
        src={`http://localhost:5000${banners[current].imageUrl}`}
        alt="Banner"
        className="w-full h-full object-cover transition-all duration-700"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <span key={i} className={`w-3 h-3 rounded-full ${i === current ? 'bg-white' : 'bg-gray-400'}`}></span>
          ))}
        </div>
      )}
    </div>
  );
}

const MemoizedBannerSlider = React.memo(BannerSlider);

function CartSidebar({ 
  cart, 
  setCart, 
  updateQuantity, 
  removeFromCart, 
  getTotalPrice, 
  params, 
  currentLang, 
  setShowCart 
}: {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  getTotalPrice: () => number;
  params: { domain: string };
  currentLang: string;
  setShowCart: (show: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">{t('cart', currentLang)}</h2>
            <button onClick={() => setShowCart(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('emptyCart', currentLang)}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{t('currency', currentLang)}{item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="font-semibold text-gray-900">{t('currency', currentLang)}{item.price * item.quantity}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">{t('total', currentLang)}:</span>
                  <span className="text-lg font-bold text-green-600">{t('currency', currentLang)}{getTotalPrice()}</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem(`cart_${params.domain}`, JSON.stringify(cart));
                    window.location.href = `/${params.domain}/checkout`;
                  }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  {t('orderNow', currentLang)}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Translation function
const t = (key: string, lang: string = 'bn'): string => {
  const translations: Record<string, Record<string, string>> = {
    bn: {
      language: 'ভাষা',
      bangla: 'বাংলা',
      english: 'English',
      searchPlaceholder: 'পণ্য খুঁজুন...',
      allProducts: 'সব পণ্য',
      cart: 'কার্ট',
      viewCart: 'কার্ট দেখুন',
      emptyCart: 'আপনার কার্ট খালি',
      total: 'মোট',
      currency: '৳',
      orderNow: 'অর্ডার করুন',
      customerInfo: 'গ্রাহকের তথ্য',
      name: 'নাম',
      phone: 'ফোন',
      address: 'ঠিকানা',
      email: 'ইমেইল',
      placeOrder: 'অর্ডার দিন',
      cancel: 'বাতিল',
      orderSummary: 'অর্ডার সামারি',
      welcome: 'স্বাগতম',
      stayWithUs: 'আমাদের সাথে থাকুন',
      newArrivals: 'নতুন এসেছে',
      bestSellers: 'বেস্ট সেলার',
      bestSeller: 'বেস্ট সেলার',
      addToCart: 'কার্টে যোগ করুন',
      noProducts: 'কোনো পণ্য পাওয়া যায়নি।',
      inStock: 'স্টকে আছে',
      outOfStock: 'স্টক নেই',
      products: 'টি পণ্য',
      quantity: 'পরিমাণ',
      continueShopping: 'কেনাকাটা চালিয়ে যান',
      websiteNotFound: 'ওয়েবসাইট পাওয়া যায়নি',
      fillAllFields: 'অনুগ্রহ করে সব তথ্য পূরণ করুন।',
      orderSuccess: 'অর্ডার সফলভাবে দেওয়া হয়েছে!',
      orderFailed: 'অর্ডার দিতে ব্যর্থ। আবার চেষ্টা করুন।'
    },
    en: {
      language: 'Language',
      bangla: 'বাংলা',
      english: 'English',
      searchPlaceholder: 'Search products...',
      allProducts: 'All Products',
      cart: 'Cart',
      viewCart: 'View Cart',
      emptyCart: 'Your cart is empty',
      total: 'Total',
      currency: '৳',
      orderNow: 'Order Now',
      customerInfo: 'Customer Information',
      name: 'Name',
      phone: 'Phone',
      address: 'Address',
      email: 'Email',
      placeOrder: 'Place Order',
      cancel: 'Cancel',
      orderSummary: 'Order Summary',
      welcome: 'Welcome',
      stayWithUs: 'Stay with us',
      newArrivals: 'New Arrivals',
      bestSellers: 'Best Sellers',
      bestSeller: 'Best Seller',
      addToCart: 'Add to Cart',
      noProducts: 'No products found.',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      products: 'products',
      quantity: 'Quantity',
      continueShopping: 'Continue Shopping',
      websiteNotFound: 'Website not found',
      fillAllFields: 'Please fill all required fields.',
      orderSuccess: 'Order placed successfully!',
      orderFailed: 'Failed to place order. Please try again.'
    }
  };
  
  return translations[lang]?.[key] || key;
};

export default function Page({ params }: { params: { domain: string } }) {
  const [website, setWebsite] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, setCart, updateQuantity, removeFromCart, addToCart: addToCartContext } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [banner, setBanner] = useState<string>("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentLang, setCurrentLang] = useState('bn');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  useEffect(() => {
    // Load saved language
    const savedLang = localStorage.getItem('websiteLang') || 'bn';
    setCurrentLang(savedLang);
    
    // ওয়েবসাইট ও প্রোডাক্ট ডাটা fetch করবে (asynchronous)
    const fetchWebsiteData = async () => {
      try {
        setLoading(true);
        const [websiteRes, bannerRes] = await Promise.all([
          fetch(`http://localhost:5000/api/websites/public/${params.domain}`),
          axios.get(`http://localhost:5000/api/banner?domain=${params.domain}`).catch(() => null)
        ]);
        
        if (websiteRes.ok) {
          const data = await websiteRes.json();
          setWebsite(data.website);
          setProducts(data.products || []);
        } else {
          setWebsite(null);
          setProducts([]);
        }

        // Set banner if available
        if (bannerRes && bannerRes.data && bannerRes.data.imageUrl) {
          setBanner(`http://localhost:5000${bannerRes.data.imageUrl}`);
        }
      } catch (error) {
        setWebsite(null);
        setProducts([]);
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWebsiteData();
  }, [params.domain]);

  // Context-based cart functions
  const addToCart = (product: any) => {
    const pid = (product?.id ?? product?._id ?? '').toString();
    if (!pid) {
      console.warn('[cart] addToCart skipped: missing product id', product);
      return;
    }
    
    const cartItem = {
      id: pid,
      name: product?.name ?? product?.title ?? 'Product',
      price: Number(product?.price ?? product?.sellingPrice ?? 0) || 0,
      quantity: 1,
      image: product?.images?.[0] || product?.image || product?.imageUrl || ''
    };
    
    console.debug('[cart] addToCart via context', pid);
    addToCartContext(cartItem, params.domain);
  };

const getTotalPrice = () => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

  // Category with subcategories structure (dynamic from localStorage)
  const [categoryStructure, setCategoryStructure] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('categorySubcategories');
      if (stored) return JSON.parse(stored);
    }
    return {
      'Electronics': ['Mobile', 'Laptop', 'Headphones', 'Accessories'],
      'Fashion': ['Men\'s Wear', 'Women\'s Wear', 'Kids Wear', 'Shoes'],
      'Home & Garden': ['Furniture', 'Kitchen', 'Decoration', 'Tools'],
      'Health & Beauty': ['Skincare', 'Makeup', 'Health Products', 'Personal Care'],
      'Sports': ['Fitness', 'Outdoor', 'Sports Wear', 'Equipment'],
      'Books': ['Fiction', 'Non-Fiction', 'Educational', 'Children\'s Books']
    };
  });

  // Update category structure from localStorage
  useEffect(() => {
    const updateCategoryStructure = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('categorySubcategories');
        if (stored) {
          setCategoryStructure(JSON.parse(stored));
        }
      }
    };
    
    // Listen for storage changes
    window.addEventListener('storage', updateCategoryStructure);
    updateCategoryStructure();
    
    return () => window.removeEventListener('storage', updateCategoryStructure);
  }, []);

  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const categories = ['all', ...Object.keys(categoryStructure), ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const newArrivals = products.slice(-4);
  const bestSellers = products.filter(p => p.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, 4);

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert(t('fillAllFields', currentLang));
      return;
    }

    try {
      const orderData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        customerEmail: customerInfo.email,
        items: cart,
        totalAmount: getTotalPrice(),
        paymentMethod: 'cash_on_delivery',
        websiteId: website?.id
      };

      console.log('Order Data:', orderData);
      console.log('Website ID:', website?.id);
      console.log('Cart:', cart);

      // Send order to backend
      const res = await fetch(`http://localhost:5000/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const order = await res.json();
        alert(t('orderSuccess', currentLang));
        setCart([]);
        setShowCheckout(false);
        setCustomerInfo({ name: '', phone: '', address: '', email: '' });
        
        // Generate and print invoice
        generateInvoice(order);
      } else {
        alert(t('orderFailed', currentLang));
      }
    } catch (error) {
      alert(t('orderFailed', currentLang));
    }
  };

  const generateInvoice = (order: any) => {
    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total { text-align: right; font-size: 18px; font-weight: bold; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${website.name}</h1>
          <p>Invoice #${order.id}</p>
          <p>Date: ${new Date().toLocaleDateString('bn-BD')}</p>
        </div>
        
        <div class="invoice-details">
          <h3>Customer Information:</h3>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Phone:</strong> ${order.customerPhone}</p>
          <p><strong>Address:</strong> ${order.customerAddress}</p>
          ${order.customerEmail ? `<p><strong>Email:</strong> ${order.customerEmail}</p>` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>৳${item.price}</td>
                <td>৳${item.price * item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p>Total Amount: ৳${getTotalPrice()}</p>
          <p>Payment Method: Cash on Delivery</p>
        </div>
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer;">Print Invoice</button>
        </div>
      </body>
      </html>
    `;
    
    invoiceWindow?.document.write(invoiceHTML);
    invoiceWindow?.document.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading website...</p>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold text-red-600 mb-4">{t('websiteNotFound', currentLang)}</h1>
        <p className="text-gray-700">আপনার দেওয়া ঠিকানায় কোনো ওয়েবসাইট নেই।</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{website.name}</h1>
            </div>
            
            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder', currentLang)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <select
                value={currentLang}
                onChange={(e) => {
                  setCurrentLang(e.target.value);
                  localStorage.setItem('websiteLang', e.target.value);
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="bn">বাংলা</option>
                <option value="en">English</option>
              </select>
              
              <Heart className="h-6 w-6 text-gray-600 cursor-pointer hover:text-red-500" />
              <User className="h-6 w-6 text-gray-600 cursor-pointer hover:text-blue-500" />
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-blue-500"
              >
                <ShoppingCart className="h-6 w-6" />
                {cart.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    data-cart-count
                  >
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button
                className="md:hidden"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Navigation with Subcategories */}
          <nav className="hidden md:flex space-x-6 py-4">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
              }}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('allProducts', currentLang)}
            </button>
            
            {Object.keys(categoryStructure).map(category => (
              <div key={category} className="relative group">
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedSubcategory('all');
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
                
                {/* Subcategory Dropdown */}
                <div className="absolute left-0 top-full mt-1 w-48 bg-white shadow-lg rounded-md border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedSubcategory('all');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      All {category}
                    </button>
                    {categoryStructure[category as keyof typeof categoryStructure].map((subcategory: string) => (
                      <button
                        key={subcategory}
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedSubcategory(subcategory);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          selectedSubcategory === subcategory ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </header>

  {/* Banner Slider */}
  <MemoizedBannerSlider domain={params.domain} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('newArrivals', currentLang)}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/${params.domain}/products/${product.id}`}
                >
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-green-600 mb-3">{t('currency', currentLang)}{product.price}</p>
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(product); }}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mb-2"
                    >
                      {t('addToCart', currentLang)}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        // Add product to existing cart (don't replace)
                        addToCart(product);
                        // Redirect to checkout
                        window.location.href = `/${params.domain}/checkout`;
                      }}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('bestSellers', currentLang)}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {bestSellers.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative cursor-pointer"
                  onClick={() => window.location.href = `/${params.domain}/products/${product.id}`}
                >
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {t('bestSeller', currentLang)}
                  </div>
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-green-600 mb-3">{t('currency', currentLang)}{product.price}</p>
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(product); }}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mb-2"
                    >
                      {t('addToCart', currentLang)}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        // Add product to existing cart (don't replace)
                        addToCart(product);
                        // Redirect to checkout
                        window.location.href = `/${params.domain}/checkout`;
                      }}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'all' ? t('allProducts', currentLang) : selectedCategory}
          </h2>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">{t('noProducts', currentLang)}</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/${params.domain}/products/${product.id}`}
                >
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                      }}
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-green-600">{t('currency', currentLang)}{product.price}</span>
                      {product.stock !== undefined && (
                        <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? `${t('inStock', currentLang)} (${product.stock})` : t('outOfStock', currentLang)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(product); }}
                      disabled={product.stock === 0}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mb-2"
                    >
                      {t('addToCart', currentLang)}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        // Add product to existing cart (don't replace)
                        addToCart(product);
                        // Redirect to checkout
                        window.location.href = `/${params.domain}/checkout`;
                      }}
                      disabled={product.stock === 0}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          cart={cart}
          setCart={setCart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          getTotalPrice={getTotalPrice}
          params={params}
          currentLang={currentLang}
          setShowCart={setShowCart}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCheckout(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t('customerInfo', currentLang)}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('name', currentLang)} *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone', currentLang)} *</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('address', currentLang)} *</label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('email', currentLang)} ({currentLang === 'bn' ? 'ঐচ্ছিক' : 'Optional'})</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">{currentLang === 'bn' ? 'অর্ডার সারাংশ' : 'Order Summary'}</h3>
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>{t('currency', currentLang)}{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>{t('total', currentLang)}:</span>
                        <span>{t('currency', currentLang)}{getTotalPrice()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{currentLang === 'bn' ? 'পেমেন্ট: ক্যাশ অন ডেলিভারি' : 'Payment: Cash on Delivery'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {currentLang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {t('placeOrder', currentLang)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{currentLang === 'bn' ? 'মেনু' : 'Menu'}</h2>
                <button onClick={() => setShowMobileMenu(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowMobileMenu(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      selectedCategory === category
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category === 'all' ? t('allProducts', currentLang) : category}
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder', currentLang)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}