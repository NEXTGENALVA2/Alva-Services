'use client'

import PixelSettingsForm from '../../components/PixelSettingsForm';
import { savePixelSettings, getPixelSettings } from '../../lib/pixel';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SettingsPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState<any>(null);
  const [websiteName, setWebsiteName] = useState('');
  const [savingWebsite, setSavingWebsite] = useState(false);

  useEffect(() => {
    getPixelSettings().then(data => {
      setInitialData(data);
      setLoading(false);
    });
    
    // Fetch current website
    fetchWebsite();
  }, []);

  const fetchWebsite = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/websites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWebsite(response.data);
      setWebsiteName(response.data.name);
    } catch (error) {
      console.error('Error fetching website:', error);
    }
  };

  const handleSave = async (data: any) => {
    const res = await savePixelSettings(data);
    if (res.success) {
      alert('Pixel settings সংরক্ষণ হয়েছে!');
    } else {
      alert('সংরক্ষণে সমস্যা হয়েছে!');
    }
  };

  const handleWebsiteUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteName.trim()) {
      alert('ওয়েবসাইটের নাম দিতে হবে!');
      return;
    }

    setSavingWebsite(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/websites/update', 
        { name: websiteName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('ওয়েবসাইটের নাম সফলভাবে পরিবর্তন হয়েছে!');
      
      // Update localStorage
      localStorage.setItem('website', JSON.stringify(response.data.website));
      
      // Refresh website data
      await fetchWebsite();
      
      // Trigger domain update event
      window.dispatchEvent(new CustomEvent('domainUpdated'));
      
    } catch (error: any) {
      console.error('Website update error:', error);
      alert('ওয়েবসাইটের নাম পরিবর্তন করতে সমস্যা হয়েছে!');
    } finally {
      setSavingWebsite(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Website Settings Section */}
      {website && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ওয়েবসাইট সেটিংস</h2>
          
          <form onSubmit={handleWebsiteUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ওয়েবসাইটের নাম
              </label>
              <input
                type="text"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="আপনার ওয়েবসাইটের নাম লিখুন"
                required
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>বর্তমান ডোমেইন:</strong> {website.domain}</p>
              <p><strong>ওয়েবসাইট লিংক:</strong> http://localhost:3000/{website.domain}</p>
            </div>
            
            <button
              type="submit"
              disabled={savingWebsite}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {savingWebsite ? 'সেভ করা হচ্ছে...' : 'নাম পরিবর্তন করুন'}
            </button>
          </form>
        </div>
      )}

      {/* Pixel Settings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Pixel Settings</h2>
        {loading ? (
          <p>লোড হচ্ছে...</p>
        ) : (
          <PixelSettingsForm onSave={handleSave} initialData={initialData} />
        )}
      </div>
    </div>
  );
}
