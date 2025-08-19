"use client";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    setCart(savedCart ? JSON.parse(savedCart) : []);
  }, []);

  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-6">Place Order</h1>
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Selected Items</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500">No items in cart.</div>
        ) : (
          <ul className="mb-4">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-4 mb-2">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div>৳{item.price} x {item.quantity}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="font-bold text-xl mb-4">Total: ৳{getTotal()}</div>
        <form className="space-y-4">
          <input type="text" placeholder="Name" className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Phone" className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Address" className="w-full border rounded px-3 py-2" required />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">Confirm Order</button>
        </form>
      </div>
    </div>
  );
}
