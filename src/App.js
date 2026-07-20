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
import WallOfLove         from './components/WallOfLove';
import Contact            from './components/Contact';
import Footer             from './components/Footer';
import Chatbot            from './components/Chatbot';
import FloatingWidgets   from './components/FloatingWidgets';
import Cart               from './components/Cart';
import Checkout           from './components/Checkout';
import Wishlist           from './components/Wishlist';
import OrderTracking      from './components/OrderTracking';

import LoadingScreen      from './components/LoadingScreen';

import { WishlistProvider } from './context/WishlistContext';
import { DarkModeProvider } from './context/DarkModeContext';

import { AdminProvider }  from './admin/AdminContext';
import { AdminLangProvider } from './admin/AdminLangContext';
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
import Feedback           from './admin/pages/Feedback';
import Messages           from './admin/pages/Messages';
import LeaderDashboard    from './admin/pages/LeaderDashboard';
import Settings           from './admin/pages/Settings';
import ThemeSettings      from './admin/pages/ThemeSettings';
import axios from 'axios';
import SocialMedia        from './admin/pages/SocialMedia';
import Loyalty            from './admin/pages/Loyalty';
import PreOrderInterests  from './admin/pages/PreOrderInterests';
import Delivery           from './admin/pages/Delivery';
import { RamadanLanding, EidLanding, SummerLanding } from './components/LandingPages';

let LenisClass = null;
try { LenisClass = require('@studio-freight/lenis').default; } catch (_) {}


function ThemeLoader() {
  useEffect(() => {
    axios.get('/api/settings/theme').then(res => {
      const data = res.data;
      if (data) {
        if (data.theme_primary) {
          document.documentElement.style.setProperty('--primary-color', data.theme_primary);
          document.documentElement.style.setProperty('--admin-accent', data.theme_primary);
        }
        if (data.theme_bg) {
          document.documentElement.style.setProperty('--bg-dark', data.theme_bg);
          document.documentElement.style.setProperty('--admin-bg', data.theme_bg);
        }
        if (data.theme_text) {
          document.documentElement.style.setProperty('--text-primary', data.theme_text);
          document.documentElement.style.setProperty('--admin-text', data.theme_text);
        }
        // Hover color could be injected globally or stored in window
        if (data.theme_hover) {
          document.documentElement.style.setProperty('--primary-hover', data.theme_hover);
        }
      }
    }).catch(err => console.error("Theme load error:", err));
  }, []);
  return null;
}

function PublicSite() {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeOrderId, setStripeOrderId] = useState(null);
  const { isStoreOpen } = useStore();

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const myFatoorahStatusParam = params.get('myfatoorah_status');
    const paymentId = params.get('paymentId');

    if (myFatoorahStatusParam === 'success' && paymentId) {
      setCheckoutOpen(true);
      setStripeStatus('verifying'); // keeping state name same to avoid refactoring
      
      fetch(`/api/myfatoorah/verify?paymentId=${paymentId}`)
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
          console.error('[MyFatoorah verification error]', err);
          setStripeStatus('error');
        });
    } else if (myFatoorahStatusParam === 'error') {
      setCheckoutOpen(true);
      setStripeStatus('error');
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
      
      {/* Animated luxury background glows */}
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />
      
      <Navbar 
        onCartOpen={() => { setCartOpen(true); setCheckoutOpen(false); }}
        onWishlistOpen={() => setWishlistOpen(true)}
        onTrackOrderOpen={() => setTrackingOpen(true)}
      />
      
      <main>
        <Hero />
        <Menu />
        <Gallery />
        <About />
        <WallOfLove />
        <Contact />
      </main>

      <Footer />
      <Chatbot />
      <FloatingWidgets />

      <Wishlist isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <OrderTracking isOpen={trackingOpen} onClose={() => setTrackingOpen(false)} />

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

import Account from './components/Account';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import LoginModal from './components/LoginModal';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "521878294229-usg7sqkjrl9gklke66ln7bt8e5d4foie.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
    <ThemeLoader />
      <StoreProvider>
        <CurrencyProvider>
          <CustomerAuthProvider>
          <AdminProvider>
            <CartProvider>
              <DarkModeProvider>
              <WishlistProvider>
              <LoginModal />
              <Routes>
              <Route path="/" element={<PublicSite />} />
              <Route path="/account" element={<Account />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/ramadan" element={<RamadanLanding />} />
              <Route path="/eid" element={<EidLanding />} />
              <Route path="/summer" element={<SummerLanding />} />
              <Route path="/admin/*" element={
                <AdminProvider>
                  <AdminLangProvider>
                    <Routes>
                      <Route path="login" element={<AdminLogin />} />
                      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="products" element={<Products />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="delivery" element={<Delivery />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="offers" element={<Offers />} />
                        <Route path="coupons" element={<Coupons />} />
                        <Route path="loyalty" element={<Loyalty />} />
                        <Route path="pre-orders" element={<PreOrderInterests />} />
                        <Route path="newsletter" element={<Newsletter />} />
                        <Route path="ai-assistant" element={<AIAssistant />} />
                        <Route path="feedback" element={<Feedback />} />
                        <Route path="messages" element={<Messages />} />
                        <Route path="leader" element={<LeaderDashboard />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="theme" element={<ThemeSettings />} />
                        <Route path="social" element={<SocialMedia />} />
                        <Route index element={<Navigate to="dashboard" replace />} />
                      </Route>
                    </Routes>
                  </AdminLangProvider>
                </AdminProvider>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
              </WishlistProvider>
              </DarkModeProvider>
            </CartProvider>
          </AdminProvider>
          </CustomerAuthProvider>
        </CurrencyProvider>
      </StoreProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}