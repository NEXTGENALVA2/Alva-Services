import React, { useState } from 'react';

const PixelSettingsForm = ({ onSave, initialData }: { onSave: (data: any) => void, initialData?: any }) => {
  const [facebookPixel, setFacebookPixel] = useState(initialData?.facebookPixel || '');
  const [tiktokPixel, setTiktokPixel] = useState(initialData?.tiktokPixel || '');
  const [googleTagManager, setGoogleTagManager] = useState(initialData?.googleTagManager || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ facebookPixel, tiktokPixel, googleTagManager });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-bold mb-1">Facebook Pixel ID</label>
        <input type="text" value={facebookPixel} onChange={e => setFacebookPixel(e.target.value)} className="border p-2 w-full" />
      </div>
      <div>
        <label className="block font-bold mb-1">TikTok Pixel ID</label>
        <input type="text" value={tiktokPixel} onChange={e => setTiktokPixel(e.target.value)} className="border p-2 w-full" />
      </div>
      <div>
        <label className="block font-bold mb-1">Google Tag Manager ID</label>
        <input type="text" value={googleTagManager} onChange={e => setGoogleTagManager(e.target.value)} className="border p-2 w-full" />
      </div>
      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">সংরক্ষণ করুন</button>
    </form>
  );
};

export default PixelSettingsForm;
