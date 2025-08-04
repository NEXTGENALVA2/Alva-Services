"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params && typeof params === 'object' && 'id' in params && params.id ? params.id as string : '';

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
