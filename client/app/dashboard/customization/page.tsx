"use client";
import ThemePreview from "../../../components/ThemePreview";

import { useState, useEffect } from "react";
import { useTheme } from "../../../components/ThemeContext";
import { X } from "lucide-react";
import axios from "axios";


export default function CustomizationPage() {
  const { theme, setTheme, themes } = useTheme();
  
  // Hydration state to prevent SSR mismatch
  const [isClient, setIsClient] = useState(false);
  
  // Helper function to get website ID with proper error handling
  // Helper function to get website ID with proper error handling
  const getWebsiteId = () => {
    if (!isClient || typeof window === 'undefined') return null;
    const website = localStorage.getItem('website');
    // Keep logs minimal here because this runs often
    if (!website) return null;
    try {
      const parsedWebsite = JSON.parse(website);
      return parsedWebsite.id || null;
    } catch (e) {
      console.error('❌ Failed to parse website data:', e);
      return null;
    }
  };

  // Keep a reactive websiteId so UI can enable/disable actions immediately
  const [websiteIdState, setWebsiteIdState] = useState<string | null>(null);
  const [userWebsiteDomain, setUserWebsiteDomain] = useState<string | null>(null);
  
  // Helper function to get auth token
  const getAuthToken = () => {
    if (!isClient || typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  };
  
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
  const [currentBanners, setCurrentBanners] = useState<any[]>([]); // Store banner objects
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
    express: 150
  });


  const fetchBanners = (domain?: string) => {
    // Use domain parameter or userWebsiteDomain state
    const targetDomain = domain || userWebsiteDomain;
    if (!targetDomain) {
      console.log('❌ No domain available for banner fetch');
      setCurrentBanners([]);
      return;
    }
    
    console.log('📡 Making API request for banners with domain:', targetDomain);
    axios.get(`http://localhost:5000/api/banner?domain=${targetDomain}`)
      .then(res => {
        console.log('✅ Banner API response:', res.data);
        if (Array.isArray(res.data)) {
          setCurrentBanners(res.data); // Store full banner objects
          console.log('📸 Banners loaded:', res.data.length);
        } else if (res.data && res.data.imageUrl) {
          setCurrentBanners([res.data]); // Single banner as object
          console.log('📸 Single banner loaded');
        } else {
          console.log('📭 No banners found');
          setCurrentBanners([]);
        }
      })
      .catch((error) => {
        console.error('❌ Banner fetch error:', error);
        console.error('❌ Error response:', error.response?.data);
        setError(`Banner fetch failed: ${error.response?.data?.message || error.message}`);
        setCurrentBanners([]);
      });
  };

  useEffect(() => {
    // Set client hydration state
    setIsClient(true);
  }, []);

  // Sync websiteIdState with localStorage and listen for cross-tab selection
  useEffect(() => {
    if (!isClient) return;
    
    const syncFromStorage = () => {
      const id = getWebsiteId();
      setWebsiteIdState(id);
      
      // Auto-detect user's website domain from localStorage
      let websiteDomain = null;
      try {
        const raw = localStorage.getItem('website');
        console.log('🔍 Raw website data from localStorage:', raw);
        if (raw) {
          const parsed = JSON.parse(raw);
          console.log('📊 Parsed website object:', parsed);
          if (parsed && parsed.domain) {
            websiteDomain = parsed.domain;
            console.log('✅ Found website domain:', websiteDomain);
          }
        } else {
          // No website in localStorage - clear any old data and redirect
          console.log('⚠️ No website in localStorage - clearing old data');
          localStorage.clear(); // Clear all old data
          setError('❌ No website found! Redirecting to Dashboard to load your website...');
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          return;
        }
      } catch (e) {
        console.error('❌ Error parsing website data:', e);
      }
      
      setUserWebsiteDomain(websiteDomain);
      console.log('🌐 Auto-detected user website domain:', websiteDomain);
      
      // If we have websiteId, fetch banners
      if (websiteDomain) {
        setError('');
        // Pass domain directly to fetchBanners
        fetchBanners(websiteDomain);
      } else {
        setError('❌ No website selected! Please go to Dashboard and select a website first.');
      }
    };

    syncFromStorage();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'website' || e.key === null) {
        // website key changed (or storage cleared) — resync
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isClient]);

  useEffect(() => {
    // Only run after client hydration
    if (!isClient) return;
    
    // Load delivery charge from localStorage
    const savedDeliveryCharge = localStorage.getItem('deliveryCharge');
    if (savedDeliveryCharge) {
      try {
        const parsedCharge = JSON.parse(savedDeliveryCharge);
        setDeliveryCharge(parsedCharge);
      } catch (e) {
        console.error('Error parsing delivery charge:', e);
      }
    }
  }, [isClient]);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBanners(files);
    setBannerPreviews(files.map(file => URL.createObjectURL(file)));
  };


  const handleSave = async () => {
    setSaving(true);
    setError("");
    
    console.log('🔄 Starting save process...');
    
    const websiteId = websiteIdState || getWebsiteId();
    const token = getAuthToken();
    
    console.log('🆔 Website ID:', websiteId);
    console.log('🔑 Token available:', !!token);
    
    // Check if we can proceed with upload (websiteId OR user's website domain)
    const domainToUse = userWebsiteDomain;
    
    if (!domainToUse) {
      setError('❌ ওয়েবসাইট পাওয়া যায়নি! Please go to Dashboard and select a website first.');
      setSaving(false);
      return;
    }
    
    console.log('🌐 Using automatic domain detection:', domainToUse);
    
    if (!token) {
      setError('❌ Authentication token পাওয়া যায়নি! Please login again.');
      setSaving(false);
      return;
    }

    try {
      
      if (banners.length > 0) {
        console.log('🔄 Starting banner upload...', { count: banners.length, websiteId });
        
        for (const banner of banners) {
          console.log('📸 Uploading banner:', banner.name, banner.size, 'bytes');
          
          const formData = new FormData();
          formData.append("banner", banner);
          // Don't send websiteId in body, server will resolve from domain parameter
          
          // Always use domain-based upload for better compatibility
          const url = `http://localhost:5000/api/banner?domain=${encodeURIComponent(domainToUse)}`;
          
          console.log('📡 Uploading to URL:', url);
          
          await axios.post(url, formData, {
            headers: { 
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${token}`
            },
          });
          
          console.log('✅ Banner uploaded successfully');
        }
        
        setBanners([]);
        setBannerPreviews([]);
        // Reset file input to allow selecting new files
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchBanners(domainToUse);
        console.log('🎉 All banners uploaded successfully!');
        
        // Notify subdomain about banner update using localStorage for cross-tab communication
        console.log('📢 Triggering banner update notification via localStorage...');
        const timestamp = Date.now();
        localStorage.setItem('bannerUpdateTrigger', timestamp.toString());
        console.log('✨ Banner update notification sent with timestamp:', timestamp);
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

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('এই ব্যানারটি মুছে ফেলবেন?')) return;
    
    setDeleting(true);
    setError("");
    
    console.log('🗑️ Starting banner delete process...');
    
    const websiteId = getWebsiteId();
    const token = getAuthToken();
    
    console.log('🆔 Website ID for delete:', websiteId);
    console.log('🔑 Token available for delete:', !!token);
    
    if (!websiteId) {
      setError('❌ Website ID not found. Please logout and login again.');
      setDeleting(false);
      return;
    }
    
    if (!token) {
      setError('❌ Authentication required. Please login again.');
      setDeleting(false);
      return;
    }

    try {
      console.log('🗑️ Deleting banner:', bannerId);
      const response = await axios.delete(`http://localhost:5000/api/banner?bannerId=${bannerId}&websiteId=${websiteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Banner deleted:', response.data);
      setError('✅ ব্যানার সফলভাবে মুছে ফেলা হয়েছে!');
      
      // Refresh banners list
      fetchBanners();
      
    } catch (error: any) {
      console.error('❌ Banner delete error:', error);
      setError(`❌ ব্যানার মুছতে সমস্যা: ${error.response?.data?.message || error.message}`);
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
          {bannerPreviews.length === 0 && currentBanners.filter(banner => banner && banner.imageUrl && banner.imageUrl !== 'null').length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {currentBanners.filter(banner => banner && banner.imageUrl && banner.imageUrl !== 'null').map((banner, i) => (
                <div key={banner.id || i} className="relative group">
                  <img 
                    src={`http://localhost:5000${banner.imageUrl}`} 
                    alt={`Current Banner ${i+1}`} 
                    className="rounded shadow w-full h-32 object-cover" 
                  />
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    disabled={deleting}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    title="ব্যানার মুছুন"
                  >
                    ❌
                  </button>
                  <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    #{i + 1}
                  </div>
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
            value={newArrivalsCount || 0}
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
            value={bestSaleCount || 0}
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
              <label className="block font-medium mb-2">ঢাকা বিভাগ → ঢাকা জেলা ডেলিভারি চার্জ (৳)</label>
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
              <label className="block font-medium mb-2">ঢাকা বিভাগের অন্য জেলা + অন্যান্য বিভাগ (৳)</label>
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
              <label className="block font-medium mb-2">এক্সপ্রেস ডেলিভারি (সব অঞ্চল) (৳)</label>
              <input
                type="number"
                min={0}
                value={deliveryCharge.express}
                onChange={e => setDeliveryCharge(prev => ({
                  ...prev,
                  express: Number(e.target.value)
                }))}
                className="border rounded px-3 py-2 w-full"
                placeholder="যেমন: ১৫০"
              />
            </div>
          </div>

          {/* Delivery Info Display */}
          <div className="mt-4 p-3 bg-blue-50 rounded border">
            <h4 className="font-medium mb-2">ডেলিভারি তথ্য প্রিভিউ:</h4>
            <div className="text-sm space-y-1">
              <div>• ঢাকা বিভাগ → ঢাকা জেলা: ৳{deliveryCharge.insideDhaka}</div>
              <div>• ঢাকা বিভাগের অন্য জেলা + অন্যান্য বিভাগ: ৳{deliveryCharge.outsideDhaka}</div>
              {deliveryCharge.freeDeliveryMinimum > 0 && (
                <div>• ৳{deliveryCharge.freeDeliveryMinimum}+ অর্ডারে ফ্রি ডেলিভারি</div>
              )}
              {deliveryCharge.express > 0 && (
                <div>• এক্সপ্রেস ডেলিভারি (সব অঞ্চল): ৳{deliveryCharge.express}</div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className={`bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-semibold ${(!(websiteIdState || userWebsiteDomain) || saving) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={saving || !(websiteIdState || userWebsiteDomain)}
          title={!(websiteIdState || userWebsiteDomain) ? 'Please go to Dashboard and select a website first' : ''}
        >
          {saving ? "সেভ হচ্ছে..." : "সেভ সেটিংস"}
        </button>
      </div>

      {/* Right Section - Preview */}
      <div className="flex-1 min-w-96">
        <div className="sticky top-6">
          <ThemePreview 
            products={products} 
            banners={currentBanners.filter(banner => banner && banner.imageUrl && banner.imageUrl !== 'null')}
          />
        </div>
      </div>
    </div>
  );
}
