"use client";
import { useState, useEffect } from 'react';

const languages = [
	{ code: 'en', label: 'English', currency: '$' },
	{ code: 'bn', label: 'বাংলা', currency: '৳' },
	{ code: 'hi', label: 'हिन्दी', currency: '₹' },
	{ code: 'ar', label: 'العربية', currency: 'ر.س' },
	{ code: 'fr', label: 'Français', currency: '€' },
];

// Simple translation function
const translations: Record<string, Record<string, string>> = {
	en: {
		dashboard: "Dashboard",
		analytics: "Analytics", 
		products: "Products",
		orders: "Orders",
		settings: "Settings",
		loading: "Loading...",
		totalProducts: "Total Products",
		totalOrders: "Total Orders", 
		totalRevenue: "Total Revenue",
		monthlyProfit: "Monthly Profit",
		thisMonth: "This month",
		currency: "$",
		yourWebsite: "Your Website",
		name: "Name",
		domain: "Domain",
		viewWebsite: "Click to view your website",
		welcomeTitle: "Welcome to EcomEasy!",
		welcomeDesc: "Create your online store in seconds",
		createWebsite: "Create Website"
	},
	bn: {
		dashboard: "ড্যাশবোর্ড",
		analytics: "অ্যানালিটিক্স",
		products: "পণ্য", 
		orders: "অর্ডার",
		settings: "সেটিংস",
		loading: "লোড হচ্ছে...",
		totalProducts: "মোট পণ্য",
		totalOrders: "মোট অর্ডার",
		totalRevenue: "মোট আয়",
		monthlyProfit: "মাসিক লাভ",
		thisMonth: "এই মাস",
		currency: "৳",
		yourWebsite: "আপনার ওয়েবসাইট",
		name: "নাম", 
		domain: "ডোমেইন",
		viewWebsite: "আপনার ওয়েবসাইট দেখতে ক্লিক করুন",
		welcomeTitle: "EcomEasy তে স্বাগতম!",
		welcomeDesc: "সেকেন্ডেই আপনার অনলাইন স্টোর তৈরি করুন",
		createWebsite: "ওয়েবসাইট তৈরি করুন"
	}
};

export default function LanguageCurrencySwitcher() {
	const [selected, setSelected] = useState('en');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const savedLang = localStorage.getItem('lang') || 'en';
		setSelected(savedLang);
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const lang = e.target.value;
		setSelected(lang);
		
		if (typeof window !== 'undefined') {
			localStorage.setItem('lang', lang);
			// Trigger a custom event to notify other components of language change
			window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
			// Force page reload to ensure language change takes effect everywhere
			window.location.reload();
		}
	};

	// Make translations available globally
	if (typeof window !== 'undefined') {
		(window as any).translations = translations;
		(window as any).currentLanguage = selected;
	}

	return (
		<div className="flex items-center space-x-2">
			<select
				value={selected}
				onChange={handleChange}
				className="border rounded px-2 py-1 text-sm"
			>
				{languages.map(l => (
					<option key={l.code} value={l.code}>{l.label}</option>
				))}
			</select>
			<span className="text-lg font-bold">
				{mounted ? languages.find(l => l.code === selected)?.currency : ""}
			</span>
		</div>
	);
}
