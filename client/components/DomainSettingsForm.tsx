import React, { useState } from 'react';

const DomainSettingsForm = ({ onSave, initialData }: { onSave: (domain: string) => void, initialData?: any }) => {
  const [domain, setDomain] = useState(initialData?.domain || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(domain);
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block font-bold mb-1">ডোমেইন/সাবডোমেইন</label>
        <input 
          type="text" 
          value={domain} 
          onChange={e => setDomain(e.target.value)} 
          className="border p-2 w-full" 
          placeholder="eamin (subdomain) বা www.eamin.com (full domain)" 
        />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
          ডোমেইন সংরক্ষণ করুন
        </button>
      </form>
      
      {initialData?.url && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">আপনার ওয়েবসাইট URL:</p>
          <a href={initialData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {initialData.url}
          </a>
          <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded">
            {initialData.type === 'full' ? 'Full Domain' : 'Subdomain'}
          </span>
        </div>
      )}
    </div>
  );
};

export default DomainSettingsForm;
