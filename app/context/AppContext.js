"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { models as defaultModels } from '../data/models';

const AppContext = createContext(undefined);

const defaultOrders = [
  {
    id: 'ZH-482012',
    customer: 'سارة المصري',
    phone: '0798765432',
    city: 'Amman',
    address: 'دابوق، شارع الملك الحسين، بناية 42',
    items: [
      { id: 8, name: 'عباية ملكية مطرزة', quantity: 1, price: 90 }
    ],
    total: 90,
    currency: 'JOD',
    status: 'مكتمل',
    date: '2026-06-02T14:32:00.000Z'
  },
  {
    id: 'ZH-952817',
    customer: 'نورة الحمد',
    phone: '0781234567',
    city: 'Irbid',
    address: 'شارع الجامعة، بجانب بنك الإسكان',
    items: [
      { id: 9, name: 'عباية صيفية راقية', quantity: 1, price: 75 },
      { id: 12, name: 'عباية كلاسيكية سوداء', quantity: 1, price: 65 }
    ],
    total: 140,
    currency: 'JOD',
    status: 'قيد التجهيز',
    date: '2026-06-03T09:15:00.000Z'
  }
];

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [currency, setCurrency] = useState('JOD');
  const [country, setCountry] = useState('JO');
  
  const [products, setProducts] = useState(defaultModels);
  const [orders, setOrders] = useState(defaultOrders);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    
    // Load Cart
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.error("Failed to parse cart from localStorage:", e);
      localStorage.removeItem('cart');
    }

    // Load Products
    try {
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        // Performance Fix: Filter out heavy video files (/8 (2).mp4 and /11.mp4) from cached products
        let modified = false;
        parsed.forEach((p) => {
          if (p.videos && p.videos.length > 0) {
            const originalLength = p.videos.length;
            p.videos = p.videos.filter((v) => v !== '/8 (2).mp4' && v !== '/11.mp4');
            if (p.videos.length !== originalLength) {
              modified = true;
            }
          }
        });
        if (modified) {
          localStorage.setItem('products', JSON.stringify(parsed));
        }
        setProducts(parsed);
      } else {
        setProducts(defaultModels);
        localStorage.setItem('products', JSON.stringify(defaultModels));
      }
    } catch (e) {
      console.error("Failed to parse products from localStorage:", e);
      setProducts(defaultModels);
      localStorage.setItem('products', JSON.stringify(defaultModels));
    }

    // Load Orders
    try {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders(defaultOrders);
        localStorage.setItem('orders', JSON.stringify(defaultOrders));
      }
    } catch (e) {
      console.error("Failed to parse orders from localStorage:", e);
      setOrders(defaultOrders);
      localStorage.setItem('orders', JSON.stringify(defaultOrders));
    }
  }, []);

  // Save Cart to Local Storage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isClient]);

  // Save Products to Local Storage
  useEffect(() => {
    if (isClient && products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, isClient]);

  // Save Orders to Local Storage
  useEffect(() => {
    if (isClient && orders.length > 0) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [orders, isClient]);

  // Cart Actions
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Products CRUD Actions
  const addProduct = (productData) => {
    setProducts((prev) => {
      const maxId = prev.length > 0 ? Math.max(...prev.map(p => p.id)) : 100;
      const newProduct = {
        ...productData,
        id: maxId + 1
      };
      const updated = [newProduct, ...prev];
      if (isClient) localStorage.setItem('products', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? updatedData : p));
      if (isClient) localStorage.setItem('products', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProduct = (id) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (isClient) localStorage.setItem('products', JSON.stringify(updated));
      return updated;
    });
  };

  // Orders Actions
  const addOrder = (orderData) => {
    const orderId = 'ZH-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      ...orderData,
      id: orderId,
      status: 'قيد التجهيز',
      date: new Date().toISOString()
    };
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      if (isClient) localStorage.setItem('orders', JSON.stringify(updated));
      return updated;
    });
    return orderId;
  };

  const updateOrderStatus = (id, status) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => (ord.id === id ? { ...ord, status } : ord));
      if (isClient) localStorage.setItem('orders', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        clearCart,
        currency,
        setCurrency,
        country,
        setCountry,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        addOrder,
        updateOrderStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
