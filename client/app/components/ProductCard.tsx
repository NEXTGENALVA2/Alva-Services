import { useRouter } from 'next/navigation';
import React from 'react';
import { useCart } from '../../components/CartContext';

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();
  const { addToCart, clearCart } = useCart();
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
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity: 1
              });
            }}
          >
            Add to Cart
          </button>
        <button
          className="w-full bg-green-700 text-white py-2 rounded"
          onClick={e => {
            e.stopPropagation();
            clearCart();
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images?.[0] || '',
              quantity: 1
            });
            router.push(`/checkout`);
          }}
        >Buy Now</button>
      </div>
    </div>
  );
}
