"use client";
import React, { useState } from 'react';

// --- Types ---
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

export default function AddProductForm() {
  // --- State ---
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('New');
  const [status, setStatus] = useState('ACTIVE');
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [serial, setSerial] = useState('0');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('');
  const [stock, setStock] = useState('');
  const [warranty, setWarranty] = useState('');
  const [soldCount, setSoldCount] = useState('0');
  const [deliveryApplied, setDeliveryApplied] = useState(true);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { mandatory: true, title: '', options: [{ attribute: '', extraPrice: '' }] }
  ]);
  const [details, setDetails] = useState<ProductDetail[]>([
    { type: '', description: '' }
  ]);

  // --- Handlers ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  // Variant handlers
  const handleVariantChange = (idx: number, field: keyof ProductVariant, value: any) => {
    setVariants(vs => vs.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const handleVariantOptionChange = (vIdx: number, oIdx: number, field: keyof VariantOption, value: string) => {
    setVariants(vs => vs.map((v, i) =>
      i === vIdx ? { ...v, options: v.options.map((o, j) => j === oIdx ? { ...o, [field]: value } : o) } : v
    ));
  };

  const addVariantOption = (vIdx: number) => {
    setVariants(vs => vs.map((v, i) =>
      i === vIdx ? { ...v, options: [...v.options, { attribute: '', extraPrice: '' }] } : v
    ));
  };

  const removeVariantOption = (vIdx: number, oIdx: number) => {
    setVariants(vs => vs.map((v, i) =>
      i === vIdx ? { ...v, options: v.options.filter((_, j) => j !== oIdx) } : v
    ));
  };

  const addVariant = () => {
    setVariants(vs => [...vs, { mandatory: true, title: '', options: [{ attribute: '', extraPrice: '' }] }]);
  };

  const removeVariant = (idx: number) => {
    setVariants(vs => vs.filter((_, i) => i !== idx));
  };

  // Detail handlers
  const handleDetailChange = (idx: number, field: keyof ProductDetail, value: string) => {
    setDetails(ds => ds.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  const addDetail = () => {
    setDetails(ds => [...ds, { type: '', description: '' }]);
  };

  const removeDetail = (idx: number) => {
    setDetails(ds => ds.filter((_, i) => i !== idx));
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ডোমেইন/websiteId সংগ্রহ করুন
    const domain = typeof window !== 'undefined' ? window.location.hostname : '';
    const productData = {
      name,
      shortDesc,
      desc,
      category,
      brand,
      condition,
      status,
      images,
      video,
      sellPrice,
      oldPrice,
      buyPrice,
      serial,
      sku,
      unit,
      stock,
      warranty,
      soldCount,
      deliveryApplied,
      variants,
      details,
      domain, // backend-এ পাঠানোর জন্য
    };
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        alert('পণ্য সফলভাবে যোগ হয়েছে!');
        // ফর্ম রিসেট/রিডাইরেক্ট করুন
      } else {
        alert('পণ্য যোগ করতে সমস্যা হয়েছে!');
      }
    } catch (err) {
      alert('সার্ভার সমস্যা হয়েছে!');
    }
  };

  // --- Render ---
  return (
    <form className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-6">Add Product</h2>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input 
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Enter product name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input 
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
            placeholder="Enter category"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input 
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={brand} 
            onChange={e => setBrand(e.target.value)} 
            placeholder="Enter brand"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input 
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={sku} 
            onChange={e => setSku(e.target.value)} 
            placeholder="Enter SKU"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <textarea 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            rows={3}
            value={shortDesc} 
            onChange={e => setShortDesc(e.target.value)} 
            placeholder="Brief description for SEO"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
          <textarea 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            rows={3}
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
            placeholder="Detailed product description"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
          <input 
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={sellPrice} 
            onChange={e => setSellPrice(e.target.value)} 
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
          <input 
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={oldPrice} 
            onChange={e => setOldPrice(e.target.value)} 
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buy Price</label>
          <input 
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={buyPrice} 
            onChange={e => setBuyPrice(e.target.value)} 
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
          <input 
            type="number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={stock} 
            onChange={e => setStock(e.target.value)} 
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <input 
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={unit} 
            onChange={e => setUnit(e.target.value)} 
            placeholder="pcs, kg, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <select 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={condition} 
            onChange={e => setCondition(e.target.value)}
          >
            <option value="New">New</option>
            <option value="Used">Used</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={status} 
            onChange={e => setStatus(e.target.value)}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Media */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Upload multiple images (JPG, PNG, GIF)</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
          <input 
            type="url"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={video} 
            onChange={e => setVideo(e.target.value)} 
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      {/* Product Variants */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
          <button 
            type="button" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            onClick={addVariant}
          >
            Add Variant
          </button>
        </div>
        
        {variants.map((variant, vIdx) => (
          <div key={vIdx} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={variant.mandatory} 
                  onChange={e => handleVariantChange(vIdx, 'mandatory', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Mandatory</span>
              </div>
              {variants.length > 1 && (
                <button 
                  type="button" 
                  className="text-red-600 hover:text-red-800 text-sm" 
                  onClick={() => removeVariant(vIdx)}
                >
                  Remove Variant
                </button>
              )}
            </div>
            
            <div className="mb-3">
              <input 
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Variant Title (e.g., Size, Color)" 
                value={variant.title} 
                onChange={e => handleVariantChange(vIdx, 'title', e.target.value)} 
              />
            </div>
            
            {variant.options.map((option, oIdx) => (
              <div key={oIdx} className="flex items-center space-x-2 mb-2">
                <input 
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Option (e.g., Large, Red)" 
                  value={option.attribute} 
                  onChange={e => handleVariantOptionChange(vIdx, oIdx, 'attribute', e.target.value)} 
                />
                <input 
                  type="number"
                  className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Price" 
                  value={option.extraPrice} 
                  onChange={e => handleVariantOptionChange(vIdx, oIdx, 'extraPrice', e.target.value)} 
                />
                {variant.options.length > 1 && (
                  <button 
                    type="button" 
                    className="text-red-600 hover:text-red-800 px-2" 
                    onClick={() => removeVariantOption(vIdx, oIdx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            <button 
              type="button" 
              className="text-blue-600 hover:text-blue-800 text-sm mt-2" 
              onClick={() => addVariantOption(vIdx)}
            >
              + Add Option
            </button>
          </div>
        ))}
      </div>

      {/* Product Details */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
          <button 
            type="button" 
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
            onClick={addDetail}
          >
            Add Detail
          </button>
        </div>
        
        {details.map((detail, dIdx) => (
          <div key={dIdx} className="flex items-center space-x-2 mb-3">
            <input 
              type="text"
              className="w-1/3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Detail Type (e.g., Material, Weight)" 
              value={detail.type} 
              onChange={e => handleDetailChange(dIdx, 'type', e.target.value)} 
            />
            <input 
              type="text"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Description" 
              value={detail.description} 
              onChange={e => handleDetailChange(dIdx, 'description', e.target.value)} 
            />
            {details.length > 1 && (
              <button 
                type="button" 
                className="text-red-600 hover:text-red-800 px-2" 
                onClick={() => removeDetail(dIdx)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Delivery */}
      <div className="flex items-center space-x-3 pt-4">
        <input 
          type="checkbox" 
          checked={deliveryApplied} 
          onChange={e => setDeliveryApplied(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">Apply delivery charges</span>
      </div>

      {/* Submit */}
      <div className="pt-6 border-t">
        <button 
          type="submit" 
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
        >
          Add Product
        </button>
      </div>
    </form>
  );
}
