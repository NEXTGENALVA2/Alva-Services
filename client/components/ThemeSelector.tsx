"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import axios from 'axios';

interface ThemeTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'basic' | 'premium' | 'enterprise';
  previewImage?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  layout: Record<string, any>;
  typography: Record<string, any>;
  components: Record<string, any>;
  price: number;
  isSubscriptionRequired: boolean;
}

interface ThemeSelectorProps {
  onThemeSelect: (theme: ThemeTemplate) => void;
  currentTheme?: string;
  isApplying?: boolean;
}

export default function ThemeSelector({ onThemeSelect, currentTheme, isApplying = false }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<ThemeTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basic' | 'premium' | 'enterprise'>('basic');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [previewTheme, setPreviewTheme] = useState<ThemeTemplate | null>(null);

  useEffect(() => {
    fetchThemes();
  }, [selectedCategory]);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/themes/templates';
      if (selectedCategory !== 'all') {
        url += `?category=${selectedCategory}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setThemes(response.data.themes);
      } else {
        setError('থিম লোড করতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      setError('সার্ভার থেকে থিম লোড করতে পারছি না');
      console.error('Theme fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      basic: { text: 'ফ্রি', class: 'bg-green-100 text-green-800' },
      premium: { text: 'প্রিমিয়াম', class: 'bg-blue-100 text-blue-800' },
      enterprise: { text: 'এন্টারপ্রাইজ', class: 'bg-purple-100 text-purple-800' }
    };
    return badges[category as keyof typeof badges] || badges.basic;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'ফ্রি';
    return `৳${price.toLocaleString()}`;
  };

  const handleThemeSelect = async (theme: ThemeTemplate) => {
    onThemeSelect(theme);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">থিম লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">🎨 Basic Design Section</h2>
        <p className="text-gray-600 mb-6">আপনার ওয়েবসাইটের জন্য সুন্দর থিম বেছে নিন</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: 'all', label: '🔵 সব থিম', desc: 'সকল উপলব্ধ থিম' },
            { key: 'basic', label: '🆓 বেসিক ডিজাইন', desc: 'ফ্রি থিম সমূহ' },
            { key: 'premium', label: '💎 প্রিমিয়াম', desc: 'উন্নত ফিচার' },
            { key: 'enterprise', label: '🏢 এন্টারপ্রাইজ', desc: 'ব্যবসায়িক' }
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key as any)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                selectedCategory === cat.key 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              title={cat.desc}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Basic Design Highlight */}
        {selectedCategory === 'basic' && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🎯</span>
              <h3 className="font-bold text-green-800">Basic Design Section</h3>
            </div>
            <p className="text-green-700 text-sm">
              এই সেকশনে ফ্রি basic design থিম রয়েছে। আপনি যেকোনো থিম সিলেক্ট করে সাথে সাথে আপনার ওয়েবসাইটে প্রয়োগ করতে পারবেন।
            </p>
          </div>
        )}
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => {
          const badge = getCategoryBadge(theme.category);
          const isCurrentTheme = currentTheme === theme.name;
          
          return (
            <div
              key={theme.id}
              className={`relative border rounded-xl overflow-hidden transition-all hover:shadow-xl transform hover:scale-105 ${
                isCurrentTheme ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'
              } ${theme.category === 'basic' ? 'bg-gradient-to-br from-green-50 to-blue-50' : 'bg-white'}`}
            >
              {/* Basic Design Badge */}
              {theme.category === 'basic' && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                  🆓 Basic Design
                </div>
              )}

              {/* Preview Area */}
              <div className="h-40 p-4" style={{ background: theme.colors.background }}>
                <div className="h-full rounded-lg shadow-inner" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}>
                  <div className="p-4 text-sm" style={{ color: 'white' }}>
                    <div className="font-bold mb-2">{theme.displayName}</div>
                    <div className="opacity-90 text-xs">লাইভ প্রিভিউ দেখুন</div>
                    {/* Mini color palette */}
                    <div className="flex gap-1 mt-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.primary }}></div>
                      <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.secondary }}></div>
                      <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.accent }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Theme Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{theme.displayName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.class} shadow-sm`}>
                    {badge.text}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{theme.description}</p>
                
                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-bold text-xl ${theme.category === 'basic' ? 'text-green-600' : ''}`} style={{ color: theme.category === 'basic' ? '#059669' : theme.colors.primary }}>
                    {formatPrice(theme.price)}
                    {theme.price === 0 && <span className="text-sm ml-1">✨</span>}
                  </span>
                  {theme.isSubscriptionRequired && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      সাবস্ক্রিপশন প্রয়োজন
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setPreviewTheme(theme)}
                    className="flex-1 px-4 py-2 text-sm border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all font-medium"
                  >
                    👁️ প্রিভিউ
                  </button>
                  <button
                    onClick={() => handleThemeSelect(theme)}
                    disabled={isCurrentTheme || isApplying}
                    className={`flex-1 px-4 py-2 text-sm rounded-lg transition-all font-bold ${
                      isCurrentTheme
                        ? 'bg-green-100 text-green-800 cursor-not-allowed border-2 border-green-300'
                        : isApplying
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : theme.category === 'basic'
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isApplying ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        প্রয়োগ হচ্ছে...
                      </span>
                    ) : isCurrentTheme ? (
                      '✅ বর্তমান থিম'
                    ) : (
                      '🚀 ব্যবহার করুন'
                    )}
                  </button>
                </div>
              </div>
              
              {/* Current Theme Indicator */}
              {isCurrentTheme && (
                <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ✓ সক্রিয়
                </div>
              )}
            </div>
          );
        })}
      </div>

      {themes.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p>কোনো থিম পাওয়া যায়নি</p>
        </div>
      )}

      {/* Theme Preview Modal */}
      {previewTheme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{previewTheme.displayName} - প্রিভিউ</h3>
                <button
                  onClick={() => setPreviewTheme(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* Color Palette */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">রঙের প্যালেট:</h4>
                <div className="flex gap-2">
                  {Object.entries(previewTheme.colors).map(([key, color]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-xs text-gray-600 mt-1 block">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Theme Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>ক্যাটেগরি:</strong> {getCategoryBadge(previewTheme.category).text}
                </div>
                <div>
                  <strong>মূল্য:</strong> {formatPrice(previewTheme.price)}
                </div>
              </div>
              
              <p className="text-gray-600 mt-4">{previewTheme.description}</p>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setPreviewTheme(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={() => {
                    handleThemeSelect(previewTheme);
                    setPreviewTheme(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  এই থিম ব্যবহার করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}