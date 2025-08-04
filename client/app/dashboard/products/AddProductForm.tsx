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

interface AddProductFormProps {
  onSubmit: (productData: any) => void;
}

export default function AddProductForm({ onSubmit }: AddProductFormProps) {
  // --- State ---
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('categories');
      if (stored) return JSON.parse(stored);
    }
    return ['Gadgets', 'Camera', 'Electronics', 'Clothing', 'Home & Garden', 'Books'];
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories]);
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('New');
  const [status, setStatus] = useState('ACTIVE');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
      const files = Array.from(e.target.files);
      setImages(files);
      
      // Create preview URLs
      const previews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            previews.push(event.target.result as string);
            setImagePreviews([...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    const newPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    setImagePreviews(newPreviews);
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

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim() || !sellPrice.trim()) {
      alert('প্রোডাক্টের নাম এবং দাম দিতে হবে!');
      return;
    }

    // Price validation
    const sell = parseFloat(sellPrice);
    const original = parseFloat(oldPrice);
    const buy = parseFloat(buyPrice);

    if (!isNaN(original) && !isNaN(sell) && original <= sell) {
      alert('মূল্য (Original Price) অবশ্যই বিক্রয় মূল্যের (Selling Price) চেয়ে বেশি হতে হবে!');
      return;
    }
    if (!isNaN(buy) && !isNaN(sell) && buy >= sell) {
      alert('ক্রয় মূল্য (Buy Price) অবশ্যই বিক্রয় মূল্যের (Selling Price) চেয়ে কম হতে হবে!');
      return;
    }
    if (!isNaN(buy) && !isNaN(original) && buy >= original) {
      alert('ক্রয় মূল্য (Buy Price) অবশ্যই মূল্যের (Original Price) চেয়ে কম হতে হবে!');
      return;
    }

    // Prepare form data
    const filteredVariants = variants.filter(variant => 
      variant.title.trim() !== '' && 
      variant.options.some(option => option.attribute.trim() !== '')
    );
    
    const filteredDetails = details.filter(detail => 
      detail.type.trim() !== '' && detail.description.trim() !== ''
    );

    const productData = {
      name: name.trim(),
      shortDesc,
      desc,
      category,
      brand,
      condition,
      status,
      images: imagePreviews, // Use image previews as base64 data URLs
      video,
      sellPrice,
      oldPrice,
      buyPrice,
      sku,
      unit,
      stock,
      warranty,
      variants: filteredVariants,
      details: filteredDetails,
      deliveryApplied
    };

    // Call the onSubmit function passed from parent
    onSubmit(productData);
  };

  // --- Render ---
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
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
          <div className="flex gap-2 items-center">
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={category}
              onChange={e => setCategory(e.target.value)}
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
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
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
                placeholder="ভ্যারিয়েন্ট শিরোনাম (যেমন: সাইজ, রং)" 
                value={variant.title} 
                onChange={e => handleVariantChange(vIdx, 'title', e.target.value)} 
              />
            </div>
            
            {variant.options.map((option, oIdx) => (
              <div key={oIdx} className="flex items-center space-x-2 mb-2">
                <input 
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="অপশন (যেমন: বড়, লাল)" 
                  value={option.attribute} 
                  onChange={e => handleVariantOptionChange(vIdx, oIdx, 'attribute', e.target.value)} 
                />
                <input 
                  type="number"
                  className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="মূল্য" 
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
              + অপশন যোগ করুন
            </button>
          </div>
        ))}
      </div>

      {/* Product Details */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">প্রোডাক্ট ডিটেইলস</h3>
          <button 
            type="button" 
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500" 
            onClick={addDetail}
          >
            ডিটেইল যোগ করুন
          </button>
        </div>
        
        {details.map((detail, dIdx) => (
          <div key={dIdx} className="flex items-center space-x-2 mb-3">
            <input 
              type="text"
              className="w-1/3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="ডিটেইল টাইপ (যেমন: ম্যাটেরিয়াল, ওজন)" 
              value={detail.type} 
              onChange={e => handleDetailChange(dIdx, 'type', e.target.value)} 
            />
            <input 
              type="text"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="বর্ণনা" 
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
