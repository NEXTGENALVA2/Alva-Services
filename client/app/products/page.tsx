"use client";
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';

const ProductTable = dynamic(() => import('./ProductTable'), { ssr: false });
const AddProductForm = dynamic(() => import('./AddProductForm'), { ssr: false });

export default function ProductsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All products', count: 29 },
    { id: 'gadgets', label: 'Gadgets', count: 15 },
    { id: 'camera', label: 'Camera', count: 8 },
    { id: 'electronics', label: 'Electronics', count: 12 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {!showAdd ? (
        <div className="p-6">
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
          <ProductTable />
        </div>
      ) : (
        <div className="p-6">
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
            <AddProductForm />
          </div>
        </div>
      )}
    </div>
  );
}
