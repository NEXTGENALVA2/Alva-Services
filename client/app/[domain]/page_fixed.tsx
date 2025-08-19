'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Star, Menu, X, Search, Heart, User, Globe } from 'lucide-react';

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
      continueShopping: 'কেনাকাটা চালিয়ে যান'
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
      continueShopping: 'Continue Shopping'
    }
  };
  
  return translations[lang]?.[key] || key;
};

export default function Page({ params }: { params: { domain: string } }) {
  const [website, setWebsite] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('bn');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  // Language management
  useEffect(() => {
    const savedLang = localStorage.getItem('websiteLanguage') || 'bn';
    setCurrentLang(savedLang);
  }, []);

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang);
    localStorage.setItem('websiteLanguage', lang);
  };

  // Fetch website data
  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const response = await fetch(`/api/websites?domain=${params.domain}`);
        const data = await response.json();
        
        if (data.success) {
          setWebsite(data.website);
          setProducts(data.website.products || []);
        }
      } catch (error) {
        console.error('Error fetching website:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [params.domain]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${params.domain}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [params.domain]);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(`cart_${params.domain}`, JSON.stringify(cart));
  }, [cart, params.domain]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0] || ''
      }];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert(t('fillAllFields', currentLang));
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: website._id,
          items: cart,
          customerInfo,
          total: getTotalPrice()
        })
      });

      if (response.ok) {
        alert(t('orderSuccess', currentLang));
        setCart([]);
        setShowCheckout(false);
        setCustomerInfo({ name: '', phone: '', address: '', email: '' });
      } else {
        throw new Error('Order failed');
      }
    } catch (error) {
      alert(t('orderFailed', currentLang));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('websiteNotFound', currentLang)}</h1>
        </div>
      </div>
    );
  }

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 8);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);
  const banners = website.banners || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">{website.name}</h1>
            </div>

            {/* Search Bar - Desktop */}
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

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="relative group">
                <button className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-600">{t('language', currentLang)}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button
                    onClick={() => changeLanguage('bn')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${currentLang === 'bn' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                  >
                    {t('bangla', currentLang)}
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${currentLang === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                  >
                    {t('english', currentLang)}
                  </button>
                </div>
              </div>

              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                <span className="text-sm text-gray-600">{t('cart', currentLang)}</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Category Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8 py-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category === 'all' ? t('allProducts', currentLang) : category}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Banner */}
      {banners.length > 0 && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={banners[0].image || '/placeholder-banner.jpg'}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {banners[0].title || t('welcome', currentLang)}
              </h2>
              <p className="text-lg md:text-xl">
                {banners[0].subtitle || t('stayWithUs', currentLang)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('newArrivals', currentLang)}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-green-600 mb-3">{t('currency', currentLang)}{product.price}</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t('addToCart', currentLang)}
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
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {t('bestSeller', currentLang)}
                  </div>
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-green-600 mb-3">{t('currency', currentLang)}{product.price}</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t('addToCart', currentLang)}
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
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
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
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {t('addToCart', currentLang)}
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
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{t('cart', currentLang)}</h2>
              <button onClick={() => setShowCart(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">{t('emptyCart', currentLang)}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-green-600 font-semibold">{t('currency', currentLang)}{item.price}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">{t('total', currentLang)}:</span>
                  <span className="text-lg font-bold text-green-600">{t('currency', currentLang)}{getTotalPrice()}</span>
                </div>
                <button
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-semibold"
                >
                  {t('orderNow', currentLang)}
                </button>
              </div>
            )}
          </div>
        </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('email', currentLang)}</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-semibold mb-2">{t('orderSummary', currentLang)}</h3>
                  <div className="space-y-1 text-sm">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>{t('currency', currentLang)}{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t pt-1 font-semibold flex justify-between">
                      <span>{t('total', currentLang)}:</span>
                      <span>{t('currency', currentLang)}{getTotalPrice()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    {t('cancel', currentLang)}
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
