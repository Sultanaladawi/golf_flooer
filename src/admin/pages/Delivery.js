import React, { useState } from 'react';
import { Truck, Globe, MapPin, Package, Clock, ExternalLink, Search, CheckCircle, PackageSearch, Loader2, Inbox } from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

const Delivery = () => {
  const { t, adminLang } = useAdminLang();
  const [activeTab, setActiveTab] = useState('international');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingWaybill, setLoadingWaybill] = useState(null);
  const [processedOrders, setProcessedOrders] = useState([]);
  // Active trackings start with some demo data AND grow when waybills are created
  const [activeTrackings, setActiveTrackings] = useState([
    { trackingId: 'FDX-77492011', orderId: '#ORD-9880', customer: 'Mona Al-Rashid', destination: 'Riyadh, KSA', company: 'FedEx', isLocal: false, status: 'In Transit', expected: '2026-06-30' },
    { trackingId: 'LCL-002194', orderId: '#ORD-9892', customer: 'Karim Nasser', destination: 'Zarqa, JO', company: 'Local Express', isLocal: true, status: 'Out for Delivery', expected: '2026-06-27' },
  ]);

  const colors = {
    espresso: 'var(--admin-bg)',
    bean: 'var(--admin-card)',
    crema: 'var(--admin-accent)',
    latte: 'var(--admin-text)',
    border: 'var(--admin-border)',
    input: 'var(--admin-input, rgba(0,0,0,0.06))'
  };

  const allPendingShipments = [
    { id: '#ORD-9912', customer: 'Sarah Ahmed', destination: 'Dubai, UAE', date: '2026-06-25', isLocal: false },
    { id: '#ORD-9915', customer: 'John Smith', destination: 'London, UK', date: '2026-06-26', isLocal: false },
    { id: '#ORD-9918', customer: 'Fahad Al-Saud', destination: 'Riyadh, KSA', date: '2026-06-27', isLocal: false },
    { id: '#ORD-9920', customer: 'Ali Hassan', destination: 'Amman, JO', date: '2026-06-27', isLocal: true },
    { id: '#ORD-9922', customer: 'Omar Zaid', destination: 'Irbid, JO', date: '2026-06-27', isLocal: true },
  ];

  const pendingShipments = allPendingShipments.filter(s =>
    activeTab === 'local' ? s.isLocal : !s.isLocal
  ).filter(s =>
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate a realistic tracking number
  const generateTrackingId = (isLocal) => {
    const num = Math.floor(10000000 + Math.random() * 90000000);
    return isLocal ? `LCL-${num}` : `FDX-${num}`;
  };

  // Get expected delivery date (today + 2 days for local, +5 for international)
  const getExpectedDate = (isLocal) => {
    const d = new Date();
    d.setDate(d.getDate() + (isLocal ? 2 : 5));
    return d.toISOString().split('T')[0];
  };

  const handleCreateWaybill = (shipment) => {
    setLoadingWaybill(shipment.id);
    setTimeout(() => {
      const newTracking = {
        trackingId: generateTrackingId(shipment.isLocal),
        orderId: shipment.id,
        customer: shipment.customer,
        destination: shipment.destination,
        company: shipment.isLocal ? 'Local Express' : 'FedEx',
        isLocal: shipment.isLocal,
        status: 'In Transit',
        expected: getExpectedDate(shipment.isLocal),
      };
      setActiveTrackings(prev => [newTracking, ...prev]);
      setProcessedOrders(prev => [...prev, shipment.id]);
      setLoadingWaybill(null);
    }, 1500);
  };

  const getStatusStyle = (status) => {
    if (status === 'In Transit') return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
    if (status === 'Out for Delivery') return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
    return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
  };

  const renderTab = (id, icon, label, badge) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 24px', borderRadius: '12px',
        backgroundColor: activeTab === id ? colors.crema : 'transparent',
        color: activeTab === id ? '#111' : colors.latte,
        fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: activeTab === id ? 'none' : `1px solid ${colors.border}`,
        boxShadow: activeTab === id ? '0 5px 15px rgba(196,164,132,0.3)' : 'none',
        position: 'relative'
      }}
    >
      {icon} {label}
      {badge > 0 && (
        <span style={{
          background: '#ef4444', color: '#fff', borderRadius: '20px',
          fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', minWidth: '20px', textAlign: 'center'
        }}>{badge}</span>
      )}
    </button>
  );

  return (
    <div className="dashboard-fade-in" style={{ paddingBottom: '80px', maxWidth: '1500px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.8rem', color: colors.crema, lineHeight: 1, marginBottom: '20px' }}>
          <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span>{' '}
          <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>
        </div>
        <div style={{
          background: 'rgba(196, 164, 132, 0.05)',
          border: '1px solid rgba(196, 164, 132, 0.2)',
          padding: '12px 25px', borderRadius: '18px',
          display: 'inline-flex', alignItems: 'center', gap: '15px', marginBottom: '20px'
        }}>
          <Truck size={28} color={colors.crema} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.8rem', fontWeight: '900', color: 'var(--admin-text)', letterSpacing: '-0.5px' }}>
            {t('Delivery & Shipping')}
          </span>
        </div>
        <p style={{ margin: '5px 0 0 5px', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500', direction: 'auto' }}>
          {t('Manage API integrations, track active shipments, and process orders for delivery.')}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {renderTab('international', <Globe size={18} />, t('International Shipping (FedEx)'))}
        {renderTab('local', <MapPin size={18} />, t('Local Shipping'))}
        {renderTab('tracking', <PackageSearch size={18} />, t('Active Tracking'), activeTrackings.length)}
      </div>

      {/* International / Local Tab Content */}
      {(activeTab === 'international' || activeTab === 'local') && (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

          {/* API Settings Card */}
          <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
            <div style={{ background: colors.bean, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: colors.latte, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeTab === 'international' ? <Globe size={20} color={colors.crema} /> : <MapPin size={20} color={colors.crema} />}
                {activeTab === 'international' ? t('FedEx Integration') : t('Local Courier Integration')}
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('API Key')}</label>
                <input type="password" defaultValue="************************" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.latte, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('Account ID / Secret')}</label>
                <input type="password" defaultValue="************************" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.latte, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px' }}>
                <CheckCircle size={18} /> {t('API Connected & Authorized')}
              </div>
            </div>
          </div>

          {/* Pending Shipments Table */}
          <div style={{ flex: '2 1 600px' }}>
            <div className="table-wrapper" style={{ backgroundColor: colors.bean, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}`, flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ margin: 0, color: colors.latte, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={20} color={colors.crema} /> {t('Pending Orders for Dispatch')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: colors.input, padding: '10px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                  <Search size={16} color="var(--text-secondary)" />
                  <input
                    type="text"
                    placeholder={t('Search order # or name...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'none', border: 'none', color: colors.latte, outline: 'none', fontSize: '0.9rem', minWidth: '160px' }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--cream-dark)', borderBottom: `1px solid ${colors.border}` }}>
                      <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Order ID')}</th>
                      <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Customer & Destination')}</th>
                      <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Date')}</th>
                      <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center' }}>{t('Action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingShipments.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          <Inbox size={32} style={{ display: 'block', margin: '0 auto 10px' }} />
                          {t('No pending orders')}
                        </td>
                      </tr>
                    ) : pendingShipments.map((shipment, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s' }} className="premium-row">
                        <td style={{ padding: '20px 25px', fontWeight: 'bold', color: colors.crema, direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{shipment.id}</td>
                        <td style={{ padding: '20px 25px' }}>
                          <div style={{ color: colors.latte, fontWeight: 'bold' }}>{shipment.customer}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{shipment.destination}</div>
                        </td>
                        <td style={{ padding: '20px 25px', color: 'var(--text-secondary)', fontSize: '0.9rem', direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{shipment.date}</td>
                        <td style={{ padding: '20px 25px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleCreateWaybill(shipment)}
                            disabled={processedOrders.includes(shipment.id) || loadingWaybill === shipment.id}
                            style={{
                              background: processedOrders.includes(shipment.id) ? 'rgba(16, 185, 129, 0.1)' : colors.crema,
                              color: processedOrders.includes(shipment.id) ? '#10b981' : '#111',
                              border: 'none', padding: '8px 16px', borderRadius: '8px',
                              fontWeight: 'bold',
                              cursor: (processedOrders.includes(shipment.id) || loadingWaybill === shipment.id) ? 'not-allowed' : 'pointer',
                              fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px',
                              transition: 'all 0.3s ease', whiteSpace: 'nowrap'
                            }}
                          >
                            {loadingWaybill === shipment.id ? (
                              <Loader2 size={16} className="spin-animation" />
                            ) : processedOrders.includes(shipment.id) ? (
                              <CheckCircle size={16} />
                            ) : null}
                            {processedOrders.includes(shipment.id) ? t('Created') : t('Create Waybill')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="table-wrapper" style={{ backgroundColor: colors.bean, borderRadius: '20px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '25px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, color: colors.latte, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color={colors.crema} /> {t('Active Shipments')}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {activeTrackings.length} {t('shipment(s) active')}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--cream-dark)', borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Tracking Number')}</th>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Order ID')}</th>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Customer & Destination')}</th>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Courier')}</th>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Status')}</th>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Est. Delivery')}</th>
                </tr>
              </thead>
              <tbody>
                {activeTrackings.map((track, idx) => {
                  const s = getStatusStyle(track.status);
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}` }} className="premium-row">
                      <td style={{ padding: '20px 25px', fontWeight: 'bold', color: colors.crema, direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {track.trackingId}
                          <ExternalLink
                            size={14}
                            style={{ cursor: 'pointer', opacity: 0.6 }}
                            onClick={() => {
                              const url = track.isLocal
                                ? `https://www.track-trace.com/post`
                                : `https://www.fedex.com/fedextrack/?trknbr=${track.trackingId.replace('FDX-', '')}`;
                              window.open(url, '_blank');
                            }}
                          />
                        </span>
                      </td>
                      <td style={{ padding: '20px 25px', color: colors.latte, direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{track.orderId}</td>
                      <td style={{ padding: '20px 25px' }}>
                        <div style={{ color: colors.latte, fontWeight: 'bold' }}>{track.customer}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{track.destination}</div>
                      </td>
                      <td style={{ padding: '20px 25px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: colors.latte }}>
                          {track.isLocal ? <MapPin size={14} color={colors.crema} /> : <Globe size={14} color={colors.crema} />}
                          {track.company}
                        </span>
                      </td>
                      <td style={{ padding: '20px 25px' }}>
                        <span style={{ background: s.bg, color: s.color, padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {t(track.status)}
                        </span>
                      </td>
                      <td style={{ padding: '20px 25px', color: 'var(--text-secondary)', direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{track.expected}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .premium-row:hover {
          background-color: var(--cream-dark) !important;
          transform: translateY(-1px);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Delivery;
