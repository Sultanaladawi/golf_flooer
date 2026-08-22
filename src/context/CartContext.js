import { createContext, useContext, useReducer, useEffect } from 'react';
import { trackAddToCart } from '../utils/socialPixel';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const addQty = action.item.qty || 1;
      const safeImg = extractItemImage(action.item);
      const formattedItem = {
        ...action.item,
        image: safeImg,
        image_url: safeImg,
        qty: addQty
      };
      const existing = state.items.find(i => i.id === formattedItem.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === formattedItem.id ? { ...i, qty: i.qty + addQty } : i
          ),
        };
      }
      return { ...state, items: [...state.items, formattedItem] };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };

    case 'SET_QTY': {
      if (action.qty < 1) {
        return { ...state, items: state.items.filter(i => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id ? { ...i, qty: action.qty } : i
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'FIX_ADDON_PRICES':
      return {
        ...state,
        _v: CART_VERSION,
        items: state.items.map(item => {
          const price = parseFloat(item.priceNum);
          const isAddon = String(item.id).startsWith('addon-');
          const fixedPrice = isAddon && (!price || price <= 0) ? 0.50 : (price || 0);
          return { ...item, priceNum: fixedPrice };
        })
      };

    case 'SYNC_LIVE_PRODUCTS': {
      if (!Array.isArray(action.products) || action.products.length === 0) return state;
      const productMap = new Map();
      action.products.forEach(p => {
        if (p.id) productMap.set(String(p.id), p);
        if (p.name) productMap.set(String(p.name).trim(), p);
      });

      let changed = false;
      const updatedItems = state.items.map(item => {
        const prodId = String(item.productId || item.id || '');
        const cleanName = String(item.name || '').split(' (')[0].trim();
        const matched = productMap.get(prodId) || productMap.get(cleanName);
        if (matched) {
          const livePrice = parseFloat(matched.price_num || matched.price);
          if (!isNaN(livePrice) && livePrice > 0 && Math.abs(livePrice - parseFloat(item.priceNum)) > 0.001) {
            changed = true;
            return {
              ...item,
              priceNum: livePrice,
              price: livePrice
            };
          }
        }
        return item;
      });

      if (changed) {
        return {
          ...state,
          items: updatedItems
        };
      }
      return state;
    }

    default:
      return state;
    }
}

export const FALLBACK_IMAGE_DATA_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='100%25' height='100%25' fill='%23faf7f2'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='22' font-weight='bold' fill='%23c5a880'%3Eزهرة بيسان%3C/text%3E%3Ctext x='50%25' y='58%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%238c7355'%3EHAUTE COUTURE%3C/text%3E%3C/svg%3E";

export const KNOWN_PRODUCT_IMAGES = {
  1: '/images/1786519839820-435844472_1782492481694060.jpg',
  2: '/images/1786519868822-566777010_1782578073971672.jpg',
  3: '/images/1786519923811-220582796_1782498825982749.jpg',
  4: '/images/1786520138944-678591191_1782578415985393.jpg',
  5: '/images/1786519963536-904099534_1782471925397618.jpg',
  6: '/images/1786520124449-599738462_1782322285332873.jpg',
  7: '/images/1786520099931-964389640_1786371335661564.jpg',
  8: '/images/1786520013728-54_20260308_113803_0011.png',
  16: '/images/1786520070249-773310884_1786299536249054.jpg',
  'تاج بيسان': '/images/1786519839820-435844472_1782492481694060.jpg',
  'اللؤلؤة': '/images/1786519868822-566777010_1782578073971672.jpg',
  'السلطانة': '/images/1786519923811-220582796_1782498825982749.jpg',
  'الأميرة': '/images/1786520138944-678591191_1782578415985393.jpg',
  'الياقوتة': '/images/1786519963536-904099534_1782471925397618.jpg',
  'اليشمك': '/images/1786520124449-599738462_1782322285332873.jpg',
  'ثوب بيسان': '/images/1786520099931-964389640_1786371335661564.jpg',
  'الأناقة السوداء': '/images/1786520013728-54_20260308_113803_0011.png',
  'الأندلس': '/images/1786520070249-773310884_1786299536249054.jpg'
};

export const getSafeImageUrl = (img) => {
  if (!img || typeof img !== 'string') return FALLBACK_IMAGE_DATA_URI;
  let trimmed = img.trim();
  if (!trimmed || trimmed === '12.png' || trimmed === '/12.png' || trimmed === '/images/12.png' || trimmed.includes('favicon-512.png')) {
    return FALLBACK_IMAGE_DATA_URI;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    trimmed = trimmed.substring(1);
  }
  if (trimmed.startsWith('images/') || trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }
  return `/images/${trimmed}`;
};

export const extractItemImage = (item) => {
  if (!item) return FALLBACK_IMAGE_DATA_URI;

  const idMatch = KNOWN_PRODUCT_IMAGES[item.id] || KNOWN_PRODUCT_IMAGES[item.productId];
  const nameStr = String(item.name || '');
  let nameMatch = null;
  for (const [key, path] of Object.entries(KNOWN_PRODUCT_IMAGES)) {
    if (isNaN(key) && nameStr.includes(key)) {
      nameMatch = path;
      break;
    }
  }

  let raw = item.image || item.image_url || item.images || item.img || '';
  if (Array.isArray(raw)) raw = raw[0];
  if (typeof raw === 'string' && raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) raw = parsed[0];
    } catch (_) {}
  }

  if (!raw || typeof raw !== 'string' || raw.includes('data:image/svg') || raw.includes('favicon-512') || raw === '12.png' || raw === '/12.png') {
    if (idMatch) return idMatch;
    if (nameMatch) return nameMatch;
  }

  return getSafeImageUrl(raw);
};

