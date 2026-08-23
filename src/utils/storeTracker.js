// Real-Time Visitor & Cart Tracker for Zahrat Beesan Store
let sessionId = null;
let heartbeatInterval = null;

export const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  if (!sessionId) {
    sessionId = sessionStorage.getItem('zb_session_id');
    if (!sessionId) {
      sessionId = 'zb_s_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      sessionStorage.setItem('zb_session_id', sessionId);
    }
  }
  return sessionId;
};

export const getCustomerInfo = () => {
  if (typeof window === 'undefined') return {};
  try {
    const savedCustomer = localStorage.getItem('zahrat_customer');
    const savedShipping = localStorage.getItem('zb_customer_shipping_data');
    let info = {};
    if (savedCustomer) {
      const c = JSON.parse(savedCustomer);
      info.name = c.name || '';
      info.phone = c.phone || '';
      info.email = c.email || '';
    }
    if (savedShipping) {
      const s = JSON.parse(savedShipping);
      if (!info.name && (s.fullName || s.name)) info.name = s.fullName || s.name;
      if (!info.phone && s.phone) info.phone = s.phone;
      if (!info.email && s.email) info.email = s.email;
      if (s.city) info.city = s.city;
      if (s.country) info.country = s.country;
    }
    return info;
  } catch (_) {
    return {};
  }
};

export const trackStoreEvent = async (eventType, extraData = {}) => {
  if (typeof window === 'undefined') return;
  const sId = getSessionId();
  if (!sId) return;

  const customer = { ...getCustomerInfo(), ...(extraData.customer || {}) };
  const payload = {
    sessionId: sId,
    eventType: eventType || 'page_view',
    page: window.location.pathname + window.location.search,
    title: document.title || 'زهرة بيسان',
    stage: extraData.stage || 'browsing',
    cartItems: extraData.cartItems || null,
    cartTotal: extraData.cartTotal || 0,
    customer,
    referrer: document.referrer || '',
    device: window.innerWidth < 768 ? 'mobile' : (window.innerWidth < 1024 ? 'tablet' : 'desktop'),
    timestamp: Date.now()
  };

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon('/api/tracker/event', blob);
    } else {
      fetch('/api/tracker/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  } catch (_) {}
};

export const initStoreTracker = () => {
  if (typeof window === 'undefined') return;
  
  // Track initial page view
  trackStoreEvent('page_view', { stage: 'browsing' });

  // Heartbeat every 45 seconds to keep active session live
  if (!heartbeatInterval) {
    heartbeatInterval = setInterval(() => {
      trackStoreEvent('heartbeat');
    }, 45000);
  }

  // Track page unload / visibility
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackStoreEvent('tab_hidden');
    } else if (document.visibilityState === 'visible') {
      trackStoreEvent('tab_active');
    }
  });
};
