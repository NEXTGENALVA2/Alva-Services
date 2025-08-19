"use client";
import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import ProductTable from './ProductTable';
import AddProductForm from './AddProductForm';
import type { Product } from './ProductTable';

// Default products array (empty or with sample data)
const defaultProducts: Product[] = [];

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    setMounted(true);
    // ডাটাবেস থেকে প্রোডাক্ট লোড করুন
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          console.log('DEBUG: Fetched products:', data);
          console.log('DEBUG: First product structure:', data[0]);
          setProducts(data);
        }
      } catch (err) {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);
  if (!mounted) return null;

  const filters = [
    { id: 'all', label: 'All products', count: products.length },
    { id: 'gadgets', label: 'Gadgets', count: products.filter(p => p.category === 'Electronics').length },
    { id: 'camera', label: 'Camera', count: 0 },
    { id: 'electronics', label: 'Electronics', count: products.filter(p => p.category === 'Electronics').length }
  ];

  // Function to add new product
  const handleAddProduct = async (productData: any) => {
    try {
      // Send to backend API
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
      if (!token) {
        alert('লগিন টোকেন নেই! আবার লগিন করুন।');
        return;
      }
      
      // Convert base64 images to simple URLs (for demo purposes)
      // In production, you'd upload to cloud storage and get real URLs
      const imageUrls = productData.images && productData.images.length > 0 
        ? productData.images.map((img: string, index: number) => {
            // If it's already a base64 data URL, keep it as is for now
            // In production, upload to cloud storage first
            return img;
          })
        : [];

      console.log('DEBUG: productData received:', productData);
      console.log('DEBUG: productData.description:', productData.description);
      console.log('DEBUG: productData.desc:', productData.desc);
      console.log('DEBUG: productData.shortDesc:', productData.shortDesc);

      console.log('Sending product data:', {
        name: productData.name,
        description: productData.description,
        price: productData.price || 0,  // Use productData.price (already parsed number)
        stock: parseInt(productData.stock) || 0,
        images: imageUrls,
        variations: productData.variants || {}
      });

      console.log('Making API call with token:', token ? 'Token present' : 'NO TOKEN');

  const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          desc: productData.desc, // Full Description field
          shortDesc: productData.shortDesc,
          brand: productData.brand,
          sku: productData.sku,
          category: productData.category,
          condition: productData.condition,
          status: productData.status,
          price: productData.price || 0,
          oldPrice: productData.oldPrice,
          buyPrice: productData.buyPrice,
          stock: parseInt(productData.stock) || 0,
          unit: productData.unit,
          warranty: productData.warranty,
          video: productData.video,
          images: imageUrls,
          variants: productData.variants || {},
          details: productData.details || [],
          deliveryApplied: productData.deliveryApplied
        })
      });

      if (response.ok) {
        // নতুন প্রোডাক্ট ডাটাবেস থেকে আবার লোড করুন
        const res = await fetch('http://localhost:5000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
        setShowAdd(false);
        alert('প্রোডাক্ট সফলভাবে যোগ করা হয়েছে এবং আপনার ওয়েবসাইটে দেখা যাবে!');
      } else {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        let details = '';
        if (errorData.error) details += `\nError: ${errorData.error}`;
        if (errorData.details) details += `\nDetails: ${errorData.details}`;
        if (errorData.errors) details += `\nValidation: ${errorData.errors.join(', ')}`;
        alert(`সার্ভার এরর: ${errorData.message || 'প্রোডাক্ট সেভ করতে পারেনি'}${details}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('প্রোডাক্ট সেভ করতে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন এবং আবার চেষ্টা করুন।');
    }
  };

  return (
    <div>
      {!showAdd ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
              <p className="text-gray-600 mt-1">Manage your product inventory</p>
            </div>
            <button
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                <span className="ml-1 text-xs opacity-75">({filter.count})</span>
              </button>
            ))}
          </div>

          {/* Products Table */}
          <ProductTable products={products} setProducts={setProducts} />
        </>
      ) : (
        <>
          {/* Add Product Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setShowAdd(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          </div>

          {/* Add Product Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <AddProductForm onSubmit={handleAddProduct} />
          </div>
        </>
      )}
    </div>
  );
}
// Remove duplicate/extra code blocks at the end of the file
