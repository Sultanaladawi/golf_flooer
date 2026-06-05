import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './styles/global.css';

import { CartProvider }   from './context/CartContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar             from './components/Navbar';
import Hero               from './components/Hero';
import Menu               from './components/Menu';
import Gallery            from './components/Gallery';
import About              from './components/About';

import Contact            from './components/Contact';
import Footer             from './components/Footer';
import Chatbot            from './components/Chatbot';
import Cart               from './components/Cart';
import Checkout           from './components/Checkout';

import LoadingScreen      from './components/LoadingScreen';

import { AdminProvider }  from './admin/AdminContext';
import AdminRoute         from './admin/AdminRoute';
import AdminLogin         from './admin/AdminLogin';
import AdminLayout        from './admin/AdminLayout';
import Dashboard          from './admin/pages/Dashboard';
import Orders             from './admin/pages/Orders';
import Products           from './admin/pages/Products';
import Analytics          from './admin/pages/Analytics';
import Inventory          from './admin/pages/Inventory';
import Offers             from './admin/pages/Offers';
import Coupons            from './admin/pages/Coupons';
import Newsletter         from './admin/pages/Newsletter';
import AIAssistant        from './admin/pages/AIAssistant';
import Applications       from './admin/pages/Applications';
import Jobs               from './admin/pages/Jobs';
import Feedback           from './admin/pages/Feedback';
import Messages           from './admin/pages/Messages';
import LeaderDashboard    from './admin/pages/LeaderDashboard';

let LenisClass = null;
try { LenisClass = require('@studio-freight/lenis').default; } catch (_) {}

function PublicSite() {
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeOrderId, setStripeOrderId] = useState(null);
  const { isStoreOpen } = useStore();

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeStatusParam = params.get('stripe_status');
    const sessionId = params.get('session_id');

    if (stripeStatusParam === 'success' && sessionId) {
      setCheckoutOpen(true);
      setStripeStatus('verifying');
      
      fetch(`/api/verify-checkout-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.orderId) {
            setStripeOrderId(data.orderId);
            setStripeStatus('success');
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setStripeStatus('error');
          }
        })
        .catch(err => {
          console.error('[Stripe verification error]', err);
          setStripeStatus('error');
        });
    } else if (stripeStatusParam === 'cancel') {
      setCheckoutOpen(true);
      setStripeStatus('cancelled');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Disable smooth scroll on touch/mobile — causes jank and slowness
    if (!LenisClass) return;
    if (window.matchMedia('(hover: none)').matches) return; // touch device
    const lenis = new LenisClass({ 
      duration: 1.25, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true, 
      wheelMultiplier: 0.9 
    });
    
    function raf(time) { 
      lenis.raf(time); 
      requestAnimationFrame(raf); 
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="public-site-wrapper" style={{ minHeight: '100vh' }}>
      <LoadingScreen onComplete={() => setLoaded(true)} />
      
      <div id="scroll-progress" />
      <div id="cursor-dot" ref={dotRef} />
      <div id="cursor-ring" ref={ringRef} />
      
      <Navbar onCartOpen={() => { setCartOpen(true); setCheckoutOpen(false); }} />
      
      <main>
        <Hero />
        <Menu />
        <Gallery />
        <About />
        <Contact />
      </main>

      <Footer />
      <Chatbot />

      {cartOpen && (
        <Cart 
          onClose={() => setCartOpen(false)} 
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} 
        />
      )}
      {checkoutOpen && (
        <Checkout 
          onClose={() => { 
            setCartOpen(false); 
            setCheckoutOpen(false); 
            setStripeStatus(null); 
            setStripeOrderId(null); 
          }} 
          onBack={() => { setCheckoutOpen(false); setCartOpen(true); }} 
          initialStep={
            stripeStatus === 'verifying' ? 'processing' : 
            stripeStatus === 'success' ? 'success' : 
            stripeStatus === 'error' ? 'error' : 'form'
          }
          initialOrderId={stripeOrderId}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <CurrencyProvider>
          <AdminProvider>
            <CartProvider>
              <Routes>
              <Route path="/" element={<PublicSite />} />
              <Route path="/checkout" element={<Checkout />} />


              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"    element={<Dashboard />} />
                <Route path="orders"       element={<Orders />} />
                <Route path="products"     element={<Products />} />
                <Route path="analytics"    element={<Analytics />} />
                <Route path="inventory"    element={<Inventory />} />
                <Route path="offers"       element={<Offers />} />
                <Route path="coupons"      element={<Coupons />} />
                <Route path="newsletter"   element={<Newsletter />} />
                <Route path="applications" element={<Applications />} />
                <Route path="jobs"         element={<Jobs />} />
                <Route path="messages"     element={<Messages />} />
                <Route path="feedback"     element={<Feedback />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="leader"       element={<LeaderDashboard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </AdminProvider>
        </CurrencyProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
