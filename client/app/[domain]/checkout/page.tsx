"use client";
import { useEffect, useState } from "react";

export default function CheckoutPage({ params }: { params: { domain: string } }) {
  const domain = params.domain;
  const [cart, setCart] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    division: "",
    note: "",
    payment: "cod",
    promo: ""
  });

  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${domain}`);
    setCart(savedCart ? JSON.parse(savedCart) : []);
  }, [domain]);

  // Cart item increment
  const incrementItem = (id: string) => {
    setCart(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      localStorage.setItem(`cart_${domain}`, JSON.stringify(updated));
      return updated;
    });
  };
  // Cart item decrement
  const decrementItem = (id: string) => {
    setCart(prev => {
      const updated = prev.map(item => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item);
      localStorage.setItem(`cart_${domain}`, JSON.stringify(updated));
      return updated;
    });
  };
  // Remove item
  const removeItem = (id: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem(`cart_${domain}`, JSON.stringify(updated));
      return updated;
    });
  };
  // Add more items: redirect to home
  const goToHome = () => {
    window.location.href = `/${domain}`;
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = 70;
  const vat = 0;

  // Confirm order
  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.division || cart.length === 0) {
      alert('সব তথ্য দিন এবং cart-এ item যোগ করুন');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart,
          domain,
          total: getTotal() + deliveryCharge
        })
      });
      if (res.ok) {
        alert('অর্ডার সফলভাবে জমা হয়েছে!');
        setCart([]);
        localStorage.removeItem(`cart_${domain}`);
      } else {
        alert('অর্ডার জমা দিতে সমস্যা হয়েছে');
      }
    } catch {
      alert('সার্ভার সমস্যা হয়েছে');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-8">
        {/* Left: Order Form */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Place order</h1>
          <form className="space-y-4" onSubmit={handleOrder}>
            <div className="flex gap-2">
              <input type="text" placeholder="Name*" className="w-1/2 border rounded px-3 py-2" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              <input type="text" placeholder="Phone number*" className="w-1/2 border rounded px-3 py-2" required value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
            </div>
            <input type="email" placeholder="Email address (Optional)" className="w-full border rounded px-3 py-2" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            <input type="text" placeholder="House no, thana, street, direction etc*" className="w-full border rounded px-3 py-2" required value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />
            <select className="w-full border rounded px-3 py-2" value={form.division} onChange={e => setForm(f => ({...f, division: e.target.value}))} required>
              <option value="">Select division</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chattogram">Chattogram</option>
              <option value="Khulna">Khulna</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Barisal">Barisal</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Rangpur">Rangpur</option>
              <option value="Mymensingh">Mymensingh</option>
            </select>
            <textarea placeholder="Add your delivery instructions" className="w-full border rounded px-3 py-2" value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} />
            <div>
              <label className="font-semibold mb-2 block">Payment options</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="payment" value="cod" checked={form.payment === "cod"} onChange={e => setForm(f => ({...f, payment: e.target.value}))} />
                  Cash On Delivery
                </label>
                {/* Add more payment options if needed */}
              </div>
            </div>
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
              Bkash/Rocket/Nagad/Upay Personal (01964485930) For camera 500 Advance, Gadgets 200, Films Cash On. Write Last 3 Digits In Order Note.
            </div>
            <div className="flex gap-2 items-center">
              <input type="text" placeholder="Promo Code" className="border rounded px-3 py-2 flex-1" value={form.promo} onChange={e => setForm(f => ({...f, promo: e.target.value}))} />
              <button type="button" className="bg-gray-300 px-4 py-2 rounded">Apply</button>
            </div>
            <div className="mt-6">
              <div className="flex justify-between mb-2"><span>Sub Total</span><span>{getTotal()} BDT</span></div>
              <div className="flex justify-between mb-2"><span>VAT / TAX (0%)</span><span>{vat} BDT</span></div>
              <div className="flex justify-between mb-2"><span>Delivery charge</span><span>{deliveryCharge} BDT</span></div>
              <div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span>{getTotal() + deliveryCharge} BDT</span></div>
            </div>
            <button type="submit" className="w-full bg-green-700 text-white py-3 rounded font-bold mt-4">Total {getTotal() + deliveryCharge} BDT | Confirm order</button>
          </form>
        </div>
        {/* Right: Cart Summary */}
        <div className="w-full md:w-96 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Cart</h2>
          {cart.length === 0 ? (
            <div className="text-gray-500">No items in cart.</div>
          ) : (
            <ul className="mb-4">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center gap-4 mb-2">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-bold">{item.name}</div>
                    <div>{item.price} BDT x {item.quantity}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => decrementItem(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => incrementItem(item.id)}>+</button>
                    <button className="text-red-500 px-2 py-1" onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button className="w-full bg-blue-600 text-white py-2 rounded" onClick={goToHome}>+ Add more items</button>
        </div>
      </div>
    </div>
  );
}
