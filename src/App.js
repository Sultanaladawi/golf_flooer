import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './styles/global.css';

import { CartProvider }   from './context/CartContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar             from './components/Navbar';
import Hero               from './components/Hero';
import Menu               from './components/Menu';
import CategorySlider     from './components/CategorySlider';

import Gallery            from './components/Gallery';
import About              from './components/About';
// import WallOfLove         from './components/WallOfLove';
import Contact            from './components/Contact';
import Footer             from './components/Footer';
import Chatbot            from './components/Chatbot';
import FloatingWidgets   from './components/FloatingWidgets';
import Cart               from './components/Cart';
import Checkout           from './components/Checkout';
import Wishlist           from './components/Wishlist';
import OrderTracking      from './components/OrderTracking';
import LoadingScreen      from './components/LoadingScreen';
import PolicyModal        from './components/PolicyModal';
import MobileBottomBar    from './components/MobileBottomBar';
import LoyaltyCard        from './components/LoyaltyCard';




import { lazy, Suspense } from 'react';

// Core Public Components (eagerly loaded for instant home page rendering)
import { WishlistProvider } from './context/WishlistContext';
import { DarkModeProvider } from './context/DarkModeContext';

import { AdminProvider }  from './admin/AdminContext';
import { AdminLangProvider } from './admin/AdminLangContext';
import AdminRoute         from './admin/AdminRoute';
import axios from 'axios';
import { RamadanLanding, EidLanding, SummerLanding } from './components/LandingPages';

// Lazy-loaded secondary & admin routes for maximum performance
const Account          = lazy(() => import('./components/Account'));
const ProductPage      = lazy(() => import('./components/ProductPage'));
const Blog             = lazy(() => import('./components/Blog'));
const BlogPost         = lazy(() => import('./components/BlogPost'));
const GiftCards        = lazy(() => import('./components/GiftCards'));
const TechAgency       = lazy(() => import('./components/TechAgency'));

const AdminLogin       = lazy(() => import('./admin/AdminLogin'));
const AdminLayout      = lazy(() => import('./admin/AdminLayout'));
const Dashboard        = lazy(() => import('./admin/pages/Dashboard'));
const TechLeads        = lazy(() => import('./admin/pages/TechLeads'));
const Orders           = lazy(() => import('./admin/pages/Orders'));
const Products         = lazy(() => import('./admin/pages/Products'));
const Analytics        = lazy(() => import('./admin/pages/Analytics'));
const Inventory        = lazy(() => import('./admin/pages/Inventory'));
const Offers           = lazy(() => import('./admin/pages/Offers'));
const Coupons          = lazy(() => import('./admin/pages/Coupons'));
const Newsletter       = lazy(() => import('./admin/pages/Newsletter'));
const AIAssistant      = lazy(() => import('./admin/pages/AIAssistant'));
const Feedback         = lazy(() => import('./admin/pages/Feedback'));
const Messages         = lazy(() => import('./admin/pages/Messages'));
const LeaderDashboard  = lazy(() => import('./admin/pages/LeaderDashboard'));
const Settings         = lazy(() => import('./admin/pages/Settings'));
const ThemeSettings    = lazy(() => import('./admin/pages/ThemeSettings'));
const SocialMedia      = lazy(() => import('./admin/pages/SocialMedia'));
const Loyalty          = lazy(() => import('./admin/pages/Loyalty'));
const PreOrderInterests = lazy(() => import('./admin/pages/PreOrderInterests'));
const Delivery         = lazy(() => import('./admin/pages/Delivery'));
const VIPCustomers     = lazy(() => import('./admin/pages/VIPCustomers'));
const StaffManagement  = lazy(() => import('./admin/pages/StaffManagement'));
const BlogManagement   = lazy(() => import('./admin/pages/BlogManagement'));
const AbandonedCarts   = lazy(() => import('./admin/pages/AbandonedCarts'));
const AdminGiftCards   = lazy(() => import('./admin/pages/AdminGiftCards'));

let LenisClass = null;
try { LenisClass = require('@studio-freight/lenis').default; } catch (_) {}


import { initSocialPixels } from './utils/socialPixel';

