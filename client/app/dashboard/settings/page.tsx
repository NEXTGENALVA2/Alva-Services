"use client";
import PixelSettingsForm from '../../../components/PixelSettingsForm';
import DomainSettingsForm from '../../../components/DomainSettingsForm';
import { saveDomain, getDomain } from '../../../lib/domain';
import { savePixelSettings, getPixelSettings } from '../../../lib/pixel';
import { useEffect, useState } from 'react';

export default function DashboardSettingsPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [domainData, setDomainData] = useState<any>({});
  const [domainLoading, setDomainLoading] = useState(true);

  useEffect(() => {
    getPixelSettings().then(data => {
      setInitialData(data);
      setLoading(false);
    });
    getDomain().then(d => {
      setDomainData(d);
      setDomainLoading(false);
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

  const handleDomainSave = async (newDomain: string) => {
    const res = await saveDomain(newDomain);
    if (res.success) {
      // Backend theke latest domain abar fetch kore UI update korchi
      const latest = await getDomain();
      setDomainData(latest);
  // Notify all components (like Topbar) to update domain
  window.dispatchEvent(new Event('domainUpdated'));
  alert(`ডোমেইন সংরক্ষণ হয়েছে! আপনার নতুন URL: ${res.url}`);
      
      // Auto redirect remove korchi - user manually click korle jabe
    } else {
      alert('ডোমেইন সংরক্ষণে সমস্যা হয়েছে!');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">ডোমেইন ম্যানেজমেন্ট</h2>
        {domainLoading ? (
          <p>লোড হচ্ছে...</p>
        ) : (
          <DomainSettingsForm onSave={handleDomainSave} initialData={domainData} />
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Boost & Tracking</h2>
        {loading ? (
          <p>লোড হচ্ছে...</p>
        ) : (
          <PixelSettingsForm onSave={handleSave} initialData={initialData} />
        )}
      </div>
    </div>
  );
}
