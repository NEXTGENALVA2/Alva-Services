"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash2, Search, Filter } from 'lucide-react';

interface VariantOption {
  attribute: string;
  extraPrice: string;
}
interface ProductVariant {
  mandatory: boolean;
  title: string;
  options: VariantOption[];
}
interface ProductDetail {
  type: string;
  description: string;
}
interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  sold?: number;
  images?: string[];
  category?: string;
  shortDesc?: string;
  desc?: string;
  variants?: ProductVariant[];
  details?: ProductDetail[];
  video?: string;
}

interface ProductTableProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export default function ProductTable({ products, setProducts }: ProductTableProps) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);

  // Safe stub for delete handler used by UI (backup file)
  const handleDeleteProduct = (id: string) => {
    // Remove locally to avoid TS error in backup component; actual implementation may call API
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  useEffect(() => {
    // Uncomment when backend is ready
    // axios.get('/api/products', {
    //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    // })
    //   .then(res => setProducts(res.data))
    //   .catch(() => setProducts([]))
    //   .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="text-gray-600">Loading products...</div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">All Products</h2>
            <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} products found</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product, index) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={e => {
                  // Only trigger if not clicking on a button or svg
                  if ((e.target as HTMLElement).closest('button,svg')) return;
                  setSelectedProduct(product);
                  setEditedProduct({ ...product });
                  setIsEditing(false);
                }}
              >
      {/* Product Details/Edit Modal - EcomEasy Style */}
      {selectedProduct && editedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 relative overflow-hidden max-h-[95vh]">
            {/* Header - EcomEasy Style */}
            <div className="bg-white px-6 py-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setEditedProduct(null);
                    setIsEditing(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back to Products
                </button>
                <h2 className="text-xl font-semibold">
                  {isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-purple-100 text-purple-600 px-3 py-1 rounded text-sm hover:bg-purple-200">
                  View in site
                </button>
                <button className="text-gray-400 hover:text-gray-600 text-sm">
                  Copy
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setEditedProduct(null);
                    setIsEditing(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex max-h-[calc(95vh-80px)]">
              {/* Left Content Area */}
              <div className="flex-1 overflow-y-auto bg-white">
                {/* Main Content */}
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-6">
                    {isEditing ? 'Edit Product' : 'Add Product'}
                  </h1>

                  {/* Product Name and Category Row */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Name *</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter product name"
                          value={editedProduct?.name || ''}
                          onChange={(e) => setEditedProduct({...editedProduct, name: e.target.value})}
                        />
                      ) : (
                        <p className="py-2 text-gray-700">{selectedProduct?.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Enter category"
                          value={editedProduct?.category || ''}
                          onChange={(e) => setEditedProduct({...editedProduct, category: e.target.value})}
                        />
                      ) : (
                        <p className="py-2 text-gray-700">{selectedProduct?.category || 'No category'}</p>
                      )}
                    </div>
                  </div>

                  {/* Brand and SKU Row */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Brand</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Enter brand"
                        />
                      ) : (
                        <p className="py-2 text-gray-700">-</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Enter SKU"
                          value={editedProduct?.sku || ''}
                          onChange={(e) => setEditedProduct({...editedProduct, sku: e.target.value})}
                        />
                      ) : (
                        <p className="py-2 text-gray-700">{selectedProduct?.sku || '-'}</p>
                      )}
                    </div>
                  </div>

                  {/* Short Description and Full Description Row */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Short Description</label>
                      {isEditing ? (
                        <textarea
                          className="w-full border border-gray-300 rounded px-3 py-2 h-20 resize-none"
                          placeholder="Short description for SKU"
                          value={editedProduct?.shortDesc || ''}
                          onChange={(e) => setEditedProduct({...editedProduct, shortDesc: e.target.value})}
                        />
                      ) : (
                        <p className="py-2 text-gray-700 min-h-[60px]">{selectedProduct?.shortDesc || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Description</label>
                      {isEditing ? (
                        <textarea
                          className="w-full border border-gray-300 rounded px-3 py-2 h-20 resize-none"
                          placeholder="Detailed product description"
                          value={editedProduct?.desc || ''}
                          onChange={(e) => setEditedProduct({...editedProduct, desc: e.target.value})}
                        />
                      ) : (
                        <p className="py-2 text-gray-700 min-h-[60px] whitespace-pre-line">{selectedProduct?.desc || '-'}</p>
                      )}
                    </div>
                  </div>

                  {/* Pricing Row */}
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Selling Price *</label>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="0.00"
                          value={editedProduct?.price || ''}
                          onChange={(e) => setEditedProduct({...editedProduct, price: Number(e.target.value)})}
                        />
                      ) : (
                        <p className="py-2 text-gray-700">৳{selectedProduct?.price?.toLocaleString()}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Original Price</label>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="0.00"
                        />
                      ) : (
                        <p className="py-2 text-gray-700">-</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Buy Price</label>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="0.00"
                        />
                      ) : (
                        <p className="py-2 text-gray-700">-</p>
                      )}
                    </div>
                  </div>

                  {/* Inventory Row */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="0"
                          value={editedProduct?.stock || ''}
                          onChange={(e) => setEditedProduct({...editedProduct, stock: Number(e.target.value)})}
                        />
                      ) : (
                        <p className="py-2 text-gray-700">{selectedProduct?.stock}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Unit</label>
                      {isEditing ? (
                        <select className="w-full border border-gray-300 rounded px-3 py-2">
                          <option>pcs, kg, etc.</option>
                          <option>pcs</option>
                          <option>kg</option>
                          <option>ltr</option>
                        </select>
                      ) : (
                        <p className="py-2 text-gray-700">pcs</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Condition</label>
                      {isEditing ? (
                        <select className="w-full border border-gray-300 rounded px-3 py-2">
                          <option>New</option>
                          <option>Used</option>
                          <option>Refurbished</option>
                        </select>
                      ) : (
                        <p className="py-2 text-gray-700">New</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      {isEditing ? (
                        <select className="w-full border border-gray-300 rounded px-3 py-2">
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      ) : (
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Product Images</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="text-gray-500">
                        <p className="mb-1">Choose Files | No file chosen</p>
                        <p className="text-xs">Upload file. Images (JPG, PNG, GIF)</p>
                      </div>
                    </div>
                  </div>

                  {/* Video URL */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Video URL</label>
                    {isEditing ? (
                      <input
                        type="url"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="https://youtube.com/watch?v=..."
                        value={editedProduct?.video || ''}
                        onChange={(e) => setEditedProduct({...editedProduct, video: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 text-gray-700">{selectedProduct?.video || '-'}</p>
                    )}
                  </div>

                  {/* Product Variants */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Product Variants</h3>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                        Add Variant
                      </button>
                    </div>
                    
                    {selectedProduct?.variants?.map((variant, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center mb-3">
                          <input 
                            type="checkbox" 
                            checked={variant.mandatory} 
                            className="mr-2 w-4 h-4 text-blue-600" 
                            readOnly
                          />
                          <span className="text-sm font-medium">Mandatory</span>
                        </div>
                        <div className="mb-3">
                          <input
                            type="text"
                            value={variant.title}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            placeholder="Variant Title (e.g. Size, Color)"
                            readOnly={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          {variant.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-3">
                              <input
                                type="text"
                                value={option.attribute}
                                className="flex-1 border border-gray-300 rounded px-3 py-2"
                                placeholder="Option (e.g. Small, Red)"
                                readOnly={!isEditing}
                              />
                              <input
                                type="text"
                                value={option.extraPrice}
                                className="w-24 border border-gray-300 rounded px-3 py-2"
                                placeholder="Price"
                                readOnly={!isEditing}
                              />
                              {isEditing && (
                                <button className="text-red-500 hover:text-red-700 text-sm">
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {isEditing && (
                          <button className="text-blue-600 hover:text-blue-800 text-sm mt-2">
                            + Add Option
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Product Details */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Product Details</h3>
                      <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                        Add Detail
                      </button>
                    </div>
                    
                    {selectedProduct?.details?.map((detail, index) => (
                      <div key={index} className="flex gap-3 mb-3">
                        <input
                          type="text"
                          value={detail.type}
                          className="w-1/3 border border-gray-300 rounded px-3 py-2"
                          placeholder="Detail Type (e.g. Material, Weight)"
                          readOnly={!isEditing}
                        />
                        <input
                          type="text"
                          value={detail.description}
                          className="flex-1 border border-gray-300 rounded px-3 py-2"
                          placeholder="Description"
                          readOnly={!isEditing}
                        />
                        {isEditing && (
                          <button className="text-red-500 hover:text-red-700 text-sm">
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Delivery Charges */}
                  <div className="flex items-center mb-6">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-blue-600" />
                    <label className="text-sm">Apply delivery charges</label>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - EcomEasy Style */}
              <div className="w-80 border-l bg-gray-50 overflow-y-auto">
                <div className="p-6 space-y-4">
                  {/* Category Panel */}
                  <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Category</h3>
                    </div>
                    <div className="p-4">
                      {isEditing ? (
                        <select className="w-full border border-gray-300 rounded px-3 py-2">
                          <option>Enter category</option>
                          <option>Electronics</option>
                          <option>Clothing</option>
                          <option>Home & Garden</option>
                          <option>Books</option>
                        </select>
                      ) : (
                        <p className="text-gray-700">{selectedProduct?.category || 'No category'}</p>
                      )}
                    </div>
                  </div>

                  {/* Brand Panel */}
                  <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Brand</h3>
                    </div>
                    <div className="p-4">
                      {isEditing ? (
                        <select className="w-full border border-gray-300 rounded px-3 py-2">
                          <option>Enter brand</option>
                          <option>Samsung</option>
                          <option>Apple</option>
                          <option>Nike</option>
                          <option>Adidas</option>
                        </select>
                      ) : (
                        <p className="text-gray-700">No brand</p>
                      )}
                    </div>
                  </div>

                  {/* Status Panel */}
                  <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Status</h3>
                    </div>
                    <div className="p-4">
                      {isEditing ? (
                        <select className="w-full border border-gray-300 rounded px-3 py-2">
                          <option>Active</option>
                          <option>Inactive</option>
                          <option>Draft</option>
                        </select>
                      ) : (
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mt-6">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setProducts(prev => prev.map(p => 
                              p.id === editedProduct.id ? editedProduct : p
                            ));
                            setSelectedProduct(editedProduct);
                            setIsEditing(false);
                            alert('প্রোডাক্ট সফলভাবে আপডেট হয়েছে!');
                          }}
                          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          {selectedProduct.id ? 'Update Product' : 'Add Product'}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="w-full border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Edit Product
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('আপনি কি এই প্রোডাক্টটি ডিলিট করতে চান?')) {
                              handleDeleteProduct(selectedProduct.id)
                            }
                          }}
                          className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          Delete Product
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex">
              {/* Left Content Area */}
              <div className="flex-1 p-6">
                {/* General Information Section */}
                <div className="bg-white border rounded-lg mb-6">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h3 className="font-semibold">General Information</h3>
                    <button className="text-gray-400">^</button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Item Name *</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editedProduct.name}
                            onChange={e => setEditedProduct({...editedProduct, name: e.target.value})}
                            placeholder="Enter product name"
                          />
                        ) : (
                          <div className="py-2 text-gray-900">{selectedProduct.name}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">SKU / Product Code</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editedProduct.sku || ''}
                            onChange={e => setEditedProduct({...editedProduct, sku: e.target.value})}
                            placeholder="Enter SKU"
                          />
                        ) : (
                          <div className="py-2 text-gray-900">{selectedProduct.sku || '-'}</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Short Description (SEO & title meta)</label>
                      {isEditing ? (
                        <textarea
                          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                          value={editedProduct.shortDesc || ''}
                          onChange={e => setEditedProduct({...editedProduct, shortDesc: e.target.value})}
                          placeholder="Brief description for SEO"
                        />
                      ) : (
                        <div className="py-2 text-gray-700 min-h-[60px]">{selectedProduct.shortDesc || '-'}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      {isEditing ? (
                        <textarea
                          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                          value={editedProduct.desc || ''}
                          onChange={e => setEditedProduct({...editedProduct, desc: e.target.value})}
                          placeholder="Detailed product description"
                        />
                      ) : (
                        <div className="py-2 text-gray-700 min-h-[80px] whitespace-pre-line">{selectedProduct.desc || '-'}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Media Section */}
                <div className="bg-white border rounded-lg mb-6">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h3 className="font-semibold">Media</h3>
                    <button className="text-gray-400">^</button>
                  </div>
                  <div className="p-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="text-gray-500 mb-2">📁</div>
                      <p className="text-sm text-gray-600">Drag and drop image files, or click and browse. Accepted formats: JPG, PNG, Max size: 2MB</p>
                      {isEditing && (
                        <button className="mt-2 text-blue-600 text-sm underline">Add Link</button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-white border rounded-lg mb-6">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h3 className="font-semibold">Pricing</h3>
                    <button className="text-gray-400">^</button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Regular Price *</label>
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editedProduct.price}
                            onChange={e => setEditedProduct({...editedProduct, price: Number(e.target.value)})}
                            placeholder="0"
                          />
                        ) : (
                          <div className="py-2 text-gray-900 font-semibold">৳{selectedProduct.price?.toLocaleString()}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Reselling Price</label>
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        ) : (
                          <div className="py-2 text-gray-700">-</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Buying Price (Optional)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        ) : (
                          <div className="py-2 text-gray-700">-</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory Section */}
                <div className="bg-white border rounded-lg mb-6">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <h3 className="font-semibold">Inventory</h3>
                    <button className="text-gray-400">^</button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Product Serial</label>
                        <div className="py-2 text-gray-700">SKU_001</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">SKU / Product Code</label>
                        <div className="py-2 text-gray-700">{selectedProduct.sku || 'N/A'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Unit Name</label>
                        <div className="py-2 text-gray-700">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Quantity (Stock)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={editedProduct.stock}
                            onChange={e => setEditedProduct({...editedProduct, stock: Number(e.target.value)})}
                          />
                        ) : (
                          <div className="py-2 text-gray-900 font-semibold">{selectedProduct.stock}</div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Warranty</label>
                        <div className="py-2 text-gray-700">7 Days</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Initial Sold Count</label>
                        <div className="py-2 text-gray-700">{selectedProduct.sold || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-80 border-l bg-gray-50 p-4">
                {/* Category Section */}
                <div className="bg-white border rounded-lg mb-4">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-sm">Category</h3>
                    <button className="text-gray-400">^</button>
                  </div>
                  <div className="p-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="radio" name="category" className="mr-2" />
                          <label className="text-sm">Gadgets</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" name="category" className="mr-2" defaultChecked />
                          <label className="text-sm">Electronics</label>
                        </div>
                        <button className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">
                          Assign Category
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">{selectedProduct.category || 'Uncategorized'}</div>
                    )}
                  </div>
                </div>

                {/* Brand, SEO & Extra Panel */}
                <div className="bg-white border rounded-lg mb-4">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-sm">Brand, SEO & Extra Panel</h3>
                    <button className="text-gray-400">^</button>
                  </div>
                  <div className="p-3">
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Brand</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1 text-sm"
                          placeholder="Anker"
                        />
                      ) : (
                        <div className="text-sm text-gray-700">Anker</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Condition, SEO & Extra Panel */}
                <div className="bg-white border rounded-lg mb-4">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-sm">Condition, SEO & Extra Panel</h3>
                    <button className="text-gray-400">^</button>
                  </div>
                  <div className="p-3">
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Brand</label>
                      <div className="text-sm text-gray-700">New</div>
                    </div>
                  </div>
                </div>

                {/* Product Status */}
                <div className="bg-white border rounded-lg">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-sm">Product Status</h3>
                    <button className="text-gray-400">^</button>
                  </div>
                  <div className="p-3">
                    <div className="text-sm">
                      <div className="px-2 py-1 bg-green-100 text-green-800 rounded inline-block">
                        ACTIVE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.category || 'Uncategorized'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">{product.sku}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">৳{product.price.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.stock > 100 
                      ? 'bg-green-100 text-green-800' 
                      : product.stock > 20 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{product.sold || 0}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="View Product"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setEditedProduct({ ...product });
                        setIsEditing(false);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit Product"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setEditedProduct({ ...product });
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Product"
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm('আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?')) {
                          setProducts(prev => prev.filter(p => p.id !== product.id));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                      Add to order
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No products found</div>
          <p className="text-gray-500">Try adjusting your search terms or add your first product.</p>
        </div>
      )}
    </div>
  );
}