function ThemeLoader() {
  useEffect(() => {
    initSocialPixels();
    
    // Dynamically set favicon to force browser tab update
    try {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = '/logo.png?v=zahrat_2026';
      document.getElementsByTagName('head')[0].appendChild(link);
    } catch (_) {}

    axios.get('/api/settings/theme').then(res => {
      const data = res.data;
      if (data) {
        if (data.theme_primary) {
          document.documentElement.style.setProperty('--primary-color', data.theme_primary);
        }
        if (data.theme_bg) {
          document.documentElement.style.setProperty('--bg-dark', data.theme_bg);
        }
        if (data.theme_text) {
          document.documentElement.style.setProperty('--text-primary', data.theme_text);
        }
        if (data.theme_hover) {
          document.documentElement.style.setProperty('--primary-hover', data.theme_hover);
        }
      }
    }).catch(err => console.error("Theme load error:", err));
  }, []);
  return null;
}

function PublicSite({ defaultPolicy }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [policyType, setPolicyType] = useState(defaultPolicy || null);


  useEffect(() => {
    if (defaultPolicy) setPolicyType(defaultPolicy);
  }, [defaultPolicy]);

  const { isStoreOpen } = useStore();

  const dotRef = useRef(null);
  const ringRef = useRef(null);

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
        onOpenPolicy={(type) => setPolicyType(type)}
      />
      
      <main>
        <Hero />
        <CategorySlider />
        <Gallery />
        <About />
        {/* <WallOfLove /> */}
        <Contact />
      </main>

      <Footer onOpenPolicy={(type) => setPolicyType(type)} />
      <Chatbot />
      <FloatingWidgets onOpenLoyalty={() => setLoyaltyOpen(true)} />

      <MobileBottomBar 
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenTracking={() => setTrackingOpen(true)}
      />

      <Wishlist isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />

      <OrderTracking isOpen={trackingOpen} onClose={() => setTrackingOpen(false)} />
      <PolicyModal type={policyType} isOpen={!!policyType} onClose={() => setPolicyType(null)} />
      <LoyaltyCard isOpen={loyaltyOpen} onClose={() => setLoyaltyOpen(false)} />


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
          }} 
          onBack={() => { setCheckoutOpen(false); setCartOpen(true); }} 
        />
      )}
    </div>
  );
}


import { CustomerAuthProvider } from './context/CustomerAuthContext';
import LoginModal from './components/LoginModal';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "521878294229-usg7sqkjrl9gklke66ln7bt8e5d4foie.apps.googleusercontent.com";

export default function App() {
  return (
    <LanguageProvider>
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
                        <Suspense fallback={<LoadingScreen />}>
                          <Routes>
                            <Route path="/" element={<PublicSite />} />
                            <Route path="/privacy" element={<PublicSite defaultPolicy="privacy" />} />
                            <Route path="/about" element={<PublicSite defaultPolicy="about" />} />
                            <Route path="/returns" element={<PublicSite defaultPolicy="returns" />} />

                            <Route path="/product/:id" element={<ProductPage />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/ramadan" element={<RamadanLanding />} />
                            <Route path="/eid" element={<EidLanding />} />
                            <Route path="/summer" element={<SummerLanding />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:slug" element={<BlogPost />} />
                            <Route path="/gift-cards" element={<GiftCards />} />
                            <Route path="/tech" element={<TechAgency />} />
                            <Route path="/agency" element={<TechAgency />} />
                            <Route path="/software" element={<TechAgency />} />
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
                                      <Route path="vip" element={<VIPCustomers />} />
                                      <Route path="staff" element={<StaffManagement />} />
                                      <Route path="blog" element={<BlogManagement />} />
                                      <Route path="abandoned-carts" element={<AbandonedCarts />} />
                                      <Route path="gift-cards" element={<AdminGiftCards />} />
                                      <Route path="tech-leads" element={<TechLeads />} />
                                      <Route index element={<Navigate to="dashboard" replace />} />
                                    </Route>
                                  </Routes>
                                </AdminLangProvider>
                              </AdminProvider>
                            } />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </Suspense>
                      </WishlistProvider>
                    </DarkModeProvider>
                  </CartProvider>
                </AdminProvider>
              </CustomerAuthProvider>
            </CurrencyProvider>
          </StoreProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </LanguageProvider>
  );
}