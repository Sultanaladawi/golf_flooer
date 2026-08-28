import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Globe, ShoppingBag, CheckCircle2, AlertTriangle, ExternalLink,
  RefreshCw, ShieldCheck, Settings, Send, DollarSign, Package,
  Layers, Lock, Sparkles, Check, ArrowRight, Eye, Tag, Trash2, Edit3, X
} from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

export default function EbayIntegration() {
  const { t } = useAdminLang();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'settings' | 'orders'

  // Data states
  const [settings, setSettings] = useState({
    mode: 'sandbox',
    app_id: '',
    cert_id: '',
    dev_id: '',
    ru_name: '',
    marketplace_id: 'EBAY_US',
    fulfillment_policy_id: '',
    payment_policy_id: '',
    return_policy_id: '',
    auto_sync_stock: true,
    currency: 'USD'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, error: 0 });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal / Publish drawer state
  const [publishModalProduct, setPublishModalProduct] = useState(null);
  const [publishForm, setPublishForm] = useState({
    customSku: '',
    customPriceUsd: '',
    customTitle: '',
    customDescription: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, productsRes] = await Promise.all([
        axios.get('/api/admin/ebay/settings').catch(() => ({ data: {} })),
        axios.get('/api/admin/ebay/products').catch(() => ({ data: [] }))
      ]);

      if (settingsRes.data?.settings) {
        setSettings(settingsRes.data.settings);
        setIsConnected(settingsRes.data.isConnected);
        setIsTokenValid(settingsRes.data.isTokenValid);
        setTokenExpiresAt(settingsRes.data.tokenExpiresAt);
        if (settingsRes.data.stats) setStats(settingsRes.data.stats);
      }

      if (Array.isArray(productsRes.data)) {
        setProducts(productsRes.data);
      }
    } catch (err) {
      console.error('Failed to load eBay data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check URL parameters for OAuth return
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      alert('تم ربط وتفويض حساب eBay بنجاح عبر OAuth 2.0! 🎉');
    } else if (urlParams.get('auth') === 'error') {
      alert('حدث خطأ أثناء التفويض مع eBay: ' + urlParams.get('msg'));
    }
  }, []);

  // ─── OAUTH AUTHORIZATION TRIGGER ─────────────────────────────
  const handleConnectOAuth = async () => {
    try {
      const res = await axios.get('/api/admin/ebay/auth-url');
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      }
    } catch (err) {
      alert('يرجى حفظ App ID و RuName أولاً قبل بدء التفويض: ' + (err.response?.data?.error || err.message));
    }
  };

  // ─── SAVE SETTINGS ───────────────────────────────────────────
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/ebay/settings', settings);
      alert('تم حفظ إعدادات الربط بنجاح ✅');
      fetchData();
    } catch (err) {
      alert('خطأ في حفظ الإعدادات: ' + (err.response?.data?.error || err.message));
    }
  };

  // ─── OPEN PUBLISH MODAL ──────────────────────────────────────
  const handleOpenPublishModal = (prod) => {
    setPublishModalProduct(prod);
    setPublishForm({
      customSku: prod.sku || `ZB-ABAYA-${prod.product_id}`,
      customPriceUsd: prod.ebay_price_usd || (Number(prod.price_jod || 50) * 1.41).toFixed(2),
      customTitle: `${prod.product_name} - Luxury Embroidered Abaya`.slice(0, 80),
      customDescription: prod.description || `Luxury Handcrafted Abaya & Modest Islamic Couture by Zahrat Beesan. Premium Silk & Georgette Fabric, Made in Jordan with authentic detailed embroidery.`
    });
  };

  // ─── EXECUTE 3-STEP PUBLISHING PIPELINE ──────────────────────
  const handleExecutePublish = async (e) => {
    e.preventDefault();
    if (!publishModalProduct) return;

    const prodId = publishModalProduct.product_id;
    setPublishingId(prodId);

    try {
      const res = await axios.post(`/api/admin/ebay/publish/${prodId}`, publishForm);
      alert(`🎉 تم نشر المنتج بنجاح على eBay!\nرقم الإعلان: ${res.data.listingId}\nSKU: ${res.data.sku}`);
      setPublishModalProduct(null);
      fetchData();
    } catch (err) {
      alert('خطأ أثناء النشر على eBay:\n' + (err.response?.data?.error || err.message));
    } finally {
      setPublishingId(null);
    }
  };

  // ─── SYNC STOCK ──────────────────────────────────────────────
  const handleSyncStock = async (prodId) => {
    setSyncingId(prodId);
    try {
      const res = await axios.post(`/api/admin/ebay/sync-stock/${prodId}`);
      alert(`تم تحديث المخزون على eBay بنجاح! الكمية الحالية: ${res.data.stock}`);
      fetchData();
    } catch (err) {
      alert('خطأ في تحديث المخزون: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncingId(null);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchSearch = (p.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const uniqueCategories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  return (
    <div className="dashboard-fade-in" style={{ padding: '24px', minHeight: '100vh', maxWidth: '1440px', margin: '0 auto', fontFamily: 'inherit' }}>
      
      {/* ── HEADER ── */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', color: '#e53238', fontWeight: 900, lineHeight: 1 }}>ebay</span>
            <span style={{ fontSize: '1.8rem', color: 'var(--admin-text, #111)', fontStyle: 'italic', fontWeight: 800 }}>REST API Hub</span>
          </div>
          <h1 style={{ fontSize: '1.35rem', color: 'var(--admin-text, #111)', margin: 0, fontWeight: 900 }}>
            🛍️ الربط والمزامنة المباشرة مع متجر eBay العالمي
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: '0.88rem' }}>
            نشر المنتجات تلقائياً (Inventory & Offer APIs)، مزامنة المخزون اللحظية، واستقبال الطلبات الدولية.
          </p>
        </div>

        {/* Status Badge & Connect Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: isConnected ? '#d1fae5' : '#fee2e2',
            color: isConnected ? '#059669' : '#dc2626',
            padding: '8px 14px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: isConnected ? '1px solid #a7f3d0' : '1px solid #fecaca'
          }}>
            {isConnected ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{isConnected ? `متصل (${settings.mode === 'production' ? 'Production 🚀' : 'Sandbox 🧪'})` : 'غير متصل بحساب eBay'}</span>
          </div>

          <button
            onClick={handleConnectOAuth}
            style={{
              background: 'linear-gradient(135deg, #0064d2 0%, #0053b3 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,100,210,0.25)'
            }}
          >
            <ShieldCheck size={18} /> {isConnected ? 'إعادة التفويض (OAuth 2.0)' : 'ربط حساب eBay (OAuth 2.0)'}
          </button>
        </div>
      </div>

      {/* ── TOP METRICS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--admin-card, #fff)', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--admin-border, #e8e2d5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>إجمالي المنتجات في المتجر</span>
            <Package size={18} color="#b8943a" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--admin-text, #111)', marginTop: '6px' }}>
            {products.length} <small style={{ fontSize: '0.85rem', color: '#777' }}>منتج</small>
          </div>
        </div>

        <div style={{ background: 'var(--admin-card, #fff)', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--admin-border, #e8e2d5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>إعلانات نشطة على eBay</span>
            <Globe size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>
            {products.filter(p => p.ebay_status === 'active').length} <small style={{ fontSize: '0.85rem', color: '#777' }}>إعلان حي</small>
          </div>
        </div>

        <div style={{ background: 'var(--admin-card, #fff)', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--admin-border, #e8e2d5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>جاهزة للنشر (Drafts)</span>
            <Sparkles size={18} color="#6366f1" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6366f1', marginTop: '6px' }}>
            {products.filter(p => p.ebay_status !== 'active').length} <small style={{ fontSize: '0.85rem', color: '#777' }}>منتج جاهز</small>
          </div>
        </div>

        <div style={{ background: 'var(--admin-card, #fff)', padding: '18px 20px', borderRadius: '18px', border: '1px solid var(--admin-border, #e8e2d5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>المزامنة التلقائية</span>
            <RefreshCw size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: settings.auto_sync_stock ? '#059669' : '#dc2626', marginTop: '6px' }}>
            {settings.auto_sync_stock ? '🟢 مفعلة حياً' : '🔴 متوقفة'}
          </div>
        </div>
      </div>

      {/* ── MAIN TABS ── */}
      <div style={{
        background: 'var(--admin-card, #ffffff)',
        border: '1px solid var(--admin-border, #e8e2d5)',
        borderRadius: '20px',
        padding: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '8px'
      }}>
        {[
          { id: 'catalog', label: '📦 كتالوج المنتجات والنشر على eBay (Catalog & Publisher)', count: products.length },
          { id: 'settings', label: '⚙️ مفاتيح الـ API وإعدادات السياسات (OAuth & Settings)' },
          { id: 'orders', label: '🛒 طلبات eBay المستوردة والـ Webhooks' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '14px',
              border: 'none',
              background: activeTab === t.id ? '#111111' : 'transparent',
              color: activeTab === t.id ? '#ffffff' : 'var(--admin-text, #444)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span style={{ background: activeTab === t.id ? '#0064d2' : 'rgba(0,0,0,0.06)', color: activeTab === t.id ? '#fff' : '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '0.74rem' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════
          TAB 1: PRODUCTS CATALOG & ONE-CLICK PUBLISHER
          ═════════════════════════════════════════════════════════ */}
      {activeTab === 'catalog' && (
        <div style={{ background: 'var(--admin-card, #ffffff)', border: '1px solid var(--admin-border, #e8e2d5)', borderRadius: '20px', padding: '24px' }}>
          
          {/* Abayas Dedicated Focus Notice */}
          <div style={{
            background: 'linear-gradient(135deg, #fdfaf4 0%, #f7f1e3 100%)',
            border: '1px solid #e2d2b4',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} color="#b8943a" />
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#5c4327', display: 'block' }}>
                  ✨ المنظومة مهيأة ومخصصة حصرياً لقسم العبايات الفاخرة والأزياء المحتشمة
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#7a5a3a' }}>
                  تصنيف eBay المعتمد: Traditional & World Clothing - Women's Abayas (#175759) مع تجهيز تلقائي للـ Aspects (Georgette, Silk, Long Sleeve, Jordan).
                </span>
              </div>
            </div>
            <span style={{ background: '#b8943a', color: '#fff', padding: '4px 12px', borderRadius: '10px', fontWeight: 800, fontSize: '0.78rem' }}>
              قسم العبايات فقط ⭐
            </span>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="بحث باسم المنتج أو الـ SKU..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #e8e2d5', fontSize: '0.85rem', minWidth: '240px' }}
              />

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid #e8e2d5', fontSize: '0.85rem', background: '#fff' }}
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'جميع الأقسام' : cat}</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              عدد المنتجات: <strong>{filteredProducts.length}</strong>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e8e2d5', color: '#666', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 14px' }}>المنتج</th>
                  <th style={{ padding: '12px 14px' }}>SKU</th>
                  <th style={{ padding: '12px 14px' }}>المخزون</th>
                  <th style={{ padding: '12px 14px' }}>السعر المحلي</th>
                  <th style={{ padding: '12px 14px' }}>سعر eBay (USD)</th>
                  <th style={{ padding: '12px 14px' }}>حالة eBay</th>
                  <th style={{ padding: '12px 14px' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const isPublished = p.ebay_status === 'active';
                  const isError = p.ebay_status === 'error';
                  const imgUrl = p.images_list?.[0] || '/logo.png';

                  return (
                    <tr key={p.product_id} style={{ borderBottom: '1px solid #f0ece3', fontSize: '0.88rem' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={imgUrl}
                            alt={p.product_name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #eee' }}
                          />
                          <div>
                            <strong>{p.product_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#777' }}>{p.category}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 700, color: '#0064d2' }}>
                        {p.sku}
                      </td>

                      <td style={{ padding: '14px' }}>
                        <span style={{ fontWeight: 800, color: p.stock > 0 ? '#10b981' : '#ef4444' }}>
                          {p.stock} قطعة
                        </span>
                      </td>

                      <td style={{ padding: '14px', fontWeight: 700 }}>
                        {p.price_jod} د.أ
                      </td>

                      <td style={{ padding: '14px', fontWeight: 800, color: '#0064d2' }}>
                        ${p.ebay_price_usd}
                      </td>

                      <td style={{ padding: '14px' }}>
                        {isPublished ? (
                          <div>
                            <span style={{ background: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> حي على eBay
                            </span>
                            {p.listing_id && (
                              <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '2px', fontFamily: 'monospace' }}>
                                #{p.listing_id}
                              </div>
                            )}
                          </div>
                        ) : isError ? (
                          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={p.error_message}>
                            <AlertTriangle size={12} /> خطأ في النشر
                          </span>
                        ) : (
                          <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, fontSize: '0.75rem' }}>
                            مسودة غير منشورة
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleOpenPublishModal(p)}
                            disabled={publishingId === p.product_id}
                            style={{
                              background: isPublished ? '#111' : '#0064d2',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Send size={13} /> {isPublished ? 'إعادة النشر / تعديل' : 'نشر على eBay 🚀'}
                          </button>

                          {isPublished && (
                            <>
                              <button
                                onClick={() => handleSyncStock(p.product_id)}
                                disabled={syncingId === p.product_id}
                                style={{ background: '#f0ece3', border: '1px solid #e8e2d5', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="مزامنة المخزون الآن"
                              >
                                <RefreshCw size={13} /> مزامنة
                              </button>

                              {p.listing_id && (
                                <a
                                  href={`https://${settings.mode === 'sandbox' ? 'sandbox.' : ''}ebay.com/itm/${p.listing_id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ background: '#fafaf7', border: '1px solid #e8e2d5', color: '#0064d2', padding: '6px 8px', borderRadius: '8px', fontSize: '0.78rem', textDecoration: 'none' }}
                                  title="فتح الإعلان على موقع eBay"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 2: OAUTH KEYS & POLICY SETTINGS
          ═════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div style={{ background: 'var(--admin-card, #ffffff)', border: '1px solid var(--admin-border, #e8e2d5)', borderRadius: '20px', padding: '28px', maxWidth: '840px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 16px', color: '#111' }}>
            ⚙️ إعدادات حساب المطور ومفاتيح eBay REST API
          </h3>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Environment mode selector */}
            <div style={{ background: '#fafaf7', padding: '16px', borderRadius: '14px', border: '1px solid #e8e2d5' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
                بيئة العمل (Environment Mode):
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="mode"
                    value="sandbox"
                    checked={settings.mode === 'sandbox'}
                    onChange={e => setSettings({ ...settings, mode: e.target.value })}
                  />
                  <span>Sandbox (بيئة التجربة والـ Testing) 🧪</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700 }}>
                  <input
                    type="radio"
                    name="mode"
                    value="production"
                    checked={settings.mode === 'production'}
                    onChange={e => setSettings({ ...settings, mode: e.target.value })}
                  />
                  <span>Production (حساب البائع الحي الحقيقي) 🚀</span>
                </label>
              </div>
            </div>

            {/* App Credentials */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>App ID (Client ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="Your-eBay-AppID-..."
                  value={settings.app_id}
                  onChange={e => setSettings({ ...settings, app_id: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Cert ID (Client Secret) *</label>
                <input
                  type="text"
                  placeholder="Your-eBay-CertID-..."
                  value={settings.cert_id}
                  onChange={e => setSettings({ ...settings, cert_id: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>RuName (eBay Redirect URL) *</label>
                <input
                  type="text"
                  required
                  placeholder="Your_RuName_from_eBay_Dev_Portal"
                  value={settings.ru_name}
                  onChange={e => setSettings({ ...settings, ru_name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>السوق المستهدف (Marketplace)</label>
                <select
                  value={settings.marketplace_id}
                  onChange={e => setSettings({ ...settings, marketplace_id: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                >
                  <option value="EBAY_US">eBay الولايات المتحدة (EBAY_US)</option>
                  <option value="EBAY_GB">eBay بريطانيا (EBAY_GB)</option>
                  <option value="EBAY_DE">eBay ألمانيا (EBAY_DE)</option>
                  <option value="EBAY_AU">eBay أستراليا (EBAY_AU)</option>
                </select>
              </div>
            </div>

            {/* Policy IDs */}
            <div style={{ background: '#fafaf7', padding: '16px', borderRadius: '14px', border: '1px solid #e8e2d5' }}>
              <strong style={{ fontSize: '0.88rem', color: '#b8943a', display: 'block', marginBottom: '10px' }}>
                ✦ معرفات سياسات البائع (Business Policy IDs):
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Fulfillment Policy ID</label>
                  <input
                    type="text"
                    placeholder="سياسة الشحن الدولية"
                    value={settings.fulfillment_policy_id}
                    onChange={e => setSettings({ ...settings, fulfillment_policy_id: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e8e2d5', marginTop: '4px', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Payment Policy ID</label>
                  <input
                    type="text"
                    placeholder="سياسة الدفع"
                    value={settings.payment_policy_id}
                    onChange={e => setSettings({ ...settings, payment_policy_id: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e8e2d5', marginTop: '4px', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Return Policy ID</label>
                  <input
                    type="text"
                    placeholder="سياسة الإرجاع"
                    value={settings.return_policy_id}
                    onChange={e => setSettings({ ...settings, return_policy_id: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e8e2d5', marginTop: '4px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Auto sync stock toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={settings.auto_sync_stock}
                onChange={e => setSettings({ ...settings, auto_sync_stock: e.target.checked })}
              />
              <span>تفعيل المزامنة التلقائية للمخزون عند إتمام الطلبات محلياً ⚡</span>
            </label>

            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #111, #333)',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '0.92rem',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              💾 حفظ الإعدادات وتحديث الاتصال
            </button>
          </form>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          TAB 3: WEBHOOKS & IMPORTED ORDERS
          ═════════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div style={{ background: 'var(--admin-card, #ffffff)', border: '1px solid var(--admin-border, #e8e2d5)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 12px' }}>
            🛒 مسار استقبال إشعارات وطلبات eBay الحية (Webhooks)
          </h3>
          <p style={{ color: '#666', fontSize: '0.88rem', lineHeight: 1.6 }}>
            اشترك بحدث <code>MARKETPLACE_ORDER</code> من لوحة مطور eBay واضبط رابط الـ Webhook التالي لاستقبال طلبات الزبائن مباشرة داخل جدول الطلبات وشحنها فوراً:
          </p>

          <div style={{ background: '#fafaf7', border: '1px solid #e8e2d5', padding: '14px 18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 24px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, direction: 'ltr', color: '#0064d2', fontSize: '0.95rem' }}>
              https://zahratbeesan.com/api/ebay/webhook
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://zahratbeesan.com/api/ebay/webhook');
                alert('تم نسخ رابط الـ Webhook إلى الحافظة!');
              }}
              style={{ background: '#111', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              نسخ الرابط 📋
            </button>
          </div>

          <div style={{ border: '2px dashed #e8e2d5', borderRadius: '16px', padding: '30px', textAlign: 'center', color: '#888' }}>
            <Globe size={40} color="#0064d2" style={{ opacity: 0.5, marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 6px', color: '#111' }}>المنظومة جاهزة لاستقبال الطلبات الدولية</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              تظهر هنا فوراً كافة الطلبات الواردة من مشتري eBay وتُدمج مع مسار تجهيز الشحنات عبر FedEx Express.
            </p>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL: 3-STEP PUBLISH DRAWER
          ═════════════════════════════════════════════════════════ */}
      {publishModalProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '90%', maxWidth: '640px', padding: '28px', border: '1px solid #e8e2d5', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: '#e53238', fontWeight: 900 }}>ebay</span>
                <strong style={{ fontSize: '1.15rem' }}>نشر المنتج على eBay (3-Step Pipeline)</strong>
              </div>
              <button onClick={() => setPublishModalProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Pipeline Step Visualizer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '18px', background: '#fdfaf4', padding: '10px', borderRadius: '12px', border: '1px solid #f2e3c6', fontSize: '0.75rem', textAlign: 'center' }}>
              <div style={{ color: '#b8943a', fontWeight: 800 }}>1. Create Item</div>
              <div style={{ color: '#b8943a', fontWeight: 800 }}>2. Create Offer</div>
              <div style={{ color: '#10b981', fontWeight: 800 }}>3. Publish Live ✓</div>
            </div>

            <form onSubmit={handleExecutePublish} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>معرف المنتج (SKU) *</label>
                  <input
                    type="text"
                    required
                    value={publishForm.customSku}
                    onChange={e => setPublishForm({ ...publishForm, customSku: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #e8e2d5', fontFamily: 'monospace', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>سعر البيع بالدولار (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={publishForm.customPriceUsd}
                    onChange={e => setPublishForm({ ...publishForm, customPriceUsd: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #e8e2d5', marginTop: '4px', fontWeight: 800, color: '#0064d2' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>عنوان الإعلان على eBay (بحد أقصى 80 حرف) *</label>
                <input
                  type="text"
                  maxLength={80}
                  required
                  value={publishForm.customTitle}
                  onChange={e => setPublishForm({ ...publishForm, customTitle: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #e8e2d5', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>الوصف التفصيلي (Description)</label>
                <textarea
                  rows={3}
                  value={publishForm.customDescription}
                  onChange={e => setPublishForm({ ...publishForm, customDescription: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #e8e2d5', marginTop: '4px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={publishingId !== null}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0064d2, #004ba0)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '0.92rem',
                    cursor: 'pointer'
                  }}
                >
                  {publishingId ? 'جاري تنفيذ خطوات النشر على eBay...' : '🚀 إطلاق ونشر الإعلان الآن'}
                </button>
                <button
                  type="button"
                  onClick={() => setPublishModalProduct(null)}
                  style={{ background: '#f5f5f5', border: 'none', padding: '12px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
