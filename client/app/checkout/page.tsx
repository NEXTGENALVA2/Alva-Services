
"use client";
import React, { useState } from "react";
import { useCart } from "../../components/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();
  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Bangladesh division & district data
  const divisions: { [key: string]: string[] } = {
    "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
    "Chattogram": ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Comilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati"],
    "Barisal": ["Barisal", "Barguna", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur"],
    "Khulna": ["Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
    "Mymensingh": ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"],
    "Rajshahi": ["Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj"],
    "Rangpur": ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
    "Sylhet": ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"]
  };
  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [instructions, setInstructions] = useState("");
  let deliveryCharge = 0;
  if (selectedDistrict === "Dhaka") deliveryCharge = 70;
  else if (selectedDistrict) deliveryCharge = 120;
  const total = getTotal() + deliveryCharge;

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderData = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      customerAddress: address,
      customerDivision: selectedDivision,
      customerDistrict: selectedDistrict,
      deliveryCharge,
      vatTax: 0,
      instructions,
      items: cart,
      totalAmount: total,
      paymentMethod: "cash_on_delivery",
      websiteId: "default-website-id" // You may need to get this dynamically
    };
    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        alert("Order placed successfully!");
        // Optionally clear cart or redirect
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      alert("Error placing order.");
    }
  };

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
        <div className="font-bold text-xl mb-4">Total: ৳{total}</div>
        <form className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input type="text" placeholder="Name" className="w-full border rounded px-3 py-2" required value={name} onChange={e => setName(e.target.value)} />
            <input type="text" placeholder="Phone" className="w-full border rounded px-3 py-2" required value={phone} onChange={e => setPhone(e.target.value)} />
            <input type="text" placeholder="Email address (Optional)" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="text" placeholder="House no, thana, street, direction etc*" className="w-full border rounded px-3 py-2" required value={address} onChange={e => setAddress(e.target.value)} />
            {/* Division select */}
            <select
              value={selectedDivision}
              onChange={e => {
                setSelectedDivision(e.target.value);
                setSelectedDistrict("");
              }}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Select division</option>
              {Object.keys(divisions).map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
            {/* DISTRICT DROPDOWN STARTS HERE - always visible, disabled until division selected */}
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="w-full border rounded px-3 py-2 appearance-none"
                required
                disabled={selectedDivision === ""}
              >
                <option value="">Select district</option>
                {selectedDivision !== "" && divisions[selectedDivision] && divisions[selectedDivision].map((district: string) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              {/* Chevron icon for dropdown */}
              <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>
            {/* DISTRICT DROPDOWN ENDS HERE */}
            <textarea placeholder="Add your delivery instructions" className="w-full border rounded px-3 py-2" value={instructions} onChange={e => setInstructions(e.target.value)} />
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">Confirm Order</button>
          </form>
        </form>
        <div className="mt-4">Delivery charge: <b>{deliveryCharge} BDT</b></div>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded mt-4"
          onClick={() => {
            window.location.href = "/products";
          }}
        >+ Add more items</button>
      </div>
    </div>
  );
}
