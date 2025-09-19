"use client";
import { useTheme } from "./ThemeContext";
import { useRegion } from "@/components/RegionContext";

interface ThemePreviewProps {
  products?: any[];
  banners?: any[];
}

export default function ThemePreview({ products, banners }: ThemePreviewProps) {
  const { theme } = useTheme();
  const { formatPrice } = useRegion();
  
  return (
    <div
      className="rounded-lg shadow-lg p-6 h-full"
      style={{
        background: theme.colors.background,
        color: theme.colors.text,
        border: `2px solid ${theme.colors.primary}`,
        minHeight: '600px',
      }}
    >
      {/* Header */}
      <div className="text-center mb-6 p-4 rounded-lg" style={{ background: theme.colors.primary, color: theme.colors.background }}>
        <h1 className="text-2xl font-bold mb-2">আমার অনলাইন শপ</h1>
        <p className="text-sm opacity-90">মানসম্পন্ন পণ্যের সাথে দ্রুত ডেলিভারি</p>
      </div>

      {/* Banner Section */}
      <div className="mb-6">
        <div className="h-48 rounded-lg overflow-hidden">
          {banners && banners.length > 0 && banners[0] && banners[0].imageUrl ? (
            <div className="relative h-full">
              <img 
                src={`http://localhost:5000${banners[0].imageUrl}`} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-2xl font-bold mb-2 drop-shadow-lg">বিশেষ অফার!</h2>
                  <p className="text-base drop-shadow-lg">সব পণ্যে ৫০% পর্যন্ত ছাড়</p>
                </div>
              </div>
              {banners.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  1/{banners.length}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center rounded-lg" style={{ background: `linear-gradient(45deg, ${theme.colors.secondary}, ${theme.colors.primary})` }}>
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-2">বিশেষ অফার!</h2>
                <p className="text-base">সব পণ্যে ৫০% পর্যন্ত ছাড়</p>
                <p className="text-xs mt-2 opacity-75">Upload a banner to see it here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="mb-8">
        <h2 className="font-bold text-xl mb-4" style={{ color: theme.colors.primary }}>
          নতুন আগত পণ্য
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {Array.isArray(products) && products.length > 0 ? (
            products.slice(0, 4).map((product: any) => (
              <div
                key={product.id}
                className="rounded-lg shadow-md overflow-hidden border"
                style={{ borderColor: theme.colors.primary + '20' }}
              >
                {/* Show real product image if available */}
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-32 flex items-center justify-center"
                    style={{ background: theme.colors.secondary }}
                  >
                    <span className="text-white text-sm">কোন ছবি নেই</span>
                  </div>
                )}
                
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: theme.colors.text }}>
                    {product.name}
                  </h3>
                  <p className="font-bold text-lg mb-2" style={{ color: theme.colors.primary }}>
                    {formatPrice(product.price)}
                  </p>
                  <button
                    className="w-full py-2 px-3 rounded text-sm font-medium"
                    style={{
                      background: theme.colors.primary,
                      color: theme.colors.background,
                      border: 'none',
                    }}
                  >
                    কার্টে যোগ করুন
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Placeholder products
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="rounded-lg shadow-md overflow-hidden border"
                style={{ borderColor: theme.colors.primary + '20' }}
              >
                <div 
                  className="w-full h-32 flex items-center justify-center"
                  style={{ background: theme.colors.secondary }}
                >
                  <span className="text-white text-sm">পণ্য যোগ করুন</span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: theme.colors.text }}>
                    পণ্যের নাম
                  </h3>
                  <p className="font-bold text-lg mb-2" style={{ color: theme.colors.primary }}>
                    ৳০.০০
                  </p>
                  <button
                    className="w-full py-2 px-3 rounded text-sm font-medium"
                    style={{
                      background: theme.colors.primary,
                      color: theme.colors.background,
                      border: 'none',
                    }}
                  >
                    কার্টে যোগ করুন
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Best Sellers Section */}
      <div className="mb-6">
        <h2 className="font-bold text-xl mb-4" style={{ color: theme.colors.primary }}>
          বেস্ট সেলার
        </h2>
        <div className="space-y-3">
          {Array.isArray(products) && products.length > 0 ? (
            products.slice(0, 2).map((product: any) => (
              <div
                key={`best-${product.id}`}
                className="flex gap-4 p-3 rounded-lg border"
                style={{ background: theme.colors.secondary + '20', borderColor: theme.colors.primary + '30' }}
              >
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div 
                    className="w-16 h-16 flex items-center justify-center rounded"
                    style={{ background: theme.colors.secondary }}
                  >
                    <span className="text-white text-xs">ছবি নেই</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: theme.colors.text }}>
                    {product.name}
                  </h3>
                  <p className="font-bold text-base" style={{ color: theme.colors.primary }}>
                    {formatPrice(product.price)}
                  </p>
                  <button
                    className="mt-2 py-1 px-3 rounded text-xs font-medium"
                    style={{
                      background: theme.colors.primary,
                      color: theme.colors.background,
                      border: 'none',
                    }}
                  >
                    অর্ডার করুন
                  </button>
                </div>
              </div>
            ))
          ) : (
            Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`best-placeholder-${index}`}
                className="flex gap-4 p-3 rounded-lg border"
                style={{ background: theme.colors.secondary + '20', borderColor: theme.colors.primary + '30' }}
              >
                <div 
                  className="w-16 h-16 flex items-center justify-center rounded"
                  style={{ background: theme.colors.secondary }}
                >
                  <span className="text-white text-xs">ছবি নেই</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: theme.colors.text }}>
                    পণ্যের নাম
                  </h3>
                  <p className="font-bold text-base" style={{ color: theme.colors.primary }}>
                    ৳০.০০
                  </p>
                  <button
                    className="mt-2 py-1 px-3 rounded text-xs font-medium"
                    style={{
                      background: theme.colors.primary,
                      color: theme.colors.background,
                      border: 'none',
                    }}
                  >
                    অর্ডার করুন
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t text-center text-sm" style={{ borderColor: theme.colors.primary, color: theme.colors.text }}>
        <p>© ২০২৫ আমার অনলাইন শপ। সর্বস্বত্ব সংরক্ষিত।</p>
        <p className="mt-1 opacity-75">ফোন: ০১৭XXXXXXXX | ইমেইল: info@myshop.com</p>
      </div>
    </div>
  );
}
