"use client";
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { Plus, ArrowLeft, Package, Filter, Search } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

const ProductTable = dynamic(() => import('./ProductTable'), { ssr: false });
const AddProductForm = dynamic(() => import('./AddProductForm'), { ssr: false });

export default function ProductsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filters = [
    { id: 'all', label: 'All products', count: 29 },
    { id: 'gadgets', label: 'Gadgets', count: 15 },
    { id: 'camera', label: 'Camera', count: 8 },
    { id: 'electronics', label: 'Electronics', count: 12 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {!showAdd ? (
        <div className="p-6">
          {/* Header */}
          <Card className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                    <Package className="h-7 w-7" />
                    All Products
                  </CardTitle>
                  <CardDescription className="text-blue-100 mt-1">
                    Manage your product inventory and add new items
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowAdd(true)}
                  className="mt-4 sm:mt-0 bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Filter by category:</span>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={activeFilter === filter.id ? "default" : "outline"}
                    onClick={() => setActiveFilter(filter.id)}
                    className="flex items-center gap-2"
                  >
                    {filter.label}
                    <Badge variant="secondary" className="ml-1">
                      {filter.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products List
              </CardTitle>
              <CardDescription>
                View and manage all your products in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTable />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-6">
          {/* Add Product Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAdd(false)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Products
                </Button>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Plus className="h-6 w-6" />
                    Add New Product
                  </CardTitle>
                  <CardDescription>
                    Fill in the details to add a new product to your inventory
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AddProductForm />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
