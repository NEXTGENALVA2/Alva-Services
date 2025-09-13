import React, { useState, useEffect } from 'react';
import countries from 'world-countries';
import { useRegion, CountryRegion } from '@/components/RegionContext';

// Prepare country list with currency and language
const countryList: CountryRegion[] = countries.map((c: any) => ({
  cca2: c.cca2,
  name: c.name.common,
  currency: c.currencies ? Object.keys(c.currencies)[0] : 'USD',
  languages: c.languages ? Object.values(c.languages).map(String) : ['English'],
  flag: c.flag,
})).sort((a, b) => a.name.localeCompare(b.name));

export default function CountryRegionSelector() {
  const { selectedRegion, setSelectedRegion } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countryList.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCountry = (country: CountryRegion) => {
    setSelectedRegion(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Current Selection Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{selectedRegion.flag}</span>
        <span className="font-medium">{selectedRegion.currency}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white border rounded-lg shadow-lg z-50">
          {/* Search */}
          <div className="p-3 border-b">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.map(country => (
              <button
                key={country.cca2}
                onClick={() => handleSelectCountry(country)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3 ${
                  selectedRegion.cca2 === country.cca2 ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{country.name}</div>
                  <div className="text-sm text-gray-500">
                    {country.currency} • {country.languages[0]}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
