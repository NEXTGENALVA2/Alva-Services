import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    common: {
      "dashboard": "Dashboard",
      "analytics": "Analytics",
      "products": "Products",
      "orders": "Orders",
      "settings": "Settings",
      "loading": "Loading...",
      "totalProducts": "Total Products",
      "totalOrders": "Total Orders",
      "totalRevenue": "Total Revenue",
      "monthlyProfit": "Monthly Profit",
      "thisMonth": "This month",
      "currency": "$",
      "yourWebsite": "Your Website",
      "name": "Name",
      "domain": "Domain",
      "viewWebsite": "Click to view your website",
      "welcomeTitle": "Welcome to EcomEasy!",
      "welcomeDesc": "Create your online store in seconds",
      "createWebsite": "Create Website"
    }
  },
  bn: {
    common: {
      "dashboard": "ড্যাশবোর্ড",
      "analytics": "অ্যানালিটিক্স",
      "products": "পণ্য",
      "orders": "অর্ডার",
      "settings": "সেটিংস",
      "loading": "লোড হচ্ছে...",
      "totalProducts": "মোট পণ্য",
      "totalOrders": "মোট অর্ডার",
      "totalRevenue": "মোট আয়",
      "monthlyProfit": "মাসিক লাভ",
      "thisMonth": "এই মাস",
      "currency": "৳",
      "yourWebsite": "আপনার ওয়েবসাইট",
      "name": "নাম",
      "domain": "ডোমেইন",
      "viewWebsite": "আপনার ওয়েবসাইট দেখতে ক্লিক করুন",
      "welcomeTitle": "EcomEasy তে স্বাগতম!",
      "welcomeDesc": "সেকেন্ডেই আপনার অনলাইন স্টোর তৈরি করুন",
      "createWebsite": "ওয়েবসাইট তৈরি করুন"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',
    lng: typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;