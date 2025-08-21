"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  mode: 'light' | 'dark';
  custom?: Record<string, any>;
};

const defaultThemes: ThemeType[] = [
  {
    name: 'Basic',
    colors: {
      primary: '#2563EB', // ZatiqEasy Basic blue color
      secondary: '#E5E7EB',
      background: '#FFFFFF',
      text: '#1F2937',
    },
    mode: 'light',
  },
  {
    name: 'Premium',
    colors: {
      primary: '#1F2937', // Dark color like ZatiqEasy Premium
      secondary: '#F3F4F6',
      background: '#F9FAFB',
      text: '#111827',
    },
    mode: 'light',
  },
  {
    name: 'Aurora',
    colors: {
      primary: '#EF4444', // Red color like ZatiqEasy Aurora
      secondary: '#FEE2E2',
      background: '#FFFFFF',
      text: '#1F2937',
    },
    mode: 'light',
  },
];

const ThemeContext = createContext<{
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: ThemeType[];
  updateTheme: (changes: Partial<ThemeType>) => void;
} | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themes, setThemes] = useState<ThemeType[]>(defaultThemes);
  const [theme, setTheme] = useState<ThemeType>(defaultThemes[0]);

  // Load theme from localStorage first, then from backend
  useEffect(() => {
    const loadTheme = async () => {
      // First, load from localStorage for immediate display
      const saved = localStorage.getItem('activeTheme');
      if (saved) {
        try {
          setTheme(JSON.parse(saved));
        } catch {}
      }
      
      // Then try to load from backend if we have website info
      try {
        const website = localStorage.getItem('website');
        const token = localStorage.getItem('token');
        
        if (website && token) {
          const websiteData = JSON.parse(website);
          const response = await fetch(`http://localhost:5000/api/websites/public/${websiteData.domain}`);
          
          if (response.ok) {
            const data = await response.json();
            const backendTheme = data.website?.theme;
            
            if (backendTheme) {
              // Find matching theme from defaultThemes
              const matchingTheme = defaultThemes.find(t => t.name === backendTheme);
              if (matchingTheme) {
                setTheme(matchingTheme);
                localStorage.setItem('activeTheme', JSON.stringify(matchingTheme));
              }
            }
          }
        }
      } catch (error) {
        console.log('Could not load theme from backend:', error);
      }
      
      const savedThemes = localStorage.getItem('allThemes');
      if (savedThemes) {
        try {
          setThemes(JSON.parse(savedThemes));
        } catch {}
      }
    };
    
    // Listen for theme updates from other components
    const handleThemeUpdate = (event: any) => {
      if (event.detail) {
        setTheme(event.detail);
        console.log('Theme updated via event:', event.detail.name);
      }
    };
    
    window.addEventListener('themeUpdated', handleThemeUpdate);
    loadTheme();
    
    return () => {
      window.removeEventListener('themeUpdated', handleThemeUpdate);
    };
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('activeTheme', JSON.stringify(theme));
    localStorage.setItem('allThemes', JSON.stringify(themes));
  }, [theme, themes]);

  // Update theme properties
  const updateTheme = (changes: Partial<ThemeType>) => {
    setTheme(prev => ({ ...prev, ...changes }));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
