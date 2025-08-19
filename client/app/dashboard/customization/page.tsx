"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";


export default function CustomizationPage() {
  const [banners, setBanners] = useState<File[]>([]);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [currentBanners, setCurrentBanners] = useState<string[]>([]);
  const [newArrivalsCount, setNewArrivalsCount] = useState(0);
  const [bestSaleCount, setBestSaleCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>("");


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
      setSaving(false);
      return;
    }
    try {
      if (banners.length > 0) {
        for (const banner of banners) {
          const formData = new FormData();
          formData.append("banner", banner);
          formData.append("websiteId", websiteId);
          await axios.post("http://localhost:5000/api/banner", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        setError("সব ব্যানার সফলভাবে আপলোড হয়েছে!");
        setBanners([]);
        setBannerPreviews([]);
        fetchBanners();
      }
      // TODO: Save newArrivalsCount, bestSaleCount to backend (not implemented yet)
    } catch (err: any) {
      setError(`ব্যানার আপলোড ব্যর্থ: ${err.response?.data?.error || err.message}`);
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
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
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
      <button
        onClick={handleSave}
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-semibold"
        disabled={saving}
      >
        {saving ? "সেভ হচ্ছে..." : "সেভ সেটিংস"}
      </button>
    </div>
  );
}