const STORAGE_KEY = 'Zahrat Beesan_Online_cart';

const CART_VERSION = 6; // Bump to auto-resolve true images for all items in existing carts

function sanitizeCart(cart) {
  if (!cart || !Array.isArray(cart.items)) return { items: [], _v: CART_VERSION };
  return {
    ...cart,
    _v: CART_VERSION,
    items: cart.items.map(item => {
      const price = parseFloat(item.priceNum);
      const isAddon = String(item.id).startsWith('addon-');
      const fixedPrice = isAddon && (!price || price <= 0) ? 0.50 : (price || 0);
      const resolvedImage = extractItemImage(item);
      return { 
        ...item, 
        priceNum: fixedPrice,
        image: resolvedImage,
        image_url: resolvedImage
      };
    })
  };
}

function loadCart() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { items: [], _v: CART_VERSION };
    const parsed = JSON.parse(stored);
    if (!parsed._v || parsed._v < CART_VERSION) {
      const fixed = sanitizeCart(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed));
      return fixed;
    }
    return parsed;
  } catch {
    return { items: [], _v: CART_VERSION };
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, null, loadCart);

  // One-time fix on mount: correct any zero-price addon items in current state
  useEffect(() => {
    dispatch({ type: 'FIX_ADDON_PRICES' });
  }, []);

  // Live Price & Catalog Synchronization: Fetch latest product prices from server and update cart items dynamically
  useEffect(() => {
    let isMounted = true;
    const syncCartWithLiveProducts = () => {
      fetch(`/api/products?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && Array.isArray(data)) {
            dispatch({ type: 'SYNC_LIVE_PRODUCTS', products: data });
          }
        })
        .catch(err => console.warn('Could not sync cart prices with live catalog:', err.message));
    };

    syncCartWithLiveProducts();
    window.addEventListener('focus', syncCartWithLiveProducts);
    return () => { 
      isMounted = false; 
      window.removeEventListener('focus', syncCartWithLiveProducts);
    };
  }, []);

  useEffect(() => {
    if (state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error("Error saving cart:", err);
      }
    }
  }, [state]);

  // 🛒 Automated Abandoned Cart Sync
  useEffect(() => {
    if (state && Array.isArray(state.items) && state.items.length > 0) {
      try {
        let userEmail = null;
        let userPhone = null;

        const savedCustomer = localStorage.getItem('zahrat_customer');
        if (savedCustomer) {
          const u = JSON.parse(savedCustomer);
          if (u.email) userEmail = u.email;
          if (u.phone) userPhone = u.phone;
        }

        const savedShipping = localStorage.getItem('zb_customer_shipping_data');
        if (savedShipping) {
          const s = JSON.parse(savedShipping);
          if (!userEmail && s.email) userEmail = s.email;
          if (!userPhone && s.phone) userPhone = s.phone;
        }

        if (userEmail || userPhone) {
          const endpoint = (typeof window !== 'undefined' && window.location.port === '3000')
            ? `http://${window.location.hostname}:5000/api/cart/abandoned`
            : '/api/cart/abandoned';

          fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              phone: userPhone,
              cartItems: state.items.map(i => ({
                id: i.id,
                name: i.name,
                price: i.priceNum,
                quantity: i.qty
              })),
              total: subTotal
            })
          }).catch(() => {});
        }
      } catch (_) {}
    }
  }, [state.items, subTotal]);

  const totalItems = state.items.length;
  const totalQty = state.items.reduce((s, i) => s + i.qty, 0);
  
  const subTotal = state.items.reduce((s, i) => {
    const price = parseFloat(i.priceNum) || 0;
    return s + (price * i.qty);
  }, 0);

  // No automatic bundle discount
  const isBundleApplied = false;
  const bundleDiscount = 0;
  const totalPrice = subTotal;

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', item });
    try {
      trackAddToCart({
        id: item.id,
        name: item.name || item.title || 'Product',
        price: item.priceNum || item.price || 0
      });
    } catch (_) {}
  };
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const setQty = (id, qty) => dispatch({ type: 'SET_QTY', id, qty });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ 
      items: state.items, 
      totalItems, 
      totalQty,
      subTotal,
      bundleDiscount,
      isBundleApplied,
      totalPrice, 
      addItem, 
      removeItem, 
      setQty, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
