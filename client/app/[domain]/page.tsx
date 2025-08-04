import React from 'react';

export default async function Page({ params }: { params: { domain: string } }) {
  // ডোমেইন/সাবডোমেইন থেকে ওয়েবসাইট ডেটা আনা
  let website = null;
  let products: any[] = [];
  try {
    const res = await fetch(`http://localhost:5000/api/website/public/${params.domain}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      website = data.website;
      products = data.products || [];
    }
  } catch (error) {
    // Not found
  }

  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-red-600 mb-4">ওয়েবসাইট পাওয়া যায়নি</h1>
        <p className="text-gray-700">আপনার দেওয়া ঠিকানায় কোনো ওয়েবসাইট নেই।</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">{website.name}</h1>
        <div className="text-gray-700 mb-6">ডোমেইন: {website.domain}</div>
        <h2 className="text-2xl font-semibold mb-4">পণ্যসমূহ</h2>
        {products.length === 0 ? (
          <div className="text-gray-500">কোনো পণ্য পাওয়া যায়নি।</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="border rounded-lg p-4 shadow">
                <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                <div className="text-gray-700 mb-1">মূল্য: ৳{product.price}</div>
                <div className="text-gray-600 text-sm">{product.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
