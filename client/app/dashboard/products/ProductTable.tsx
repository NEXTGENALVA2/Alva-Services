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
export interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  oldPrice?: number;
  buyPrice?: number;
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

  // Helper: Deep clone product (to avoid reference bugs)
  function deepCloneProduct(product: Product): Product {
    return JSON.parse(JSON.stringify(product));
  }
  // Helper: Deep clone product (to avoid reference bugs)

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Category options state (persisted in localStorage)
  const [categories, setCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('categories');
      if (stored) return JSON.parse(stored);
    }
    return ['Gadgets', 'Camera', 'Electronics', 'Clothing', 'Home & Garden', 'Books'];
  });

  // Image upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageUrls: string[] = [];
      
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            imageUrls.push(result);
            setUploadedImages(prev => [...prev, result]);
            
            // Update edited product images
            if (editedProduct) {
              setEditedProduct({
                ...editedProduct,
                images: [...(editedProduct.images || []), result]
              });
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  // Remove image handler
  const removeImage = (indexToRemove: number) => {
    if (editedProduct) {
      const updatedImages = editedProduct.images?.filter((_, index) => index !== indexToRemove) || [];
      setEditedProduct({
        ...editedProduct,
        images: updatedImages
      });
    }
  };

  useEffect(() => {
    // Uncomment when backend is ready
    // axios.get('/api/products', {
    //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    // }).then(response => {
    //   setProducts(response.data);
    // }).catch(error => {
    //   console.error('Error fetching products:', error);
    // });
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    try {
      // Uncomment when backend is ready
      // await axios.delete(`/api/products/${productId}`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      setSelectedProduct(null);
      setEditedProduct(null);
      setIsEditing(false);
      alert('প্রোডাক্ট সফলভাবে ডিলিট হয়েছে!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('প্রোডাক্ট ডিলিট করতে সমস্যা হয়েছে!');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

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
                  {isEditing ? 'Edit Product' : 'View Product'}
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
                    {isEditing ? 'Edit Product' : 'Product Details'}
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
                          onChange={(e) => setEditedProduct({...editedProduct!, name: e.target.value})}
                        />
                      ) : (
                        <p className="py-2 text-gray-700">{selectedProduct?.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      {(isEditing || !selectedProduct) ? (
                        <div className="flex gap-2 items-center">
                          <select
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={editedProduct?.category || ''}
                            onChange={e => setEditedProduct({ ...editedProduct!, category: e.target.value })}
                          >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                            title="Add new category"
                            onClick={() => {
                              const name = prompt('নতুন ক্যাটাগরির নাম দিন:');
                              if (name && !categories.includes(name)) setCategories([...categories, name]);
                            }}
                          >+ Add</button>
                        </div>
                      ) : (
                        <p className="py-2 text-gray-700">{selectedProduct?.category || '-'}</p>
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
                          onChange={(e) => setEditedProduct({...editedProduct!, sku: e.target.value})}
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
                          onChange={(e) => setEditedProduct({...editedProduct!, shortDesc: e.target.value})}
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
                          onChange={(e) => setEditedProduct({...editedProduct!, desc: e.target.value})}
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
                          onChange={(e) => setEditedProduct({...editedProduct!, price: Number(e.target.value)})}
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
                          value={editedProduct?.oldPrice || ''}
                          onChange={e => setEditedProduct({ ...editedProduct!, oldPrice: Number(e.target.value) })}
                        />
                      ) : (
                        <p className="py-2 text-gray-700">{selectedProduct?.oldPrice !== undefined ? `৳${selectedProduct.oldPrice}` : '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Buy Price</label>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="0.00"
                          value={editedProduct?.buyPrice || ''}
                          onChange={e => setEditedProduct({ ...editedProduct!, buyPrice: Number(e.target.value) })}
                        />
                      ) : (
                        <p className="py-2 text-gray-700">{selectedProduct?.buyPrice !== undefined ? `৳${selectedProduct.buyPrice}` : '-'}</p>
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
                          onChange={(e) => setEditedProduct({...editedProduct!, stock: Number(e.target.value)})}
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
                    
                    {/* Image Preview Grid */}
                    {(editedProduct?.images && editedProduct.images.length > 0) && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {editedProduct.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            {isEditing && (
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Area */}
                    {isEditing ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <div className="text-4xl text-gray-400 mb-2">📁</div>
                          <div className="text-gray-500">
                            <p className="mb-1">Choose Files | Click to upload</p>
                            <p className="text-xs">Upload multiple images (JPG, PNG, GIF)</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <div className="text-gray-400">
                          <p className="mb-1">No images uploaded</p>
                          <p className="text-xs">Images will be displayed here</p>
                        </div>
                      </div>
                    )}
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
                        onChange={(e) => setEditedProduct({...editedProduct!, video: e.target.value})}
                      />
                    ) : (
                      <p className="py-2 text-gray-700">{selectedProduct?.video || '-'}</p>
                    )}
                  </div>

                  {/* Product Variants */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Product Variants</h3>
                      {isEditing && (
                        <button
                          type="button"
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                          onClick={() => {
                            if (!editedProduct) return;
                            setEditedProduct({
                              ...editedProduct,
                              variants: [
                                ...(editedProduct.variants || []),
                                { mandatory: true, title: '', options: [{ attribute: '', extraPrice: '' }] }
                              ]
                            });
                          }}
                        >
                          Add Variant
                        </button>
                      )}
                    </div>
                    
                    {(!((isEditing ? editedProduct?.variants : selectedProduct?.variants) || []).length) && (
                      <div className="text-gray-500 text-center py-4">
                        কোনো ভ্যারিয়েন্ট নেই
                      </div>
                    )}
                    
                    {(isEditing ? editedProduct?.variants : selectedProduct?.variants)?.map((variant, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center mb-3">
                          <input 
                            type="checkbox" 
                            checked={variant.mandatory} 
                            className="mr-2 w-4 h-4 text-blue-600" 
                            readOnly={!isEditing}
                            onChange={isEditing ? (e) => {
                              const newVariants = [...(editedProduct?.variants || [])];
                              newVariants[index].mandatory = e.target.checked;
                              setEditedProduct({ ...editedProduct!, variants: newVariants });
                            } : undefined}
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
                            onChange={isEditing ? (e) => {
                              const newVariants = [...(editedProduct?.variants || [])];
                              newVariants[index].title = e.target.value;
                              setEditedProduct({ ...editedProduct!, variants: newVariants });
                            } : undefined}
                          />
                        </div>
                        <div className="space-y-2">
                          {variant.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-3 mb-2">
                              <input
                                type="text"
                                value={option.attribute}
                                className="flex-1 border border-gray-300 rounded px-3 py-2"
                                placeholder="Option (e.g. Small, Red)"
                                readOnly={!isEditing}
                                onChange={isEditing ? (e) => {
                                  const newVariants = [...(editedProduct?.variants || [])];
                                  newVariants[index].options[optIndex].attribute = e.target.value;
                                  setEditedProduct({ ...editedProduct!, variants: newVariants });
                                } : undefined}
                              />
                              <input
                                type="text"
                                value={option.extraPrice}
                                className="w-24 border border-gray-300 rounded px-3 py-2"
                                placeholder="Price"
                                readOnly={!isEditing}
                                onChange={isEditing ? (e) => {
                                  const newVariants = [...(editedProduct?.variants || [])];
                                  newVariants[index].options[optIndex].extraPrice = e.target.value;
                                  setEditedProduct({ ...editedProduct!, variants: newVariants });
                                } : undefined}
                              />
                              {isEditing && (
                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 text-sm"
                                  onClick={() => {
                                    const newVariants = [...(editedProduct?.variants || [])];
                                    newVariants[index].options.splice(optIndex, 1);
                                    setEditedProduct({ ...editedProduct!, variants: newVariants });
                                  }}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          {isEditing && (
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                              onClick={() => {
                                const newVariants = [...(editedProduct?.variants || [])];
                                newVariants[index].options.push({ attribute: '', extraPrice: '' });
                                setEditedProduct({ ...editedProduct!, variants: newVariants });
                              }}
                            >
                              + Add Option
                            </button>
                          )}
                        </div>
                        {isEditing && (editedProduct?.variants || []).length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 text-sm mt-2"
                            onClick={() => {
                              const newVariants = [...(editedProduct?.variants || [])];
                              newVariants.splice(index, 1);
                              setEditedProduct({ ...editedProduct!, variants: newVariants });
                            }}
                          >
                            Remove Variant
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Product Details */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Product Details</h3>
                      {isEditing && (
                        <button
                          type="button"
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                          onClick={() => {
                            if (!editedProduct) return;
                            setEditedProduct({
                              ...editedProduct,
                              details: [
                                ...(editedProduct.details || []),
                                { type: '', description: '' }
                              ]
                            });
                          }}
                        >
                          Add Detail
                        </button>
                      )}
                    </div>
                    
                    {(!((isEditing ? editedProduct?.details : selectedProduct?.details) || []).length) && (
                      <div className="text-gray-500 text-center py-4">
                        কোনো বিস্তারিত তথ্য নেই
                      </div>
                    )}
                    
                    {(isEditing ? editedProduct?.details : selectedProduct?.details)?.map((detail, index) => (
                      <div key={index} className="flex gap-3 mb-3">
                        <input
                          type="text"
                          value={detail.type}
                          className="w-1/3 border border-gray-300 rounded px-3 py-2"
                          placeholder="Detail Type (e.g. Material, Weight)"
                          readOnly={!isEditing}
                          onChange={isEditing ? (e) => {
                            const newDetails = [...(editedProduct?.details || [])];
                            newDetails[index].type = e.target.value;
                            setEditedProduct({ ...editedProduct!, details: newDetails });
                          } : undefined}
                        />
                        <input
                          type="text"
                          value={detail.description}
                          className="flex-1 border border-gray-300 rounded px-3 py-2"
                          placeholder="Description"
                          readOnly={!isEditing}
                          onChange={isEditing ? (e) => {
                            const newDetails = [...(editedProduct?.details || [])];
                            newDetails[index].description = e.target.value;
                            setEditedProduct({ ...editedProduct!, details: newDetails });
                          } : undefined}
                        />
                        {isEditing && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 text-sm"
                            onClick={() => {
                              const newDetails = [...(editedProduct?.details || [])];
                              newDetails.splice(index, 1);
                              setEditedProduct({ ...editedProduct!, details: newDetails });
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - EcomEasy Style */}
              <div className="w-80 border-l bg-gray-50 overflow-y-auto">
                <div className="p-6 space-y-4">
                  {/* Categories - Always visible */}
                  <div className="bg-white rounded-lg border mb-4">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-semibold">Categories</h3>
                      {isEditing && (
                        <button
                          className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                          onClick={() => {
                            const name = prompt('নতুন ক্যাটাগরির নাম দিন:');
                            if (name && !categories.includes(name)) setCategories([...categories, name]);
                          }}
                        >+ Add</button>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      {isEditing ? (
                        categories.length === 0 ? <div className="text-gray-400 text-sm">No categories</div> :
                        categories.map(cat => (
                          <div key={cat} className="flex items-center justify-between group">
                            <span>{cat}</span>
                            <button
                              className="text-red-400 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100"
                              onClick={() => setCategories(categories.filter(c => c !== cat))}
                              title="Delete"
                            >✕</button>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{selectedProduct?.category || 'No category'}</span>
                          {selectedProduct?.category && (
                            <span className="text-green-500 text-lg">✔</span>
                          )}
                        </div>
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
                              p.id === editedProduct!.id ? editedProduct! : p
                            ));
                            setSelectedProduct(editedProduct);
                            setIsEditing(false);
                            alert('প্রোডাক্ট সফলভাবে আপডেট হয়েছে!');
                          }}
                          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Update Product
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
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedProduct(product);
                  setEditedProduct(deepCloneProduct(product));
                  setIsEditing(false);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                      )}
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
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                      title="View Count"
                      onClick={e => {
                        e.stopPropagation();
                        const count = typeof window !== 'undefined' ? parseInt(localStorage.getItem(`product_views_${product.id}`) || '0', 10) : 0;
                        alert(`এই প্রোডাক্টটি ${count} বার দেখা হয়েছে।`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center select-none">
                        {typeof window !== 'undefined' ? (localStorage.getItem(`product_views_${product.id}`) || 0) : 0}
                      </span>
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Edit Product"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                        setEditedProduct(deepCloneProduct(product));
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
                        if (confirm('আপনি কি এই প্রোডাক্টটি ডিলিট করতে চান?')) {
                          handleDeleteProduct(product.id);
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
