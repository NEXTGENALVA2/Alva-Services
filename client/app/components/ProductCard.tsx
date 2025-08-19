import { useRouter } from 'next/navigation';
import React from 'react';

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();
  // Get domain from URL path
  let domain = '';
  if (typeof window !== 'undefined') {
    const match = window.location.pathname.match(/^\/([^\/]+)/);
    if (match) domain = match[1];
  }
  return (
    <div
      className="rounded-lg shadow hover:shadow-lg cursor-pointer bg-white"
      onClick={() => router.push(`/products/${product.id}`)}
      title={product.name}
    >
      <img src={product.images?.[0]} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{product.name}</h3>
        <p className="text-green-700 font-bold text-md mb-2">৳{product.price}</p>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded mb-2"
            onClick={e => {
              e.stopPropagation();
              // Add only this product to domain cart and route to checkout
              if (typeof window !== 'undefined') {
                const cartItem = {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  image: product.images?.[0] || ''
                };
                localStorage.setItem(`cart_${domain}`, JSON.stringify([cartItem]));
                window.location.href = `/${domain}/checkout`;
              }
            }}
          >
            Add to Cart
          </button>
        <button
          className="w-full bg-green-700 text-white py-2 rounded"
          onClick={e => {
            e.stopPropagation();
            // Buy Now: clear cart, add only this product, then go to checkout
            if (typeof window !== 'undefined') {
              const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.images?.[0] || ''
              };
              localStorage.setItem(`cart_${domain}`, JSON.stringify([cartItem]));
              window.location.href = `/${domain}/checkout`;
            }
          }}
        >Buy Now</button>
      </div>
    </div>
  );
}
