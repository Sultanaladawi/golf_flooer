import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Activity, Users, ShoppingCart, CreditCard, CheckCircle2,
  AlertCircle, Eye, RefreshCw, Smartphone, Monitor, Globe,
  MessageCircle, Phone, ArrowUpRight, Clock, ShieldCheck, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

export default function LiveRadar() {
  const { t } = useAdminLang();
  const [data, setData] = useState({
    activeNow: 0,
    totalSessionsToday: 0,
    funnel: {
      totalVisitors: 0,
      bouncedCount: 0,
      cartFilledCount: 0,
      checkoutReachedCount: 0,
      purchasedCount: 0,
      bouncedRate: 0,
      cartConversionRate: 0,
      checkoutRate: 0,
      purchaseRate: 0
    },
    onlineVisitors: [],
    sessionsWithCarts: [],
    recentActivity: []
  });

  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'checkout', 'cart', 'bounced', 'purchased'
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const timerRef = useRef(null);

  const fetchLiveRadar = async () => {
    try {
      const res = await axios.get('/api/admin/live-radar');
      if (res.data && res.data.success) {
        setData(res.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch live radar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRadar();
    if (autoRefresh) {
      timerRef.current = setInterval(fetchLiveRadar, 4000); // Pulse every 4s
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh]);

  const handleWhatsAppContact = (session) => {
    if (!session.customerPhone) {
      alert('لا يتوفر رقم هاتف لهذه الزائرة حتى الآن.');
      return;
    }
    let cleanPhone = session.customerPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('07') && cleanPhone.length === 10) cleanPhone = '962' + cleanPhone.substring(1);
    else if (cleanPhone.startsWith('05') && cleanPhone.length === 10) cleanPhone = '966' + cleanPhone.substring(1);
    else if (cleanPhone.length === 9) cleanPhone = '962' + cleanPhone;

    const items = session.cartItems || [];
    const firstItem = items[0]?.name || 'عباية زهرة بيسان الملكية';

    const msg = `مرحباً بكِ من متجر زهرة بيسان 🌸✨\n\nلاحظنا اهتمامكِ بـ (${firstItem}) في سلة تسوقكِ!\n\n🎁 يسعدنا تقديم كود خصم خاص 10% (BEESAN10) لإتمام طلبكِ وتوصيله لباب بيتكِ:\nhttps://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/checkout\n\nهل تحتاجين لأي مساعدة في المقاس أو طريقة الدفع؟ يسعدنا خدمتكِ فوراً 💕`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredCarts = (data.sessionsWithCarts || []).filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'checkout') return item.stage === 'checkout_step' || item.currentPage?.includes('/checkout');
    if (selectedFilter === 'cart') return item.stage === 'cart_filled';
    if (selectedFilter === 'purchased') return item.stage === 'purchased';
    return true;
  });

  return (
    <div style={{ padding: '0', direction: 'rtl', minHeight: '100vh', background: 'var(--admin-bg, #f8f9fa)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ── Top Header with Pulsing Live Status ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '18px',
        background: 'var(--admin-card-bg, #ffffff)',
        padding: '14px 20px',
        borderRadius: '16px',
        border: '1px solid rgba(197, 168, 128, 0.25)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981',
              animation: 'pulse 1.5s infinite'
            }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--admin-text, #1e293b)', margin: 0, fontFamily: "'DM Serif Display', serif" }}>
              رادار المتجر وتحركات الزوار المباشرة (Live Store Radar)
            </h1>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
            مراقبة حية فورية للعملاء المتواجدين الآن، تفاصيل السلات، ومراحل الدفع والتراجع خطوة بخطوة.
          </p>
        </div>

        {/* Live Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: autoRefresh ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9',
              color: autoRefresh ? '#047857' : '#64748b',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: autoRefresh ? '#10b981' : '#94a3b8' }} />
            {autoRefresh ? 'تحديث حي ⚡' : 'متوقف'}
          </button>

          <button
            onClick={fetchLiveRadar}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--admin-accent, #c5a880)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(197, 168, 128, 0.25)'
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            تحديث الآن
          </button>
        </div>
      </div>

      {/* ── Real-Time Metrics & Funnel Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        
        {/* Card 1: Active Now */}
        <div style={{
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          borderRadius: '14px',
          padding: '14px 16px',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(4, 120, 87, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', opacity: 0.9 }}>المتواجدون الآن</span>
            <Users size={18} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', lineHeight: 1, marginBottom: '4px' }}>
            {data.activeNow || 0}
          </div>
          <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
            🟢 يتصفحون المتجر الآن
          </span>
        </div>

        {/* Card 2: Bounced / Browsing Only */}
        <div style={{
          background: 'var(--admin-card-bg, #ffffff)',
          borderRadius: '14px',
          padding: '14px 16px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>تصفحوا فقط</span>
            <Eye size={18} color="#94a3b8" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#334155', lineHeight: 1, marginBottom: '4px' }}>
            {data.funnel?.bouncedCount || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {data.funnel?.bouncedRate || 0}% من زوار اليوم
          </span>
        </div>

        {/* Card 3: Cart Filled */}
        <div style={{
          background: 'var(--admin-card-bg, #ffffff)',
          borderRadius: '14px',
          padding: '14px 16px',
          border: '1px solid rgba(197, 168, 128, 0.3)',
          boxShadow: '0 2px 10px rgba(197, 168, 128, 0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--admin-accent, #c5a880)' }}>عبأوا السلة</span>
            <ShoppingCart size={18} color="var(--admin-accent, #c5a880)" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--admin-accent, #c5a880)', lineHeight: 1, marginBottom: '4px' }}>
            {data.funnel?.cartFilledCount || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {data.funnel?.cartConversionRate || 0}% أضافوا للسلة
          </span>
        </div>

        {/* Card 4: Reached Checkout & Stopped */}
        <div style={{
          background: 'var(--admin-card-bg, #ffffff)',
          borderRadius: '14px',
          padding: '14px 16px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#d97706' }}>وصلوا للدفع وتراجعوا</span>
            <CreditCard size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#b45309', lineHeight: 1, marginBottom: '4px' }}>
            {data.funnel?.checkoutReachedCount || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#b45309' }}>
            ⚠️ تراجعوا قبل الدفع
          </span>
        </div>

        {/* Card 5: Completed Purchases */}
        <div style={{
          background: 'var(--admin-card-bg, #ffffff)',
          borderRadius: '14px',
          padding: '14px 16px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#059669' }}>أتموا الشراء بنجاح</span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '900', color: '#047857', lineHeight: 1, marginBottom: '4px' }}>
            {data.funnel?.purchasedCount || 0}
          </div>
          <span style={{ fontSize: '0.72rem', color: '#047857' }}>
            🎉 طلبات مؤكدة
          </span>
        </div>

      </div>

      {/* ── Main Two Column Grid: Live Visitors & Activity Stream ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left Column: Live Online Visitors Right Now */}
        <div style={{
          background: 'var(--admin-card-bg, #ffffff)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--admin-text, #1e293b)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="#10b981" />
                الزوار المتواجدون بالمتجر حالياً ({data.onlineVisitors?.length || 0})
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                عرض فوري للصفحة التي يشاهدها كل عميل الآن وتفاصيل سلته اللحظية
              </span>
            </div>
            <span style={{ background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
              تحديث حي ⚡
            </span>
          </div>

          {(!data.onlineVisitors || data.onlineVisitors.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <Users size={42} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>لا يوجد زوار متواجدون في هذه اللحظة بالذات.</p>
              <span style={{ fontSize: '0.8rem' }}>بمجرد دخول أي زائر للمتجر سيظهر هنا مباشرة!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.onlineVisitors.map((visitor, idx) => {
                const rawPage = visitor.page || '/';
                const cleanPage = rawPage.split('?')[0];
                const isTikTok = rawPage.includes('ttclid') || rawPage.includes('tiktok');
                const isMeta = rawPage.includes('fbclid');

                return (
                    <div key={idx} style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: visitor.device === 'mobile' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: visitor.device === 'mobile' ? '#2563eb' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {visitor.device === 'mobile' ? <Smartphone size={18} /> : <Monitor size={18} />}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                              {visitor.customerName || 'عميلة زائرة'}
                            </strong>
                            {visitor.customerPhone && (
                              <span style={{ fontSize: '0.8rem', color: '#2563eb', direction: 'ltr' }}>
                                {visitor.customerPhone}
                              </span>
                            )}
                            {isTikTok && (
                              <span style={{ background: '#000000', color: '#25f4ee', padding: '2px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                                🎵 زائرة من إعلان TikTok
                              </span>
                            )}
                            {isMeta && (
                              <span style={{ background: 'rgba(24, 119, 242, 0.12)', color: '#1877f2', padding: '2px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                                📘 زائرة من إعلان Meta
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>يشاهد:</span>
                            <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a', direction: 'ltr' }}>
                              {cleanPage}
                            </code>
                            <span style={{ color: '#94a3b8' }}>• نشط قبل {visitor.idleSeconds}ث</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {visitor.cartItemsCount > 0 ? (
                          <span style={{
                            background: 'rgba(197, 168, 128, 0.15)',
                            color: '#a67c48',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '0.78rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <ShoppingCart size={13} />
                            {visitor.cartItemsCount} قطع بالسلة ({visitor.cartTotal} د.أ)
                          </span>
                        ) : (
                          <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>
                            تصفح فقط
                          </span>
                        )}

                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      background: visitor.stage === 'checkout_step' ? 'rgba(245, 158, 11, 0.15)' : (visitor.stage === 'cart_filled' ? 'rgba(59, 130, 246, 0.15)' : '#f1f5f9'),
                      color: visitor.stage === 'checkout_step' ? '#b45309' : (visitor.stage === 'cart_filled' ? '#1d4ed8' : '#64748b')
                    }}>
                      {visitor.stage === 'checkout_step' ? 'في صفحة الدفع 💳' : (visitor.stage === 'cart_filled' ? 'في السلة 🛍️' : 'يتصفح 👁️')}
                    </span>
                  </div>
                </div>
              ); })}
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Activity Feed */}
        <div style={{
          background: 'var(--admin-card-bg, #ffffff)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          maxHeight: '480px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sparkles size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--admin-text, #1e293b)' }}>
              سجل التحركات الحية
            </h3>
          </div>

          {(!data.recentActivity || data.recentActivity.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.88rem' }}>
              لا توجد أنشطة مسجلة مؤخراً.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.recentActivity.map((act) => (
                <div key={act.id} style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  borderLeft: act.eventType === 'order_placed' ? '4px solid #10b981' : (act.eventType === 'checkout_view' ? '4px solid #f59e0b' : '4px solid var(--admin-accent, #c5a880)'),
                  fontSize: '0.85rem'
                }}>
                  <p style={{ margin: '0 0 4px 0', color: '#1e293b', fontWeight: '600' }}>
                    {act.description}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {new Date(act.time).toLocaleTimeString('ar-JO')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Detailed Customer Carts & Checkout Drop-offs Table ── */}
      <div style={{
        background: 'var(--admin-card-bg, #ffffff)',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        
        {/* Table Header & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--admin-text, #1e293b)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={22} color="var(--admin-accent, #c5a880)" />
              تفاصيل السلات والعميلات اللاتي لم يكملن الدفع ({filteredCarts.length})
            </h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              تعرفي على المنتجات المحددة، المقاسات، الأسعار، وتواصلي فوراً مع العميلة بضغطة زر لإتمام الطلب.
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'checkout', label: 'وصلوا للدفع وتراجعوا 💳' },
              { id: 'cart', label: 'عبأوا السلة فقط 🛍️' },
              { id: 'purchased', label: 'أتموا الشراء ✅' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: selectedFilter === f.id ? 'var(--admin-accent, #c5a880)' : 'transparent',
                  color: selectedFilter === f.id ? '#ffffff' : '#64748b',
                  transition: 'all 0.2s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filteredCarts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>لا توجد سلات مسجلة تحت هذا التصنيف حالياً.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.88rem' }}>
                  <th style={{ padding: '12px 16px' }}>العميلة والبيانات</th>
                  <th style={{ padding: '12px 16px' }}>المرحلة والحالة</th>
                  <th style={{ padding: '12px 16px' }}>المنتجات في السلة</th>
                  <th style={{ padding: '12px 16px' }}>إجمالي السعر</th>
                  <th style={{ padding: '12px 16px' }}>الوقت</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>إجراء وتواصل فوري</th>
                </tr>
              </thead>
              <tbody>
                {filteredCarts.map((sess, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    
                    {/* Customer Info */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.98rem', color: '#1e293b' }}>
                          {sess.customerName || 'عميلة زائرة'}
                        </strong>
                        {sess.isOnline && (
                          <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.72rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>
                            متواجدة الآن 🟢
                          </span>
                        )}
                      </div>
                      {sess.customerPhone && (
                        <div style={{ fontSize: '0.85rem', color: '#2563eb', direction: 'ltr', marginTop: '3px' }}>
                          {sess.customerPhone}
                        </div>
                      )}
                      {(sess.customerCity || sess.customerCountry) && (
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                          📍 {sess.customerCity ? `${sess.customerCity}، ` : ''}{sess.customerCountry}
                        </div>
                      )}
                    </td>

                    {/* Stage Badge */}
                    <td style={{ padding: '16px' }}>
                      {sess.stage === 'purchased' ? (
                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#047857', padding: '6px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                          ✅ تم الشراء بنجاح
                        </span>
                      ) : (sess.stage === 'checkout_step' || sess.currentPage?.includes('/checkout')) ? (
                        <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', padding: '6px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                          💳 تراجعت عند الدفع
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#1d4ed8', padding: '6px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                          🛍️ تركت المنتجات بالسلة
                        </span>
                      )}
                    </td>

                    {/* Products List in Cart */}
                    <td style={{ padding: '16px', maxWidth: '350px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(sess.cartItems || []).map((item, iIdx) => (
                          <div key={iIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '38px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                              />
                            )}
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' }}>
                                {item.name || item.title || 'عباية فاخرة'}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                الكمية: {item.quantity || item.qty || 1} × {item.price || item.priceNum} د.أ 
                                {item.selectedSize ? ` • المقاس: ${item.selectedSize}` : ''}
                                {item.selectedColor ? ` • اللون: ${item.selectedColor}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total Price */}
                    <td style={{ padding: '16px' }}>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--admin-accent, #c5a880)' }}>
                        {sess.cartTotal || 0} د.أ
                      </strong>
                    </td>

                    {/* Time */}
                    <td style={{ padding: '16px', fontSize: '0.82rem', color: '#64748b' }}>
                      {sess.isOnline ? 'منذ لحظات' : `قبل ${Math.round(sess.lastActiveAgoSec / 60)} دقيقة`}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {sess.customerPhone ? (
                        <button
                          onClick={() => handleWhatsAppContact(sess)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#25D366',
                            color: '#ffffff',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                          }}
                        >
                          <MessageCircle size={15} />
                          تواصل واتساب
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          لم تُدخل الهاتف بعد
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
