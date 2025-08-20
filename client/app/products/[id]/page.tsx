"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";

import { useRouter } from 'next/navigation';
import React from 'react';

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params && typeof params === 'object' && 'id' in params && params.id ? params.id as string : '';
  const [product, setProduct] = React.useState<any>(null);
  const router = useRouter();

  // Get domain from URL (window.location or params)
  const domain = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '';
  React.useEffect(() => {
    if (domain && productId) {
      fetch(`http://localhost:5000/api/products/${domain}/${productId}`)
        .then(res => res.json())
        .then(data => setProduct(data));
    }
  }, [domain, productId]);

  if (!product) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col gap-4">
          {product.images?.map((img: string, idx: number) => (
            <img key={idx} src={img} alt={product.name} className="w-32 h-32 object-cover rounded border" />
          ))}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-2">{product.description}</p>
          <p className="text-green-700 font-bold text-xl mb-2">৳{product.price}</p>
          {product.oldPrice && (
            <p className="text-gray-500 line-through mb-2">৳{product.oldPrice}</p>
          )}
          <div className="flex gap-4 mt-4">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded"
              onClick={() => {/* Add to cart logic */}}
            >Add to Cart</button>
            <button
              className="bg-green-700 text-white px-6 py-2 rounded"
              onClick={() => {/* Buy now logic */}}
            >Buy Now</button>
          </div>
        </div>
      </div>
      {/* Show more details if needed */}
    </div>
  );

  useEffect(() => {
    if (productId) {
      const key = `product_views_${productId}`;
      const current = parseInt(localStorage.getItem(key) || "0", 10);
      localStorage.setItem(key, (current + 1).toString());
    }
  }, [productId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Product Detail</h1>
      <p>Product ID: {productId}</p>
      {/* ...rest of your product detail UI... */}
    </div>
  );
}
