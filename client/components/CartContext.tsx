"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (item: CartItem, domain?: string) => void;
  removeFromCart: (id: string, domain?: string) => void;
  clearCart: (domain?: string) => void;
  updateQuantity: (id: string, quantity: number, domain?: string) => void;
  refreshCart: (domain?: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentDomain, setCurrentDomain] = useState<string>('');

  // Get current domain from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const pathParts = path.split('/');
      if (pathParts.length >= 2 && pathParts[1]) {
        const domain = pathParts[1];
        console.log(`[CartContext] Detected domain: ${domain}`);
        setCurrentDomain(domain);
      }
    }
  }, []);

  // Listen for URL changes (for navigation)
  useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const pathParts = path.split('/');
        if (pathParts.length >= 2 && pathParts[1]) {
          const domain = pathParts[1];
          console.log(`[CartContext] Domain changed to: ${domain}`);
          setCurrentDomain(domain);
        }
      }
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);
    
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Load cart from localStorage based on domain
  useEffect(() => {
    if (typeof window !== "undefined" && currentDomain) {
      try {
        const cartKey = `cart_${currentDomain}`;
        const savedCart = localStorage.getItem(cartKey);
        console.log(`[CartContext] Loading cart for domain: ${currentDomain}, key: ${cartKey}, data: ${savedCart}`);
        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch {
        setCart([]);
      }
    }
  }, [currentDomain]);

  // Cart change hole localStorage e save
  useEffect(() => {
    if (typeof window !== "undefined" && currentDomain && cart.length >= 0) {
      const cartKey = `cart_${currentDomain}`;
      console.log(`[CartContext] Saving cart for domain: ${currentDomain}, key: ${cartKey}, data:`, cart);
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, currentDomain]);

  // Cart e item add
  const addToCart = (item: CartItem, domain?: string) => {
    console.log(`[CartContext] Adding to cart:`, item, `domain: ${domain || currentDomain}`);
    const targetDomain = domain || currentDomain;
    
    // If different domain, load that domain's cart first
    if (domain && domain !== currentDomain) {
      const cartKey = `cart_${domain}`;
      const domainCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      const found = domainCart.find((i: CartItem) => i.id === item.id);
      const updatedCart = found
        ? domainCart.map((i: CartItem) =>
            i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
          )
        : [...domainCart, { ...item, quantity: item.quantity || 1 }];
      
      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
      return;
    }

    // Jodi item age theke thake, quantity barabo
    const found = cart.find((i) => i.id === item.id);
    if (found) {
      setCart(
        cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: item.quantity || 1 }]);
    }
  };

  // Cart theke item remove
  const removeFromCart = (id: string, domain?: string) => {
    const targetDomain = domain || currentDomain;
    
    // If different domain, handle separately
    if (domain && domain !== currentDomain) {
      const cartKey = `cart_${domain}`;
      const domainCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const updatedCart = domainCart.filter((i: CartItem) => i.id !== id);
      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
      return;
    }

    setCart(cart.filter((i) => i.id !== id));
  };

  // Cart clear
  const clearCart = (domain?: string) => {
    const targetDomain = domain || currentDomain;
    
    // If different domain, handle separately
    if (domain && domain !== currentDomain) {
      const cartKey = `cart_${domain}`;
      localStorage.setItem(cartKey, JSON.stringify([]));
      return;
    }

    setCart([]);
  };

  // Quantity update
  const updateQuantity = (id: string, quantity: number, domain?: string) => {
    const targetDomain = domain || currentDomain;
    
    // If different domain, handle separately
    if (domain && domain !== currentDomain) {
      const cartKey = `cart_${domain}`;
      const domainCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const updatedCart = domainCart.map((i: CartItem) => 
        i.id === id ? { ...i, quantity } : i
      );
      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
      return;
    }

    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  };

  // Refresh cart from localStorage
  const refreshCart = (domain?: string) => {
    const targetDomain = domain || currentDomain;
    if (typeof window !== "undefined" && targetDomain) {
      try {
        const cartKey = `cart_${targetDomain}`;
        const savedCart = localStorage.getItem(cartKey);
        console.log(`[CartContext] Refreshing cart for domain: ${targetDomain}, data: ${savedCart}`);
        if (domain && domain !== currentDomain) {
          // For different domain, just update localStorage without affecting current state
          return;
        }
        setCart(savedCart ? JSON.parse(savedCart) : []);
      } catch {
        setCart([]);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, clearCart, updateQuantity, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};
