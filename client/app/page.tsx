import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6">
        <div className="text-xl font-bold text-gray-800">EcommerceSaaS</div>
        <nav className="space-x-4">
          <a href="/auth/login" className="text-gray-700 hover:text-blue-600">সাইন ইন</a>
          <Button asChild variant="default">
            <a href="/auth/register">রেজিস্ট্রেশন</a>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-16 px-4 bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">১০ সেকেন্ডে তৈরি করুন<br/>আপনার ই-কমার্স ওয়েবসাইট</h1>
        <p className="text-lg md:text-xl mb-6">সাইনআপ করলেই সম্পূর্ণ ই-কমার্স ফিচারসহ। যেমন: চ্যাটবট, পেমেন্ট গেটওয়ে, প্রিমিয়াম ট্রায়াল এবং আরও কিছু।</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
          <Button asChild size="lg" className="bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500">
            <a href="/auth/register">১০ সেকেন্ডে ফ্রি ট্রায়াল শুরু করুন</a>
          </Button>
          <Button asChild variant="secondary" size="lg" className="bg-white text-blue-700 font-bold hover:bg-gray-100">
            <a href="#pricing">দেখুন প্ল্যান</a>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">কেন আমাদের প্ল্যাটফর্ম?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="text-blue-600 text-3xl mb-2">⚡</div>
              <CardTitle className="text-lg">১০ সেকেন্ডে ওয়েবসাইট</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>সাইনআপ করলেই shop/website তৈরি। কোনো কোডিং লাগবে না।</CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="text-green-600 text-3xl mb-2">✅</div>
              <CardTitle className="text-lg">সম্পূর্ণ ফিচার</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>চ্যাটবট, অর্ডার, পেমেন্ট, ড্যাশবোর্ড, কাস্টম ডোমেইন, সবকিছু একসাথে।</CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="text-purple-600 text-3xl mb-2">🔒</div>
              <CardTitle className="text-lg">সিকিউর পেমেন্ট</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>SSL secured, instant payment gateway integration।</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">প্রাইসিং প্ল্যান</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <Card className="w-64">
            <CardHeader className="text-center">
              <CardTitle>ট্রায়াল</CardTitle>
              <div className="text-2xl font-bold text-green-600">ফ্রি</div>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-700 mb-4 space-y-1">
                <li>• ১ shop</li>
                <li>• ১০টি পণ্য</li>
                <li>• সাপোর্ট</li>
              </ul>
              <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                <a href="/auth/register">ট্রায়াল শুরু করুন</a>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="w-64">
            <CardHeader className="text-center">
              <CardTitle>মাসিক</CardTitle>
              <div className="text-2xl font-bold text-blue-600">৳৫০০</div>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-700 mb-4 space-y-1">
                <li>• ৫ shop</li>
                <li>• ৫০টি পণ্য</li>
                <li>• প্রিমিয়াম সাপোর্ট</li>
              </ul>
              <Button asChild className="w-full">
                <a href="/auth/register">সাবস্ক্রাইব করুন</a>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="w-64 border-2 border-blue-600">
            <CardHeader className="text-center">
              <CardTitle>৬ মাস</CardTitle>
              <div className="text-2xl font-bold text-purple-600">৳২৪০০</div>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-700 mb-4 space-y-1">
                <li>• ১০ shop</li>
                <li>• ১০০টি পণ্য</li>
                <li>• প্রিমিয়াম সাপোর্ট</li>
              </ul>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <a href="/auth/register">সাবস্ক্রাইব করুন</a>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="w-64">
            <CardHeader className="text-center">
              <CardTitle>বার্ষিক</CardTitle>
              <div className="text-2xl font-bold text-yellow-600">৳৬০০০</div>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-700 mb-4 space-y-1">
                <li>• ২০ shop</li>
                <li>• ২০০টি পণ্য</li>
                <li>• প্রিমিয়াম সাপোর্ট</li>
              </ul>
              <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600">
                <a href="/auth/register">সাবস্ক্রাইব করুন</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 px-4 bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">আজই শুরু করুন আপনার ই-কমার্স যাত্রা</h2>
        <Button asChild size="lg" className="bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-500">
          <a href="/auth/register">এখনই শুরু করুন</a>
        </Button>
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
              <li>পেমেন্ট গেটওয়ে</li>
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
