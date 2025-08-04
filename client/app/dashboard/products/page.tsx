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
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('products');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultProducts;
        }
      }
    }
    return defaultProducts;
  });
  useEffect(() => { setMounted(true); }, []);
  // Save products to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products]);
  if (!mounted) return null;

  const filters = [
    { id: 'all', label: 'All products', count: products.length },
    { id: 'gadgets', label: 'Gadgets', count: products.filter(p => p.category === 'Electronics').length },
    { id: 'camera', label: 'Camera', count: 0 },
    { id: 'electronics', label: 'Electronics', count: products.filter(p => p.category === 'Electronics').length }
  ];

  // Function to add new product
  const handleAddProduct = (productData: any) => {
    const newProduct: Product = {
      id: (products.length + 1).toString(),
      name: productData.name,
      sku: productData.sku || `${Date.now()}`,
      price: parseInt(productData.sellPrice) || 0,
      oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : undefined,
      buyPrice: productData.buyPrice ? parseFloat(productData.buyPrice) : undefined,
      stock: parseInt(productData.stock) || 0,
      sold: 0,
      category: productData.category || 'Uncategorized',
      images: productData.images || [],
      shortDesc: productData.shortDesc || '',
      desc: productData.desc || '',
      variants: productData.variants || [],
      details: productData.details || [],
      video: productData.video || ''
    };
    setProducts(prev => [...prev, newProduct]);
    setShowAdd(false); // Go back to products list
    // Show success message
    alert('প্রোডাক্ট সফলভাবে যোগ করা হয়েছে!');
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
