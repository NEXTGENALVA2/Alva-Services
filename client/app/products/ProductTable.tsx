"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash2, Search, Filter } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  sold?: number;
  images?: string[];
  category?: string;
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([
    // Sample data for demonstration
    {
      id: '1',
      name: 'TOMZN TOMPD-635W WiFi Smart Circuit Breaker with Real-Time Energy Monitoring and App Control',
      sku: '703305',
      price: 2190,
      stock: 485,
      sold: 15,
      category: 'Electronics'
    },
    {
      id: '2', 
      name: 'Gearup Thermal Printer & Thermal Paper Rolls Combo - Blue Color',
      sku: '695569',
      price: 1990,
      stock: 180,
      sold: 25,
      category: 'Office'
    },
    {
      id: '3',
      name: 'Fastrack 3296GL02 Urban Camo Dial Ladies Watch',
      sku: '734503',
      price: 5490,
      stock: 40,
      sold: 8,
      category: 'Fashion'
    },
    {
      id: '4',
      name: 'Baseus Adaman 22.5w 20000mAh Quick Charge Power Bank',
      sku: '728675',
      price: 2450,
      stock: 18,
      sold: 45,
      category: 'Electronics'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
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
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Product"
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
