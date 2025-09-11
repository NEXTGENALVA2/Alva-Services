'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '../../components/CartContext';
import { useTheme } from '../../components/ThemeContext';
import axios from 'axios';
import { ShoppingCart, Plus, Minus, Star, Menu, X, Search, Heart, User, Globe } from 'lucide-react';
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"

function BannerSlider({ domain }: { domain: string }) {
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    fetch(`http://localhost:5000/api/banner?domain=${domain}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
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
    <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg">
      {banners.map((banner, index) => (
        <div
          key={banner.id || index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title || `Banner ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {banner.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <h3 className="text-lg font-semibold">{banner.title}</h3>
              {banner.description && (
                <p className="text-sm opacity-90">{banner.description}</p>
              )}
            </div>
          )}
        </div>
      ))}
      
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full ${
                index === current ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Translation function
const t = (key: string, currentLang: string) => {
  const translations: any = {
    'bn': {
      'search': 'খুঁজুন...',
      'allProducts': 'সব পণ্য',
      'newArrivals': 'নতুন এসেছে',
      'addToCart': 'কার্টে যোগ করুন',
      'buyNow': 'এখনই কিনুন',
      'outOfStock': 'স্টকে নেই',
      'viewProduct': 'পণ্য দেখুন',
      'categories': 'ক্যাটাগরি',
      'home': 'হোম'
    },
    'en': {
      'search': 'Search...',
      'allProducts': 'All Products',
      'newArrivals': 'New Arrivals',
      'addToCart': 'Add to Cart',
      'buyNow': 'Buy Now',
      'outOfStock': 'Out of Stock',
      'viewProduct': 'View Product',
      'categories': 'Categories',
      'home': 'Home'
    }
  };
  return translations[currentLang]?.[key] || key;
};

export default function Page({ params }: { params: { domain: string } }) {
  const { cart, addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('bn');
  const [website, setWebsite] = useState<any>(null);

  useEffect(() => {
    const lang = localStorage.getItem('language') || 'bn';
    setCurrentLang(lang);
    fetchWebsiteData();
    fetchProducts();
  }, [params.domain]);

  const fetchWebsiteData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/website/domain/${params.domain}`);
      if (response.ok) {
        const data = await response.json();
        setWebsite(data);
      }
    } catch (error) {
      console.error('Error fetching website data:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/domain/${params.domain}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((p: any) => p.category).filter(Boolean))] as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: 1
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">
                {website?.name || params.domain}
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
                {t('home', currentLang)}
              </a>
              <a href="#products" className="text-sm font-medium hover:text-primary transition-colors">
                {t('allProducts', currentLang)}
              </a>
              <a href="#categories" className="text-sm font-medium hover:text-primary transition-colors">
                {t('categories', currentLang)}
              </a>
            </nav>

            {/* Search and Cart */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <Input
                  type="search"
                  placeholder={t('search', currentLang)}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cart.length}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden py-4">
            <Input
              type="search"
              placeholder={t('search', currentLang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="container mx-auto px-4 py-6">
        <BannerSlider domain={params.domain} />
      </section>

      {/* Categories Filter */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('')}
          >
            {t('allProducts', currentLang)}
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">
          {selectedCategory ? selectedCategory : t('allProducts', currentLang)}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product: any) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {product.name}
                </CardTitle>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ৳{product.price}
                  </span>
                  {product.category && (
                    <Badge variant="secondary">{product.category}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t('addToCart', currentLang)}
                  </Button>
                  <Button variant="outline" className="w-full">
                    {t('buyNow', currentLang)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">কোনো পণ্য পাওয়া যায়নি।</p>
          </div>
        )}
      </section>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-background shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{currentLang === 'bn' ? 'মেনু' : 'Menu'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="space-y-4">
                <a
                  href="#"
                  className="block text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('home', currentLang)}
                </a>
                <a
                  href="#products"
                  className="block text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('allProducts', currentLang)}
                </a>
                <a
                  href="#categories"
                  className="block text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('categories', currentLang)}
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
