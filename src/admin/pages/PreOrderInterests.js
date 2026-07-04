import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, ShoppingBag, Calendar, Search, Trash2, 
  Sparkles, Download, CheckCircle2, AlertCircle, PhoneCall 
} from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

const PreOrderInterests = () => {
  const { t } = useAdminLang();
  const [interests, setInterests] = useState([]);
  const [filteredInterests, setFilteredInterests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const colors = {
    bg: 'var(--admin-bg)',
    card: 'var(--admin-card)',
    primary: 'var(--admin-accent)',
    border: 'var(--admin-border)',
    text: 'var(--admin-text)',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    success: '#38ef7d',
    warning: '#ffb300',
    danger: '#ff4d4d'
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/pre-order/interests');
      const data = Array.isArray(res.data) ? res.data : [];
      setInterests(data);
      setFilteredInterests(data);
    } catch (err) {
      console.error(err);
      showToast(t('Failed to fetch interests'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFilteredInterests(interests);
    } else {
      const filtered = interests.filter(item => 
        (item.customer_name || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q) ||
        (item.product_name || '').toLowerCase().includes(q)
      );
      setFilteredInterests(filtered);
    }
  }, [search, interests]);

  const handleExportCSV = () => {
    if (interests.length === 0) {
      showToast(t('No interests to export'), 'warning');
      return;
    }
    const headers = ['Product', 'Customer Name', 'Phone', 'Email', 'Date'];
    const rows = interests.map(i => [
      i.product_name,
      i.customer_name,
      i.phone,
      i.email || '',
      new Date(i.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `pre_order_interests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('Interests exported successfully'));
  };

  // Metrics
  const distinctProductsCount = new Set(interests.map(i => i.product_id)).size;
  const latestInterest = interests.length > 0 ? interests[0] : null;

  return (
    <div className="dashboard-fade-in" style={{ padding: '40px', minHeight: '100vh', color: colors.text, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 10000,
          backgroundColor: notification.type === 'error' ? colors.danger : colors.success,
          color: '#1a0e05', padding: '12px 24px', borderRadius: '12px',
          fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)', animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} />
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.8rem', lineHeight: 1, marginBottom: '8px' }}>
            <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: colors.primary, margin: '0 0 8px', lineHeight: 1 }}>
            {t('Pre-Order Interests')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
            {t('View and manage customer interest lists for abayas coming soon.')}
          </p>
        </div>

        <button 
          onClick={handleExportCSV}
          style={{
            padding: '12px 20px', borderRadius: '12px', background: colors.primary,
            color: '#1a0e05', border: 'none', fontWeight: '800', fontSize: '0.82rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 15px rgba(197,168,128,0.2)'
          }}
        >
          <Download size={15} />
          {t('Export CSV')}
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: `${colors.primary}18`, color: colors.primary, padding: '14px', borderRadius: '16px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('Total Submissions')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{interests.length}</div>
          </div>
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(56,239,125,0.08)', color: colors.success, padding: '14px', borderRadius: '16px' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('Pre-Order Products')}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{distinctProductsCount}</div>
          </div>
        </div>

        <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,179,0,0.08)', color: colors.warning, padding: '14px', borderRadius: '16px' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('Latest Interest')}</div>
            <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#fff', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
              {latestInterest ? latestInterest.customer_name : t('None')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Box */}
      <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: '24px', padding: '28px' }}>
        
        {/* Search Input */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>{t('Interested Customers')}</h3>
          
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('Search by customer, phone or product')}
              style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: colors.inputBg, color: '#fff', fontSize: '0.82rem', outline: 'none' }}
            />
          </div>
        </div>

        {/* Table layout */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Product')}</th>
                <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Customer Name')}</th>
                <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Phone Number')}</th>
                <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Email Address')}</th>
                <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('Submitted Date')}</th>
                <th style={{ padding: '14px 10px', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>{t('Contact')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('Loading...')}</td>
                </tr>
              ) : filteredInterests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{t('No interests registered yet.')}</td>
                </tr>
              ) : (
                filteredInterests.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: idx < filteredInterests.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                    <td style={{ padding: '16px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.image_url && (
                          <img src={item.image_url} alt="" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                        )}
                        <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>{item.product_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 10px', fontWeight: '700', fontSize: '0.88rem' }}>{item.customer_name}</td>
                    <td style={{ padding: '16px 10px', fontSize: '0.82rem', fontFamily: 'monospace' }} dir="ltr">{item.phone}</td>
                    <td style={{ padding: '16px 10px', fontSize: '0.82rem', color: colors.latte }}>{item.email || '-'}</td>
                    <td style={{ padding: '16px 10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                    </td>
                    <td style={{ padding: '16px 10px', textAlign: 'center' }}>
                      <a 
                        href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: colors.success, fontSize: '0.78rem', fontWeight: '800', textDecoration: 'none', padding: '6px 12px', border: `1px solid ${colors.success}33`, borderRadius: '8px', background: 'rgba(56,239,125,0.02)' }}
                      >
                        <PhoneCall size={12} />
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreOrderInterests;


