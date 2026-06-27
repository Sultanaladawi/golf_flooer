import React, { useState } from 'react';
import { Truck, Globe, MapPin, Package, Clock, ExternalLink, Search, CheckCircle, PackageSearch } from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

const Delivery = () => {
  const { t, adminLang } = useAdminLang();
  const [activeTab, setActiveTab] = useState('international');
  const [searchTerm, setSearchTerm] = useState('');

  const colors = {
    espresso: 'var(--admin-bg)',
    bean: 'var(--admin-card)',
    crema: 'var(--admin-accent)',
    latte: 'var(--admin-text)',
    border: 'var(--admin-border)',
    input: 'var(--admin-input, rgba(0,0,0,0.06))'
  };

  const headerTextStyle = { color: colors.latte, fontSize: '2.2rem', fontFamily: "'DM Serif Display', serif", fontWeight: 700 };

  // Mock data for demonstration purposes
  const allPendingShipments = [
    { id: '#ORD-9912', customer: 'Sarah Ahmed', destination: 'Dubai, UAE', items: 2, amount: 'JOD 150.00', date: '2026-06-25', isLocal: false },
    { id: '#ORD-9915', customer: 'John Smith', destination: 'London, UK', items: 1, amount: 'JOD 85.00', date: '2026-06-26', isLocal: false },
    { id: '#ORD-9918', customer: 'Fahad Al-Saud', destination: 'Riyadh, KSA', items: 4, amount: 'JOD 320.00', date: '2026-06-27', isLocal: false },
    { id: '#ORD-9920', customer: 'Ali Hassan', destination: 'Amman, JO', items: 3, amount: 'JOD 210.00', date: '2026-06-27', isLocal: true },
    { id: '#ORD-9922', customer: 'Omar Zaid', destination: 'Irbid, JO', items: 1, amount: 'JOD 45.00', date: '2026-06-27', isLocal: true },
  ];

  const pendingShipments = allPendingShipments.filter(shipment => 
    activeTab === 'local' ? shipment.isLocal : !shipment.isLocal
  );

  const activeTrackings = [
    { id: 'FDX-77492011', orderId: '#ORD-9880', company: 'FedEx', status: 'In Transit', expected: '2026-06-30' },
    { id: 'LCL-002194', orderId: '#ORD-9892', company: 'Local Express', status: 'Out for Delivery', expected: '2026-06-27' },
  ];

  const renderTab = (id, icon, label) => (
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
        boxShadow: activeTab === id ? '0 5px 15px rgba(196,164,132,0.3)' : 'none'
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="dashboard-fade-in" style={{ paddingBottom: '80px', maxWidth: '1500px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.8rem', color: colors.crema, lineHeight: 1, marginBottom: '20px' }}>
            <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>
          </div>

          <div style={{ 
            background: 'rgba(196, 164, 132, 0.05)', 
            border: '1px solid rgba(196, 164, 132, 0.2)', 
            padding: '12px 25px', 
            borderRadius: '18px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <Truck size={28} color={colors.crema} />
            <span style={{ 
              fontFamily: "'Inter', sans-serif", 
              fontSize: '1.8rem', 
              fontWeight: '900', 
              color: 'var(--admin-text)', 
              letterSpacing: '-0.5px' 
            }}>
              {t('Delivery & Shipping')}
            </span>
          </div>
          
          <p style={{ margin: '5px 0 0 5px', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '500', direction: 'auto' }}>
            {t('Manage API integrations, track active shipments, and process orders for delivery.')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        {renderTab('international', <Globe size={18} />, t('International Shipping (FedEx)'))}
        {renderTab('local', <MapPin size={18} />, t('Local Shipping'))}
        {renderTab('tracking', <PackageSearch size={18} />, t('Active Tracking'))}
      </div>

      {/* Main Content Area */}
      {(activeTab === 'international' || activeTab === 'local') && (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* Settings/API Card */}
          <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
            <div style={{ background: colors.bean, borderRadius: '20px', border: `1px solid ${colors.border}`, padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: colors.latte, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeTab === 'international' ? <Globe size={20} color={colors.crema} /> : <MapPin size={20} color={colors.crema} />}
                {activeTab === 'international' ? t('FedEx Integration') : t('Local Courier Integration')}
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>API Key</label>
                <input type="password" value="************************" readOnly style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.latte, outline: 'none' }} />
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Account ID / Secret</label>
                <input type="password" value="************************" readOnly style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: colors.input, color: colors.latte, outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px' }}>
                <CheckCircle size={18} /> {t('API Connected & Authorized')}
              </div>
            </div>
          </div>

          {/* Pending Shipments Table */}
          <div style={{ flex: '2 1 600px' }}>
            <div className="table-wrapper" style={{
              backgroundColor: colors.bean,
              borderRadius: '20px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}>
              <div style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}` }}>
                <h3 style={{ margin: 0, color: colors.latte, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={20} color={colors.crema} /> {t('Pending Orders for Dispatch')}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: colors.input, padding: '10px 20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                  <Search size={16} color="var(--text-secondary)" />
                  <input
                    type="text"
                    placeholder={t("Search order # or name...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'none', border: 'none', color: colors.latte, outline: 'none', fontSize: '0.9rem' }}
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
                    {pendingShipments.map((shipment, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}`, transition: '0.2s' }} className="premium-row">
                        <td style={{ padding: '20px 25px', fontWeight: 'bold', color: colors.crema, direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{shipment.id}</td>
                        <td style={{ padding: '20px 25px' }}>
                          <div style={{ color: colors.latte, fontWeight: 'bold' }}>{shipment.customer}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{shipment.destination}</div>
                        </td>
                        <td style={{ padding: '20px 25px', color: 'var(--text-secondary)', fontSize: '0.9rem', direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{shipment.date}</td>
                        <td style={{ padding: '20px 25px', textAlign: 'center' }}>
                          <button style={{
                            background: colors.crema,
                            color: '#111',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}>
                            {t('Create Waybill')}
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
        <div className="table-wrapper" style={{
          backgroundColor: colors.bean,
          borderRadius: '20px',
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
        }}>
          <div style={{ padding: '25px', borderBottom: `1px solid ${colors.border}` }}>
            <h3 style={{ margin: 0, color: colors.latte, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color={colors.crema} /> {t('Active Shipments')}
            </h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--cream-dark)', borderBottom: `1px solid ${colors.border}` }}>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Tracking Number')}</th>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Order ID')}</th>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Courier')}</th>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Status')}</th>
                  <th style={{ padding: '15px 25px', color: colors.latte, fontSize: '0.8rem', fontWeight: 'bold' }}>{t('Est. Delivery')}</th>
                </tr>
              </thead>
              <tbody>
                {activeTrackings.map((track, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}` }} className="premium-row">
                    <td style={{ padding: '20px 25px', fontWeight: 'bold', color: colors.crema, display: 'flex', alignItems: 'center', gap: '10px', direction: 'ltr' }}>
                      {track.id} <ExternalLink size={14} style={{ cursor: 'pointer', opacity: 0.7 }} />
                    </td>
                    <td style={{ padding: '20px 25px', color: colors.latte, direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{track.orderId}</td>
                    <td style={{ padding: '20px 25px', color: colors.latte }}>{track.company}</td>
                    <td style={{ padding: '20px 25px' }}>
                      <span style={{ 
                        background: track.status === 'In Transit' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                        color: track.status === 'In Transit' ? '#3b82f6' : '#10b981', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold' 
                      }}>
                        {t(track.status)}
                      </span>
                    </td>
                    <td style={{ padding: '20px 25px', color: 'var(--text-secondary)', direction: 'ltr', textAlign: adminLang === 'ar' ? 'right' : 'left' }}>{track.expected}</td>
                  </tr>
                ))}
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
      `}</style>
    </div>
  );
};

export default Delivery;
