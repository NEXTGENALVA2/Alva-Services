import { useRouter } from 'next/navigation';
import React from 'react';
import { useCart } from '../../components/CartContext';
import { useTheme } from '../../components/ThemeContext';

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();
  const { addToCart, clearCart } = useCart();
  const { theme } = useTheme();
  return (
    <div
      className="rounded-lg shadow hover:shadow-lg cursor-pointer"
      style={{
        background: theme.colors.background,
        color: theme.colors.text,
        border: `1.5px solid ${theme.colors.primary}`,
      }}
      onClick={() => router.push(`/products/${product.id}`)}
      title={product.name}
    >
      <img src={product.images?.[0]} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1" style={{ color: theme.colors.primary }}>{product.name}</h3>
        <p className="font-bold text-md mb-2" style={{ color: theme.colors.text }}>৳{product.price}</p>
        <button
          style={{
            width: '100%',
            background: theme.colors.primary,
            color: theme.colors.background,
            padding: '10px 0',
            borderRadius: 6,
            marginBottom: 8,
            fontWeight: 600,
            border: 'none',
          }}
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
          style={{
            width: '100%',
            background: theme.colors.secondary,
            color: theme.colors.text,
            padding: '10px 0',
            borderRadius: 6,
            fontWeight: 600,
            border: `1px solid ${theme.colors.primary}`,
          }}
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
