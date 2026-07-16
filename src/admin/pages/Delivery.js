import React, { useState, useEffect } from 'react';
import {
  Truck, Globe, MapPin, Package, Clock, ExternalLink,
  Search, CheckCircle, PackageSearch, Loader2, Inbox,
  Settings, Key, Save, RefreshCw, AlertCircle, Eye, EyeOff,
  Printer, Phone, User, Hash, ArrowRight, Wifi, WifiOff
} from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

/* ─────────────────────────────────────────────────────────────
   FedEx API helpers  (Production endpoints)
───────────────────────────────────────────────────────────── */
const FEDEX_BASE = 'https://apis.fedex.com';

async function fedexGetToken(clientId, clientSecret) {
  const res = await fetch(`${FEDEX_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`
  });
  if (!res.ok) throw new Error('FedEx auth failed');
  const data = await res.json();
  return data.access_token;
}

async function fedexCreateShipment(token, shipment) {
  const payload = {
    labelResponseOptions: 'URL_ONLY',
    requestedShipment: {
      shipper: {
        contact: { personName: 'Zahrat Beesan', phoneNumber: '0796697413', companyName: 'Zahrat Beesan' },
        address: { streetLines: ['Amman'], city: 'Amman', stateOrProvinceCode: 'AM', postalCode: '11118', countryCode: 'JO' }
      },
      recipients: [{
        contact: { personName: shipment.customer, phoneNumber: shipment.phone || '0000000000' },
        address: {
          streetLines: [shipment.address || shipment.destination],
          city: shipment.city || shipment.destination.split(',')[0],
          postalCode: shipment.postalCode || '00000',
          countryCode: shipment.countryCode || 'AE'
        }
      }],
      serviceType: 'INTERNATIONAL_PRIORITY',
      packagingType: 'YOUR_PACKAGING',
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      requestedPackageLineItems: [{
        weight: { units: 'KG', value: shipment.weight || 1 },
        dimensions: { length: 20, width: 15, height: 10, units: 'CM' }
      }],
      shippingChargesPayment: { paymentType: 'SENDER', payor: { responsibleParty: { accountNumber: { value: '' } } } },
      labelSpecification: { labelStockType: 'PAPER_4X6', imageType: 'PDF' }
    },
    accountNumber: { value: '' }
  };
  const res = await fetch(`${FEDEX_BASE}/ship/v1/shipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('FedEx shipment creation failed');
  return res.json();
}

async function fedexTrackShipment(token, trackingNumber) {
  const payload = { includeDetailedScans: true, trackingInfo: [{ trackingNumberInfo: { trackingNumber } }] };
  const res = await fetch(`${FEDEX_BASE}/track/v1/trackingnumbers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('FedEx track failed');
  return res.json();
}

/* ─────────────────────────────────────────────────────────────
   Logestech API helpers  (Jordan local delivery)
───────────────────────────────────────────────────────────── */
const LOGESTECH_BASE = 'https://backend.logestechs.com/api';

async function logestechCreateShipment(apiKey, companyId, shipment) {
  const payload = {
    reference_number: shipment.id,
    customer_name: shipment.customer,
    customer_phone: shipment.phone || '0790000000',
    destination_address: shipment.destination,
    destination_city: shipment.city || shipment.destination.split(',')[0],
    weight: shipment.weight || 1,
    cod_amount: shipment.cod || 0,
    notes: shipment.notes || 'Zahrat Beesan Order',
    company_id: companyId
  };
  const res = await fetch(`${LOGESTECH_BASE}/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Logestech shipment creation failed');
  return res.json();
}

async function logestechTrackShipment(apiKey, trackingNumber) {
  const res = await fetch(`${LOGESTECH_BASE}/shipments/${trackingNumber}/track`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }
  });
  if (!res.ok) throw new Error('Logestech track failed');
  return res.json();
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
const Delivery = () => {
  const { t, adminLang } = useAdminLang();
  const [activeTab, setActiveTab] = useState('international');

  // API settings — stored in localStorage
  const [fedexClientId, setFedexClientId] = useState(() => localStorage.getItem('fedex_client_id') || '');
  const [fedexClientSecret, setFedexClientSecret] = useState(() => localStorage.getItem('fedex_client_secret') || '');
  const [fedexAccountNum, setFedexAccountNum] = useState(() => localStorage.getItem('fedex_account_num') || '');
  const [logestechApiKey, setLogestechApiKey] = useState(() => localStorage.getItem('logestech_api_key') || '');
  const [logestechCompanyId, setLogestechCompanyId] = useState(() => localStorage.getItem('logestech_company_id') || '');

  const [showSecrets, setShowSecrets] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState({}); // { fedex: 'ok'|'error'|null, logestech: ... }

  const [searchTerm, setSearchTerm] = useState('');
  const [loadingWaybill, setLoadingWaybill] = useState(null);
  const [processedOrders, setProcessedOrders] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [activeTrackings, setActiveTrackings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('active_trackings') || '[]'); } catch { return []; }
  });

  // Sample pending orders (in production these come from Orders DB)
  const allPendingShipments = [
    { id: '#ORD-9912', customer: 'Sarah Ahmed', phone: '0797000001', destination: 'Dubai, UAE', city: 'Dubai', countryCode: 'AE', postalCode: '00000', date: '2026-07-15', isLocal: false, weight: 1.2, cod: 0 },
    { id: '#ORD-9915', customer: 'John Smith', phone: '0797000002', destination: 'London, UK', city: 'London', countryCode: 'GB', postalCode: 'SW1A', date: '2026-07-16', isLocal: false, weight: 0.8, cod: 0 },
    { id: '#ORD-9918', customer: 'Fahad Al-Saud', phone: '0797000003', destination: 'Riyadh, KSA', city: 'Riyadh', countryCode: 'SA', postalCode: '12271', date: '2026-07-16', isLocal: false, weight: 1.5, cod: 0 },
    { id: '#ORD-9920', customer: 'Ali Hassan', phone: '0790111222', destination: 'Amman, JO', city: 'Amman', countryCode: 'JO', postalCode: '11118', date: '2026-07-16', isLocal: true, weight: 0.9, cod: 15 },
    { id: '#ORD-9922', customer: 'Omar Zaid', phone: '0790333444', destination: 'Irbid, JO', city: 'Irbid', countryCode: 'JO', postalCode: '21110', date: '2026-07-16', isLocal: true, weight: 1.1, cod: 25 },
    { id: '#ORD-9925', customer: 'Hana Khalil', phone: '0790555666', destination: 'Zarqa, JO', city: 'Zarqa', countryCode: 'JO', postalCode: '13110', date: '2026-07-17', isLocal: true, weight: 0.7, cod: 0 },
  ];

  const pendingShipments = allPendingShipments
    .filter(s => activeTab === 'local' ? s.isLocal : !s.isLocal)
    .filter(s => !processedOrders.includes(s.id))
    .filter(s =>
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Persist active trackings
  useEffect(() => {
    localStorage.setItem('active_trackings', JSON.stringify(activeTrackings));
  }, [activeTrackings]);

  const saveSettings = () => {
    localStorage.setItem('fedex_client_id', fedexClientId);
    localStorage.setItem('fedex_client_secret', fedexClientSecret);
    localStorage.setItem('fedex_account_num', fedexAccountNum);
    localStorage.setItem('logestech_api_key', logestechApiKey);
    localStorage.setItem('logestech_company_id', logestechCompanyId);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const testConnection = async () => {
    setTestingConn(true);
    setConnStatus({});
    const status = {};
    // Test FedEx
    if (fedexClientId && fedexClientSecret) {
      try {
        await fedexGetToken(fedexClientId, fedexClientSecret);
        status.fedex = 'ok';
      } catch { status.fedex = 'error'; }
    } else { status.fedex = 'missing'; }
    // Test Logestech (simple ping)
    if (logestechApiKey) {
      try {
        const res = await fetch(`${LOGESTECH_BASE}/companies`, {
          headers: { Authorization: `Bearer ${logestechApiKey}`, Accept: 'application/json' }
        });
        status.logestech = res.ok ? 'ok' : 'error';
      } catch { status.logestech = 'error'; }
    } else { status.logestech = 'missing'; }
    setConnStatus(status);
    setTestingConn(false);
  };

  const handleCreateWaybill = async (shipment) => {
    setLoadingWaybill(shipment.id);
    setApiError(null);
    try {
      let trackingId, labelUrl = null;
      if (shipment.isLocal) {
        // Logestech
        const data = await logestechCreateShipment(logestechApiKey, logestechCompanyId, shipment);
        trackingId = data?.data?.tracking_number || data?.tracking_number || `LCL-${Date.now()}`;
        labelUrl = data?.data?.label_url || null;
      } else {
        // FedEx
        const token = await fedexGetToken(fedexClientId, fedexClientSecret);
        const data = await fedexCreateShipment(token, shipment);
        const piece = data?.output?.transactionShipments?.[0]?.pieceResponses?.[0];
        trackingId = piece?.trackingNumber || `FDX-${Date.now()}`;
        labelUrl = piece?.packageDocuments?.[0]?.url || null;
      }

      const newTracking = {
        trackingId,
        orderId: shipment.id,
        customer: shipment.customer,
        phone: shipment.phone,
        destination: shipment.destination,
        company: shipment.isLocal ? 'Logestech' : 'FedEx',
        isLocal: shipment.isLocal,
        status: 'Processing',
        expected: (() => { const d = new Date(); d.setDate(d.getDate() + (shipment.isLocal ? 2 : 5)); return d.toISOString().split('T')[0]; })(),
        labelUrl,
        createdAt: new Date().toISOString()
      };
      setActiveTrackings(prev => [newTracking, ...prev]);
      setProcessedOrders(prev => [...prev, shipment.id]);
    } catch (err) {
      setApiError(`فشل إنشاء الشحنة: ${err.message}`);
    }
    setLoadingWaybill(null);
  };

  const getStatusStyle = (status) => {
    const map = {
      'Processing': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
      'In Transit': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
      'Out for Delivery': { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
      'Delivered': { bg: 'rgba(16,185,129,0.18)', color: '#059669' },
      'Failed': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    };
    return map[status] || { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' };
  };

  const colors = {
    bean: 'var(--admin-card)',
    crema: 'var(--admin-accent)',
    latte: 'var(--admin-text)',
    border: 'var(--admin-border)',
    input: 'var(--admin-input, rgba(0,0,0,0.06))'
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: `1px solid ${colors.border}`, background: colors.input,
    color: colors.latte, outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box'
  };
  const labelStyle = { display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' };

  const renderTab = (id, icon, label, badge) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 22px', borderRadius: '12px',
        backgroundColor: activeTab === id ? colors.crema : 'transparent',
        color: activeTab === id ? '#111' : colors.latte,
        fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: activeTab === id ? 'none' : `1px solid ${colors.border}`,
        boxShadow: activeTab === id ? '0 5px 15px rgba(196,164,132,0.3)' : 'none',
      }}
    >
      {icon} {label}
      {badge > 0 && (
        <span style={{ background: '#ef4444', color: '#fff', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px' }}>
          {badge}
        </span>
      )}
    </button>
  );

  /* ── Conn status badge ── */
  const ConnBadge = ({ service }) => {
    if (!connStatus[service]) return null;
    const ok = connStatus[service] === 'ok';
    const missing = connStatus[service] === 'missing';
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
        background: ok ? 'rgba(16,185,129,0.12)' : missing ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
        color: ok ? '#10b981' : missing ? '#f59e0b' : '#ef4444'
      }}>
        {ok ? <Wifi size={11} /> : <WifiOff size={11} />}
        {ok ? 'متصل' : missing ? 'غير مُعرَّف' : 'خطأ في الاتصال'}
      </span>
    );
  };

  return (
    <div className="dashboard-fade-in" style={{ paddingBottom: '80px', maxWidth: '1500px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '35px' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.5rem', color: colors.crema, lineHeight: 1, marginBottom: '18px' }}>
          <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span>{' '}
          <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Delivery</span>
        </div>
        <div style={{
          background: 'rgba(196,164,132,0.06)', border: '1px solid rgba(196,164,132,0.2)',
          padding: '12px 22px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '12px'
        }}>
          <Truck size={26} color={colors.crema} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.6rem', fontWeight: '900', color: 'var(--admin-text)' }}>
            {t('Delivery & Shipping')}
          </span>
        </div>
        <p style={{ margin: '4px 0 0 4px', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          {t('Integrated with Logestech (local) and FedEx (international). Enter your API credentials in Settings tab.')}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {renderTab('international', <Globe size={17} />, 'FedEx — دولي')}
        {renderTab('local', <MapPin size={17} />, 'Logestech — محلي')}
        {renderTab('tracking', <PackageSearch size={17} />, 'متابعة الشحنات', activeTrackings.length)}
        {renderTab('settings', <Settings size={17} />, 'إعدادات الـ API')}
      </div>

      {/* Error banner */}
      {apiError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
          <AlertCircle size={18} /> {apiError}
          <button onClick={() => setApiError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>

          {/* FedEx Settings */}
          <div style={{ background: colors.bean, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 6px', color: colors.latte, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={20} color={colors.crema} /> FedEx API
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '22px' }}>
              للشحن الدولي. احصل على بياناتك من{' '}
              <a href="https://developer.fedex.com" target="_blank" rel="noreferrer" style={{ color: colors.crema }}>developer.fedex.com</a>
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}><Key size={12} style={{ display: 'inline', marginLeft: '4px' }} /> Client ID</label>
              <input type={showSecrets ? 'text' : 'password'} value={fedexClientId} onChange={e => setFedexClientId(e.target.value)} placeholder="Paste FedEx Client ID" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}><Key size={12} style={{ display: 'inline', marginLeft: '4px' }} /> Client Secret</label>
              <input type={showSecrets ? 'text' : 'password'} value={fedexClientSecret} onChange={e => setFedexClientSecret(e.target.value)} placeholder="Paste FedEx Client Secret" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}><Hash size={12} style={{ display: 'inline', marginLeft: '4px' }} /> Account Number</label>
              <input type="text" value={fedexAccountNum} onChange={e => setFedexAccountNum(e.target.value)} placeholder="123456789" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ConnBadge service="fedex" />
              <a href="https://developer.fedex.com/api/en-sa/catalog.html" target="_blank" rel="noreferrer" style={{ color: colors.crema, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={12} /> API Catalog
              </a>
            </div>
          </div>

          {/* Logestech Settings */}
          <div style={{ background: colors.bean, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 6px', color: colors.latte, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={20} color={colors.crema} /> Logestech API
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '22px' }}>
              للتوصيل المحلي داخل الأردن. احصل على المفاتيح من{' '}
              <a href="https://logestechs.com" target="_blank" rel="noreferrer" style={{ color: colors.crema }}>logestechs.com</a>
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}><Key size={12} style={{ display: 'inline', marginLeft: '4px' }} /> API Key (Bearer Token)</label>
              <input type={showSecrets ? 'text' : 'password'} value={logestechApiKey} onChange={e => setLogestechApiKey(e.target.value)} placeholder="Paste Logestech API Key" style={inputStyle} />
            </div>
            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}><Hash size={12} style={{ display: 'inline', marginLeft: '4px' }} /> Company ID</label>
              <input type="text" value={logestechCompanyId} onChange={e => setLogestechCompanyId(e.target.value)} placeholder="رقم الشركة في Logestech" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ConnBadge service="logestech" />
              <a href="https://www.postman.com/logestechs" target="_blank" rel="noreferrer" style={{ color: colors.crema, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ExternalLink size={12} /> API Docs
              </a>
            </div>
          </div>

          {/* Actions */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setShowSecrets(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.latte, cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem' }}
            >
              {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSecrets ? 'إخفاء المفاتيح' : 'إظهار المفاتيح'}
            </button>

            <button
              onClick={testConnection}
              disabled={testingConn}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.latte, cursor: testingConn ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.88rem' }}
            >
              {testingConn ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Wifi size={16} />}
              اختبار الاتصال
            </button>

            <button
              onClick={saveSettings}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '10px', border: 'none', background: settingsSaved ? '#10b981' : colors.crema, color: '#111', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', transition: 'background 0.3s ease' }}
            >
              {settingsSaved ? <CheckCircle size={16} /> : <Save size={16} />}
              {settingsSaved ? 'تم الحفظ!' : 'حفظ الإعدادات'}
            </button>

            {Object.keys(connStatus).length > 0 && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 16px', background: colors.bean, borderRadius: '10px', border: `1px solid ${colors.border}`, fontSize: '0.85rem', color: colors.latte }}>
                <span>FedEx: <ConnBadge service="fedex" /></span>
                <span>Logestech: <ConnBadge service="logestech" /></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FEDEX / LOGESTECH SHIPMENTS TABS ── */}
      {(activeTab === 'international' || activeTab === 'local') && (
        <div>
          {/* API credentials warning if not set */}
          {((activeTab === 'international' && (!fedexClientId || !fedexClientSecret)) ||
            (activeTab === 'local' && !logestechApiKey)) && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', color: '#f59e0b' }}>
              <AlertCircle size={18} />
              <span>
                لم تقم بإدخال بيانات الـ API بعد.{' '}
                <button onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                  اذهب للإعدادات <ArrowRight size={12} style={{ display: 'inline' }} />
                </button>
              </span>
            </div>
          )}

          <div style={{ background: colors.bean, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
            {/* Table header */}
            <div style={{ padding: '22px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}`, flexWrap: 'wrap', gap: '14px' }}>
              <h3 style={{ margin: 0, color: colors.latte, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={20} color={colors.crema} />
                {activeTab === 'local' ? 'طلبات بانتظار الشحن المحلي (Logestech)' : 'طلبات بانتظار الشحن الدولي (FedEx)'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: colors.input, padding: '9px 18px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                <Search size={15} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="ابحث باسم الزبون أو رقم الطلب..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ background: 'none', border: 'none', color: colors.latte, outline: 'none', fontSize: '0.88rem', minWidth: '180px' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderBottom: `1px solid ${colors.border}` }}>
                    {['رقم الطلب', 'الزبون', 'الهاتف', 'الوجهة', 'الوزن (كغ)', 'COD', 'التاريخ', 'إجراء'].map(h => (
                      <th key={h} style={{ padding: '14px 20px', color: colors.latte, fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingShipments.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <Inbox size={36} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
                        لا توجد طلبات معلقة
                      </td>
                    </tr>
                  ) : pendingShipments.map((s, i) => (
                    <tr key={i} className="premium-row" style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '18px 20px', fontWeight: 'bold', color: colors.crema, direction: 'ltr', whiteSpace: 'nowrap' }}>{s.id}</td>
                      <td style={{ padding: '18px 20px', color: colors.latte, fontWeight: '600', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={13} color="var(--text-secondary)" /> {s.customer}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', color: 'var(--text-secondary)', direction: 'ltr', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {s.phone}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', color: 'var(--text-secondary)', direction: 'ltr', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{s.destination}</td>
                      <td style={{ padding: '18px 20px', color: colors.latte, fontSize: '0.9rem', textAlign: 'center' }}>{s.weight}</td>
                      <td style={{ padding: '18px 20px', color: s.cod > 0 ? '#f59e0b' : 'var(--text-secondary)', fontWeight: s.cod > 0 ? '700' : '400', fontSize: '0.88rem', textAlign: 'center' }}>
                        {s.cod > 0 ? `${s.cod} JOD` : '—'}
                      </td>
                      <td style={{ padding: '18px 20px', color: 'var(--text-secondary)', direction: 'ltr', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{s.date}</td>
                      <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleCreateWaybill(s)}
                          disabled={loadingWaybill === s.id}
                          style={{
                            background: colors.crema, color: '#111', border: 'none',
                            padding: '9px 18px', borderRadius: '9px', fontWeight: 'bold',
                            cursor: loadingWaybill === s.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '7px',
                            whiteSpace: 'nowrap', opacity: loadingWaybill === s.id ? 0.7 : 1
                          }}
                        >
                          {loadingWaybill === s.id
                            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> جاري...</>
                            : <><Printer size={14} /> إنشاء بوليصة</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TRACKING TAB ── */}
      {activeTab === 'tracking' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {activeTrackings.length} شحنة نشطة
            </span>
            <button
              onClick={() => { if (window.confirm('هل تريد مسح سجل الشحنات؟')) setActiveTrackings([]); }}
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' }}
            >
              مسح السجل
            </button>
          </div>

          <div style={{ background: colors.bean, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
            {activeTrackings.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <PackageSearch size={40} style={{ display: 'block', margin: '0 auto 14px', opacity: 0.3 }} />
                لا توجد شحنات نشطة بعد. قم بإنشاء بوليصة لتظهر هنا.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderBottom: `1px solid ${colors.border}` }}>
                      {['رقم التتبع', 'الطلب', 'الزبون', 'الشركة', 'الوجهة', 'الحالة', 'التسليم المتوقع', 'بوليصة'].map(h => (
                        <th key={h} style={{ padding: '14px 20px', color: colors.latte, fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTrackings.map((track, i) => {
                      const s = getStatusStyle(track.status);
                      return (
                        <tr key={i} className="premium-row" style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td style={{ padding: '18px 20px', fontWeight: 'bold', color: colors.crema, direction: 'ltr', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {track.trackingId}
                              <ExternalLink size={13} style={{ cursor: 'pointer', opacity: 0.6 }}
                                onClick={() => {
                                  const url = track.isLocal
                                    ? `https://logestechs.com/tracking/${track.trackingId}`
                                    : `https://www.fedex.com/fedextrack/?trknbr=${track.trackingId}`;
                                  window.open(url, '_blank');
                                }}
                              />
                            </span>
                          </td>
                          <td style={{ padding: '18px 20px', color: colors.latte, direction: 'ltr', whiteSpace: 'nowrap' }}>{track.orderId}</td>
                          <td style={{ padding: '18px 20px', color: colors.latte, fontWeight: '600', whiteSpace: 'nowrap' }}>
                            <div>{track.customer}</div>
                            {track.phone && <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{track.phone}</div>}
                          </td>
                          <td style={{ padding: '18px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.latte }}>
                              {track.isLocal ? <MapPin size={13} color={colors.crema} /> : <Globe size={13} color={colors.crema} />}
                              {track.company}
                            </span>
                          </td>
                          <td style={{ padding: '18px 20px', color: 'var(--text-secondary)', direction: 'ltr', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{track.destination}</td>
                          <td style={{ padding: '18px 20px' }}>
                            <span style={{ background: s.bg, color: s.color, padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              {track.status}
                            </span>
                          </td>
                          <td style={{ padding: '18px 20px', color: 'var(--text-secondary)', direction: 'ltr', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{track.expected}</td>
                          <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                            {track.labelUrl
                              ? <a href={track.labelUrl} target="_blank" rel="noreferrer" style={{ color: colors.crema, display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                                  <Printer size={14} /> طباعة
                                </a>
                              : <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .premium-row:hover { background-color: rgba(0,0,0,0.025) !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Delivery;
