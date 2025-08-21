"use client";
import ThemePreview from "../../../components/ThemePreview";

import { useState, useEffect } from "react";
import { useTheme } from "../../../components/ThemeContext";
import { X } from "lucide-react";
import axios from "axios";


export default function CustomizationPage() {
  const { theme, setTheme, themes } = useTheme();
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    // Fetch products for preview
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);
  const [banners, setBanners] = useState<File[]>([]);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [currentBanners, setCurrentBanners] = useState<string[]>([]);
  const [newArrivalsCount, setNewArrivalsCount] = useState(0);
  const [bestSaleCount, setBestSaleCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Delivery charge state
  const [deliveryCharge, setDeliveryCharge] = useState({
    insideDhaka: 60,
    outsideDhaka: 120,
    freeDeliveryMinimum: 1000,
    expressDelivery: 150
  });


  const fetchBanners = () => {
    let websiteId = '';
    if (typeof window !== 'undefined') {
      const website = localStorage.getItem('website');
      if (website) {
        try {
          websiteId = JSON.parse(website).id;
        } catch {}
      }
    }
    if (!websiteId) return;
    axios.get(`http://localhost:5000/api/banner?websiteId=${websiteId}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setCurrentBanners(res.data.map(b => `http://localhost:5000${b.imageUrl}`));
        } else if (res.data && res.data.imageUrl) {
          setCurrentBanners([`http://localhost:5000${res.data.imageUrl}`]);
        } else {
          setCurrentBanners([]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBanners();
    
    // Load delivery charge from localStorage
    if (typeof window !== 'undefined') {
      const savedDeliveryCharge = localStorage.getItem('deliveryCharge');
      if (savedDeliveryCharge) {
        try {
          const parsedCharge = JSON.parse(savedDeliveryCharge);
          setDeliveryCharge(parsedCharge);
        } catch (e) {
          console.error('Error parsing delivery charge:', e);
        }
      }
    }
  }, []);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBanners(files);
    setBannerPreviews(files.map(file => URL.createObjectURL(file)));
  };


  const handleSave = async () => {
    setSaving(true);
    setError("");
    let websiteId = '';
    let token = '';
    
    if (typeof window !== 'undefined') {
      const website = localStorage.getItem('website');
      token = localStorage.getItem('token') || '';
      if (website) {
        try {
          websiteId = JSON.parse(website).id;
          console.log('DEBUG: WebsiteId found:', websiteId);
        } catch (e) {
          console.error('DEBUG: Error parsing website:', e);
        }
      }
    }
    
    if (!websiteId) {
      setError('ওয়েবসাইট আইডি পাওয়া যায়নি!');
      setSaving(false);
      return;
    }
    
    if (!token) {
      setError('Authentication token পাওয়া যায়নি!');
      setSaving(false);
      return;
    }

    try {
      console.log('DEBUG: Starting save process...');
      
      if (banners.length > 0) {
        console.log('DEBUG: Uploading banners...');
        for (const banner of banners) {
          const formData = new FormData();
          formData.append("banner", banner);
          formData.append("websiteId", websiteId);
          await axios.post("http://localhost:5000/api/banner", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        console.log('DEBUG: Banners uploaded successfully');
        setBanners([]);
        setBannerPreviews([]);
        fetchBanners();
      }
      
      // Save theme to backend with authentication
      console.log('DEBUG: Saving theme:', theme.name);
      const themeResponse = await axios.put(`http://localhost:5000/api/websites/${websiteId}/theme`, 
        { theme }, 
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('DEBUG: Theme save response:', themeResponse.data);
      
      // Save delivery charge to localStorage
      localStorage.setItem('deliveryCharge', JSON.stringify(deliveryCharge));
      
      // TODO: Save newArrivalsCount, bestSaleCount to backend (not implemented yet)
      setError("Theme and settings saved successfully!");
    } catch (err: any) {
      console.error('DEBUG: Save error:', err);
      setError(`সেটিংস সেভ ব্যর্থ: ${err.response?.data?.message || err.message}`);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    let websiteId = '';
    if (typeof window !== 'undefined') {
      const website = localStorage.getItem('website');
      if (website) {
        try {
          websiteId = JSON.parse(website).id;
        } catch {}
      }
    }
    if (!websiteId) {
      setError('ওয়েবসাইট আইডি পাওয়া যায়নি!');
      setDeleting(false);
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/banner?websiteId=${websiteId}`);
  setCurrentBanners([]);
    } catch (err: any) {
      setError("Delete failed");
    }
    setDeleting(false);
  };

  return (
    <div className="flex gap-6 max-w-7xl mx-auto bg-white p-6 rounded-lg shadow">
      {/* Left Section - Controls */}
      <div className="flex-1 max-w-xl">
        <h2 className="text-xl font-bold mb-4">থিম সিলেক্ট করুন</h2>
        <div className="flex gap-4 mb-8">
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => setTheme(t)}
              className={`border rounded-lg p-4 flex-1 flex flex-col items-center justify-center shadow transition-all duration-200 ${theme.name === t.name ? 'border-purple-600 ring-2 ring-purple-400' : 'border-gray-200'}`}
              style={{ background: t.colors.background }}
            >
              <div className="font-bold text-lg mb-2" style={{ color: t.colors.primary }}>{t.name}</div>
              <div className="w-8 h-8 rounded-full mb-2" style={{ background: t.colors.primary }}></div>
              <span className="text-xs" style={{ color: t.colors.text }}>Mode: {t.mode}</span>
              {theme.name === t.name && <span className="mt-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Active</span>}
            </button>
          ))}
        </div>
        
        <h1 className="text-2xl font-bold mb-6">ওয়েবসাইট কাস্টমাইজেশন</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        
        <div className="mb-6">
          <label className="block font-medium mb-2">ব্যানার আপলোড করুন (সেরা: ১২০০x৩০০px, JPG/PNG)</label>
          <input type="file" accept="image/*" multiple onChange={handleBannerChange} />
          {bannerPreviews.length > 0 && (
            <div className="flex gap-4 mt-4">
              {bannerPreviews.map((src, i) => (
                <img key={i} src={src} alt={`Banner Preview ${i+1}`} className="rounded shadow w-full max-h-48 object-cover" />
              ))}
            </div>
          )}
          {bannerPreviews.length === 0 && currentBanners.filter(src => src && src !== 'http://localhost:5000null').length > 0 && (
            <div className="flex gap-4 mt-4">
              {currentBanners.filter(src => src && src !== 'http://localhost:5000null').map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt={`Current Banner ${i+1}`} className="rounded shadow w-full max-h-48 object-cover" />
                  <button
                    onClick={async () => {
                      // Delete banner API call
                      let websiteId = '';
                      if (typeof window !== 'undefined') {
                        const website = localStorage.getItem('website');
                        if (website) {
                          try {
                            websiteId = JSON.parse(website).id;
                          } catch {}
                        }
                      }
                      try {
                        await axios.delete(`http://localhost:5000/api/banner?websiteId=${websiteId}&imageUrl=${encodeURIComponent(src.replace('http://localhost:5000',''))}`);
                        setCurrentBanners(currentBanners.filter((s, idx) => s !== src));
                      } catch {}
                    }}
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-gray-700 hover:bg-red-500 hover:text-white transition z-10"
                    title="ডিলিট করুন"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block font-medium mb-2">নিউ অ্যারাইভালস: কতগুলো প্রোডাক্ট দেখাবেন?</label>
          <input
            type="number"
            min={1}
            max={20}
            value={newArrivalsCount}
            onChange={e => setNewArrivalsCount(Number(e.target.value))}
            className="border rounded px-3 py-2 w-24"
          />
        </div>
        
        <div className="mb-6">
          <label className="block font-medium mb-2">বেস্ট সেল: কতগুলো প্রোডাক্ট দেখাবেন?</label>
          <input
            type="number"
            min={1}
            max={20}
            value={bestSaleCount}
            onChange={e => setBestSaleCount(Number(e.target.value))}
            className="border rounded px-3 py-2 w-24"
          />
        </div>

        {/* Delivery Charge Configuration */}
        <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.primary }}>
            ডেলিভারি চার্জ সেটিংস
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inside Dhaka */}
            <div>
              <label className="block font-medium mb-2">ঢাকার ভিতরে ডেলিভারি চার্জ (৳)</label>
              <input
                type="number"
                min={0}
                value={deliveryCharge.insideDhaka}
                onChange={e => setDeliveryCharge(prev => ({
                  ...prev,
                  insideDhaka: Number(e.target.value)
                }))}
                className="border rounded px-3 py-2 w-full"
                placeholder="যেমন: ৬০"
              />
            </div>

            {/* Outside Dhaka */}
            <div>
              <label className="block font-medium mb-2">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</label>
              <input
                type="number"
                min={0}
                value={deliveryCharge.outsideDhaka}
                onChange={e => setDeliveryCharge(prev => ({
                  ...prev,
                  outsideDhaka: Number(e.target.value)
                }))}
                className="border rounded px-3 py-2 w-full"
                placeholder="যেমন: ১২০"
              />
            </div>

            {/* Free Delivery Minimum */}
            <div>
              <label className="block font-medium mb-2">ফ্রি ডেলিভারি মিনিমাম অর্ডার (৳)</label>
              <input
                type="number"
                min={0}
                value={deliveryCharge.freeDeliveryMinimum}
                onChange={e => setDeliveryCharge(prev => ({
                  ...prev,
                  freeDeliveryMinimum: Number(e.target.value)
                }))}
                className="border rounded px-3 py-2 w-full"
                placeholder="যেমন: ১০০০ (খালি রাখলে ফ্রি ডেলিভারি নেই)"
              />
            </div>

            {/* Express Delivery */}
            <div>
              <label className="block font-medium mb-2">এক্সপ্রেস ডেলিভারি চার্জ (৳)</label>
              <input
                type="number"
                min={0}
                value={deliveryCharge.expressDelivery}
                onChange={e => setDeliveryCharge(prev => ({
                  ...prev,
                  expressDelivery: Number(e.target.value)
                }))}
                className="border rounded px-3 py-2 w-full"
                placeholder="যেমন: ১৫০ (খালি রাখলে এক্সপ্রেস নেই)"
              />
            </div>
          </div>

          {/* Delivery Info Display */}
          <div className="mt-4 p-3 bg-blue-50 rounded border">
            <h4 className="font-medium mb-2">ডেলিভারি তথ্য প্রিভিউ:</h4>
            <div className="text-sm space-y-1">
              <div>• ঢাকার ভিতরে: ৳{deliveryCharge.insideDhaka}</div>
              <div>• ঢাকার বাইরে: ৳{deliveryCharge.outsideDhaka}</div>
              {deliveryCharge.freeDeliveryMinimum > 0 && (
                <div>• ৳{deliveryCharge.freeDeliveryMinimum}+ অর্ডারে ফ্রি ডেলিভারি</div>
              )}
              {deliveryCharge.expressDelivery > 0 && (
                <div>• এক্সপ্রেস ডেলিভারি: ৳{deliveryCharge.expressDelivery}</div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-semibold"
          disabled={saving}
        >
          {saving ? "সেভ হচ্ছে..." : "সেভ সেটিংস"}
        </button>
      </div>

      {/* Right Section - Preview */}
      <div className="flex-1 min-w-96">
        <div className="sticky top-6">
          <ThemePreview products={products} />
        </div>
      </div>
    </div>
  );
}
