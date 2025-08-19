'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';

export default function ProductDetailsPage({ params }: { params: { domain: string; id: string } }) {
  const [product, setProduct] = React.useState<any>(null);
  const [website, setWebsite] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [quantity, setQuantity] = React.useState(1);
  const router = useRouter();

  React.useEffect(() => {
    // Fetch website data
    fetch(`http://localhost:5000/api/website/public/${params.domain}`)
      .then(res => res.json())
      .then(data => {
        if (data.website) {
          setWebsite(data.website);
          // Find the specific product from website's products
          const foundProduct = data.products?.find((p: any) => p.id === params.id);
          if (foundProduct) {
            setProduct(foundProduct);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [params.domain, params.id]);

  const addToCart = (product: any) => {
    const cartKey = `cart_${params.domain}`;
    const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    const existingItem = existingCart.find((item: any) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images?.[0] || ''
      });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(existingCart));
    alert('পণ্যটি কার্টে যোগ করা হয়েছে!');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!website || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-red-600 mb-4">পণ্য পাওয়া যায়নি</h1>
        <button 
          onClick={() => router.push(`/${params.domain}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ওয়েবসাইটে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push(`/${params.domain}`)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                ফিরে যান
              </button>
              <h1 className="text-xl font-bold text-gray-900">{website.name}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Product Details */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2">
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4 p-6">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.slice(1, 5).map((img: string, idx: number) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`${product.name} ${idx + 2}`}
                          className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">কোনো ছবি নেই</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-6">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.brand && (
                  <p className="text-gray-600 mb-2">ব্র্যান্ড: {product.brand}</p>
                )}
                {product.category && (
                  <p className="text-gray-600 mb-4">ক্যাটেগরি: {product.category}</p>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-3xl font-bold text-green-600">৳{product.price}</span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">৳{product.oldPrice}</span>
                  )}
                </div>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-sm text-red-600">
                    ছাড়: ৳{product.oldPrice - product.price}
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">বিবরণ</h3>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="text-green-600 font-medium">স্টকে আছে ({product.stock}টি)</span>
                ) : (
                  <span className="text-red-600 font-medium">স্টক শেষ</span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">পরিমাণ</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded border hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border rounded text-center min-w-[60px]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded border hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>কার্টে যোগ করুন</span>
                </button>
                <button
                  onClick={() => {
                    addToCart(product);
                    router.push(`/${params.domain}?showCart=true`);
                  }}
                  disabled={product.stock === 0}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  এখনই কিনুন
                </button>
              </div>

              {/* Additional Info */}
              {(product.condition || product.warranty) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3">অতিরিক্ত তথ্য</h3>
                  {product.condition && (
                    <p className="text-gray-700 mb-2">অবস্থা: {product.condition}</p>
                  )}
                  {product.warranty && (
                    <p className="text-gray-700">ওয়ারেন্টি: {product.warranty}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
