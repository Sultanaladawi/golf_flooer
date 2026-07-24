import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminLang } from '../AdminLangContext';
import { Crown, Download, RefreshCw, Phone, ShoppingBag, Star, Clock } from 'lucide-react';

// ── Rank badge helper ─────────────────────────────────────────────────────────
const RankBadge = ({ rank }) => {
  const medals = {
    1: { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', label: '🥇', shadow: 'rgba(255,215,0,0.5)' },
    2: { bg: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)', label: '🥈', shadow: 'rgba(192,192,192,0.5)' },
    3: { bg: 'linear-gradient(135deg, #CD7F32, #8B4513)', label: '🥉', shadow: 'rgba(205,127,50,0.5)' },
  };
  const medal = medals[rank];
  if (medal) {
    return (
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: medal.bg,
        boxShadow: `0 0 14px ${medal.shadow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', flexShrink: 0
      }}>
        {medal.label}
      </div>
    );
  }
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      background: 'rgba(196,164,132,0.1)',
      border: '1px solid var(--admin-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.85rem', fontWeight: '700', color: 'var(--admin-text)',
      flexShrink: 0
    }}>
      #{rank}
    </div>
  );
};

// ── Format helpers ────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

// ── Main component ────────────────────────────────────────────────────────────
const VIPCustomers = () => {
  const { t, lang } = useAdminLang();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/vip-customers');
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = customers.filter(c =>
    !search ||
    c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(196, 164, 132);
      doc.text('Zahrat Beesan - VIP Customers', 148, 18, { align: 'center' });

      // Date line
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(new Date().toLocaleDateString('en-GB'), 148, 25, { align: 'center' });

      // Table headers
      const headers = ['Rank', 'Customer Name', 'Phone', 'Orders', 'Total Spent (SAR)', 'Points', 'Last Order'];
      const colWidths = [18, 60, 40, 20, 45, 25, 42];
      let x = 10;
      let y = 35;

      doc.setFillColor(40, 40, 40);
      doc.rect(10, y - 5, 270, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(196, 164, 132);
      headers.forEach((h, i) => {
        doc.text(h, x + 2, y + 1);
        x += colWidths[i];
      });

      // Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      filtered.forEach((c, idx) => {
        y += 10;
        if (y > 190) { doc.addPage(); y = 20; }
        const shade = idx % 2 === 0 ? 28 : 35;
        doc.setFillColor(shade, shade, shade);
        doc.rect(10, y - 5, 270, 10, 'F');
        doc.setTextColor(220, 220, 220);
        const row = [
          `#${idx + 1}`,
          c.customer_name || '—',
          c.phone || '—',
          String(c.total_orders || 0),
          fmt(c.total_spent),
          String(c.loyalty_points || 0),
          fmtDate(c.last_order),
        ];
        x = 10;
        row.forEach((val, i) => {
          doc.text(String(val), x + 2, y + 1);
          x += colWidths[i];
        });
      });

      doc.save(`VIP-Customers-${Date.now()}.pdf`);
    } catch (e) {
      console.error('PDF export failed:', e);
    }
  };

  // ── Summary stats ───────────────────────────────────────────────────────────
  const totalSpent  = customers.reduce((s, c) => s + Number(c.total_spent || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + Number(c.total_orders || 0), 0);
  const avgSpent    = customers.length ? totalSpent / customers.length : 0;

  // ── Row highlight ───────────────────────────────────────────────────────────
  const rowBg = (rank) => {
    if (rank === 1) return 'rgba(255,215,0,0.07)';
    if (rank === 2) return 'rgba(192,192,192,0.06)';
    if (rank === 3) return 'rgba(205,127,50,0.06)';
    return 'transparent';
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: "'Inter', sans-serif", color: 'var(--admin-text)' }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '28px', flexWrap: 'wrap', gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--admin-accent), #a47c4f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(196,164,132,0.3)'
          }}>
            <Crown size={24} color="var(--admin-bg)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', color: 'var(--admin-text)' }}>
              {t('VIP Customers') || 'عملاء VIP'}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-accent)', opacity: 0.8 }}>
              {t('Top spenders leaderboard') || 'قائمة أكثر العملاء إنفاقاً'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchData}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              backgroundColor: 'rgba(196,164,132,0.12)', border: '1px solid var(--admin-accent)',
              color: 'var(--admin-accent)', padding: '9px 18px', borderRadius: '10px',
              cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: '0.2s'
            }}
          >
            <RefreshCw size={15} /> {t('Refresh') || 'تحديث'}
          </button>
          <button
            onClick={handleExportPDF}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'linear-gradient(135deg, var(--admin-accent), #a47c4f)',
              border: 'none', color: 'var(--admin-bg)', padding: '9px 18px', borderRadius: '10px',
              cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
              boxShadow: '0 4px 15px rgba(196,164,132,0.3)', transition: '0.2s'
            }}
          >
            <Download size={15} /> {t('Export PDF') || 'تصدير PDF'}
          </button>
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '28px'
      }}>
        {[
          {
            icon: <Crown size={20} />,
            label: t('Total VIP Customers') || 'إجمالي عملاء VIP',
            value: customers.length,
          },
          {
            icon: <ShoppingBag size={20} />,
            label: t('Total Orders') || 'إجمالي الطلبات',
            value: totalOrders.toLocaleString(),
          },
          {
            icon: <Star size={20} />,
            label: t('Total Revenue (SAR)') || 'إجمالي الإيرادات (ر.س)',
            value: fmt(totalSpent),
          },
          {
            icon: <Clock size={20} />,
            label: t('Avg. Spent per Customer') || 'متوسط الإنفاق',
            value: fmt(avgSpent),
          },
        ].map((card, i) => (
          <div key={i} style={{
            backgroundColor: 'var(--admin-card)', borderRadius: '16px', padding: '20px',
            border: '1px solid var(--admin-border)',
            display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              backgroundColor: 'rgba(196,164,132,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--admin-accent)', flexShrink: 0
            }}>{card.icon}</div>
            <div>
              <p style={{
                margin: 0, fontSize: '0.72rem',
                color: 'var(--admin-accent)', opacity: 0.7, marginBottom: '4px'
              }}>{card.label}</p>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--admin-text)' }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder={t('Search by name or phone...') || 'ابحث بالاسم أو رقم الهاتف...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: '380px', padding: '10px 16px',
            backgroundColor: 'var(--admin-card)',
            border: '1px solid var(--admin-border)',
            borderRadius: '10px', color: 'var(--admin-text)',
            fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
          }}
        />
      </div>

      {/* ── Leaderboard Table ─────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--admin-accent)', fontSize: '1rem' }}>
          ⏳ {t('Loading...') || 'جارٍ التحميل...'}
        </div>
      ) : error ? (
        <div style={{
          backgroundColor: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)',
          borderRadius: '12px', padding: '20px', color: '#ff7777', textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--admin-card)', borderRadius: '18px',
          border: '1px solid var(--admin-border)', overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(196,164,132,0.08)' }}>
                  {[
                    t('Rank') || 'الترتيب',
                    t('Customer') || 'العميل',
                    t('Phone') || 'الهاتف',
                    t('Orders') || 'الطلبات',
                    t('Total Spent') || 'إجمالي الإنفاق',
                    t('Loyalty Points') || 'نقاط الولاء',
                    t('Last Order') || 'آخر طلب',
                  ].map((h, i) => (
                    <th key={i} style={{
                      padding: '14px 16px',
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      fontSize: '0.75rem', fontWeight: '700',
                      color: 'var(--admin-accent)',
                      textTransform: 'uppercase', letterSpacing: '1px',
                      borderBottom: '1px solid var(--admin-border)',
                      whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{
                      padding: '50px', textAlign: 'center',
                      color: 'var(--admin-accent)', opacity: 0.5
                    }}>
                      {t('No customers found') || 'لا يوجد عملاء'}
                    </td>
                  </tr>
                ) : filtered.map((c, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr
                      key={c.phone || idx}
                      style={{
                        backgroundColor: rowBg(rank),
                        borderBottom: '1px solid var(--admin-border)',
                        transition: 'background 0.2s'
                      }}
                    >
                      {/* Rank badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: lang === 'ar' ? 'flex-end' : 'flex-start' }}>
                          <RankBadge rank={rank} />
                        </div>
                      </td>

                      {/* Customer name */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{
                          fontWeight: rank <= 3 ? '700' : '500',
                          fontSize: '0.9rem',
                          color: rank <= 3 ? 'var(--admin-accent)' : 'var(--admin-text)'
                        }}>
                          {c.customer_name || '—'}
                        </div>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '0.85rem', color: 'var(--admin-text)', opacity: 0.8,
                          direction: 'ltr'
                        }}>
                          <Phone size={13} style={{ opacity: 0.6 }} />
                          {c.phone || '—'}
                        </div>
                      </td>

                      {/* Total orders */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          backgroundColor: 'rgba(196,164,132,0.12)',
                          color: 'var(--admin-accent)',
                          padding: '3px 10px', borderRadius: '20px',
                          fontSize: '0.8rem', fontWeight: '700'
                        }}>
                          {c.total_orders || 0}
                        </span>
                      </td>

                      {/* Total spent */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '0.95rem', fontWeight: '800',
                          color: rank <= 3 ? 'var(--admin-accent)' : 'var(--admin-text)'
                        }}>
                          {fmt(c.total_spent)}{' '}
                          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>ر.س</span>
                        </span>
                      </td>

                      {/* Loyalty points */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: 'var(--admin-text)' }}>
                          <Star size={13} color="#FFD700" fill="#FFD700" />
                          {Number(c.loyalty_points || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Last order date */}
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--admin-text)', opacity: 0.7, whiteSpace: 'nowrap' }}>
                        {fmtDate(c.last_order)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer count */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--admin-border)',
            fontSize: '0.78rem', color: 'var(--admin-accent)', opacity: 0.7,
            textAlign: lang === 'ar' ? 'right' : 'left'
          }}>
            {t('Showing') || 'عرض'} {filtered.length} {t('of') || 'من'} {customers.length} {t('customers') || 'عميل'}
          </div>
        </div>
      )}
    </div>
  );
};

export default VIPCustomers;
