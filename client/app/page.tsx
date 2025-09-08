import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <div className="text-xl font-bold text-gray-800">EcommerceSaaS</div>
        <nav className="space-x-4">
          <a href="/auth/login" className="text-gray-700 hover:text-blue-600">সাইন ইন</a>
          <a href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">রেজিস্ট্রেশন</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-16 px-4 bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">১০ সেকেন্ডে তৈরি করুন<br/>আপনার ই-কমার্স ওয়েবসাইট</h1>
        <p className="text-lg md:text-xl mb-6">সাইনআপ করলেই সম্পূর্ণ ই-কমার্স ফিচারসহ। যেমন: চ্যাটবট, পেমেন্ট গেটওয়ে, প্রিমিয়াম ট্রায়াল এবং আরও কিছু।</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
          <Link href="/auth/register">
            <Button className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold shadow hover:bg-yellow-500">১০ সেকেন্ডে ফ্রি ট্রায়াল শুরু করুন</Button>
          </Link>
          <a href="#pricing">
            <Button variant="outline" className="px-6 py-3">দেখুন প্ল্যান</Button>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">কেন আমাদের প্ল্যাটফর্ম?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-blue-600 text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-lg mb-2">১০ সেকেন্ডে ওয়েবসাইট</h3>
            <p className="text-gray-600">সাইনআপ করলেই shop/website তৈরি। কোনো কোডিং লাগবে না।</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-green-600 text-3xl mb-2">✅</div>
            <h3 className="font-bold text-lg mb-2">সম্পূর্ণ ফিচার</h3>
            <p className="text-gray-600">চ্যাটবট, অর্ডার, পেমেন্ট, ড্যাশবোর্ড, কাস্টম ডোমেইন, সবকিছু একসাথে।</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-purple-600 text-3xl mb-2">🔒</div>
            <h3 className="font-bold text-lg mb-2">সিকিউর পেমেন্ট</h3>
            <p className="text-gray-600">SSL secured, instant payment gateway integration।</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">প্রাইসিং প্ল্যান</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="bg-gray-50 rounded-lg shadow p-8 text-center w-64">
            <h3 className="text-xl font-bold mb-2">ট্রায়াল</h3>
            <div className="text-2xl font-bold text-green-600 mb-2">ফ্রি</div>
            <ul className="text-gray-700 mb-4 text-left list-disc list-inside">
              <li>১ shop</li>
              <li>১০টি পণ্য</li>
              <li>সাপোর্ট</li>
            </ul>
            <Link href="/auth/register">
              <Button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">ট্রায়াল শুরু করুন</Button>
            </Link>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-8 text-center w-64">
            <h3 className="text-xl font-bold mb-2">মাসিক</h3>
            <div className="text-2xl font-bold text-blue-600 mb-2">৳৫০০</div>
            <ul className="text-gray-700 mb-4 text-left list-disc list-inside">
              <li>৫ shop</li>
              <li>৫০টি পণ্য</li>
              <li>প্রিমিয়াম সাপোর্ট</li>
            </ul>
            <a href="/auth/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">সাবস্ক্রাইব করুন</a>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-8 text-center w-64 border-2 border-blue-600">
            <h3 className="text-xl font-bold mb-2">৬ মাস</h3>
            <div className="text-2xl font-bold text-purple-600 mb-2">৳২৪০০</div>
            <ul className="text-gray-700 mb-4 text-left list-disc list-inside">
              <li>১০ shop</li>
              <li>১০০টি পণ্য</li>
              <li>প্রিমিয়াম সাপোর্ট</li>
            </ul>
            <a href="/auth/register" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">সাবস্ক্রাইব করুন</a>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-8 text-center w-64">
            <h3 className="text-xl font-bold mb-2">বার্ষিক</h3>
            <div className="text-2xl font-bold text-yellow-600 mb-2">৳৬০০০</div>
            <ul className="text-gray-700 mb-4 text-left list-disc list-inside">
              <li>২০ shop</li>
              <li>২০০টি পণ্য</li>
              <li>প্রিমিয়াম সাপোর্ট</li>
            </ul>
            <a href="/auth/register" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">সাবস্ক্রাইব করুন</a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 px-4 bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">আজই শুরু করুন আপনার ই-কমার্স যাত্রা</h2>
        <Link href="/auth/register">
          <Button className="bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg shadow hover:bg-yellow-500 transition">এখনই শুরু করুন</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-lg mb-2 text-white">EcommerceSaaS</div>
            <p className="text-sm">১০ সেকেন্ডে নিজের ই-কমার্স সাইট তৈরি করুন।</p>
          </div>
          <div>
            <div className="font-bold mb-2 text-white">ফিচার</div>
            <ul className="text-sm space-y-1">
              <li>চ্যাটবট</li>
              <li>পেমেন্ট গেটওয়ে</li>
              <li>ড্যাশবোর্ড</li>
              <li>কাস্টম ডোমেইন</li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-2 text-white">সাপোর্ট</div>
            <ul className="text-sm space-y-1">
              <li>লাইভ চ্যাট</li>
              <li>ইমেইল সাপোর্ট</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-2 text-white">প্রোফাইল</div>
            <ul className="text-sm space-y-1">
              <li>অ্যাকাউন্ট</li>
              <li>সাবস্ক্রিপশন</li>
              <li>অর্ডার</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-8">© 2024 EcommerceSaaS. সকল অধিকার সংরক্ষিত।</div>
      </footer>
    </div>
  );
}
