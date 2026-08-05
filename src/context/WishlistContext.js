import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';

const WishlistContext = createContext(null);

const getStorageKey = (email) => {
  return email ? `zahrat_wishlist_${email}` : 'zahrat_beesan_wishlist';
};

function loadWishlist(email) {
  try {
    const stored = localStorage.getItem(getStorageKey(email));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { customer } = useCustomerAuth();
  const [wishlist, setWishlist] = useState(() => loadWishlist(null));
  
  // Reload wishlist when user changes (login/logout)
  useEffect(() => {
    const email = customer?.email || null;
    const loaded = loadWishlist(email);
    setWishlist(loaded);
  }, [customer]);

  useEffect(() => {
    try {
      const email = customer?.email || null;
      localStorage.setItem(getStorageKey(email), JSON.stringify(wishlist));
    } catch (err) {
      console.error('Error saving wishlist:', err);
    }
  }, [wishlist, customer]);

  const isWishlisted = (id) => wishlist.some(item => item.id === id);

  const addToWishlist = (item) => {
    if (!isWishlisted(item.id)) {
      setWishlist(prev => [item, ...prev]);
    }
  };

  const removeFromWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const toggleWishlist = (item) => {
    if (isWishlisted(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isWishlisted,
      isInWishlist: isWishlisted,
      clearWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
