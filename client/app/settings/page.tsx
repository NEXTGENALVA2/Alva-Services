import PixelSettingsForm from '../../components/PixelSettingsForm';
import { savePixelSettings, getPixelSettings } from '../../lib/pixel';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPixelSettings().then(data => {
      setInitialData(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (data: any) => {
    const res = await savePixelSettings(data);
    if (res.success) {
      alert('Pixel settings সংরক্ষণ হয়েছে!');
    } else {
      alert('সংরক্ষণে সমস্যা হয়েছে!');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings Page</h1>
      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        <PixelSettingsForm onSave={handleSave} initialData={initialData} />
      )}
    </div>
  );
}
