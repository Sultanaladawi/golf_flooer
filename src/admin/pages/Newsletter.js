import React, { useState, useEffect } from 'react';
import { useAdminLang } from '../AdminLangContext';
import axios from 'axios';
import { Mail, Search, Trash2, Calendar, Download, CheckCircle2, X, Globe, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Newsletter = () => {
  const { t } = useAdminLang();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  const colors = {
    bg: 'var(--admin-bg)',
    card: 'var(--admin-card)',
    primary: 'var(--admin-accent)',
    border: 'var(--admin-border)',
    text: 'var(--admin-text)',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    success: '#38ef7d',
    danger: '#ff4d4d'
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/newsletter');
      setSubscribers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("API Error fetching newsletter subs:", err);
      showToast(t("Failed to fetch subscribers"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm(t("Are you sure you want to remove this subscriber?"))) {
      try {
        await axios.delete(`/api/newsletter/${id}`);
        showToast(t("Subscriber removed"), "success");
        fetchSubscribers();
      } catch (err) {
        console.error("Delete subscriber error:", err);
        showToast(t("Failed to remove subscriber"), "error");
      }
    }
  };

  const exportPDF = async () => {
    try {
      if (subscribers.length === 0) {
        alert(t("No subscribers to export."));
        return;
      }

      await axios.post('/api/log-action', {
        action: 'Export PDF',
        details: 'Administrator exported newsletter subscriptions to PDF.'
      });

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(45, 41, 38);
      doc.text('Zahrat Beesan - Newsletter Subscribers', 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Amman' })}`, 14, 32);
      doc.text(`Total Subscribers: ${subscribers.length}`, 14, 38);

      const tableColumn = ["Email Address", "Name", "Country", "Subscription Date", "Status"];
      const tableRows = subscribers.map(s => [
        s.email,
        s.name || 'Anonymous',
        s.country || 'Jordan',
        s.subscribedAt ? new Date(s.subscribedAt).toLocaleString('en-GB', { timeZone: 'Asia/Amman' }) : 'N/A',
        s.isActive ? 'Active' : 'Inactive'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [196, 164, 132], textColor: [255, 255, 255] }
      });
      doc.save(`Zahrat Beesan_Subscribers_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert(t("Error generating PDF: ") + error.message);
    }
  };

  // Filter subscribers based on search query
  const filteredSubscribers = subscribers.filter(s => {
    const term = searchQuery.toLowerCase();
    return (
      (s.email || '').toLowerCase().includes(term) ||
      (s.name || '').toLowerCase().includes(term) ||
      (s.country || '').toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ color: colors.text, backgroundColor: colors.bg, minHeight: '100vh', padding: '30px', position: 'relative' }}>
      
      {/* Background Orbs */}
      
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <style>{`
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.15; animation: float 25s infinite alternate ease-in-out; }
        .orb-1 { width: 600px; height: 600px; background: ${colors.primary}; top: -200px; right: -100px; }
        .orb-2 { width: 500px; height: 500px; background: var(--admin-border); bottom: -100px; left: -100px; }
        @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.1); } }
        .page-badge { background: var(--admin-card); border: 1px solid ${colors.border}; padding: 12px 25px; border-radius: 18px; display: inline-flex; align-items: center; gap: 12px; margin: 20px 0; }
        .page-badge span { font-family: 'Inter', sans-serif; font-size: 2rem; font-weight: 900; color: var(--admin-text); letter-spacing: -0.5px; }
        .search-container {
          position: relative;
          width: 320px;
        }
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border-radius: 12px;
          background-color: var(--admin-input, rgba(0,0,0,0.06));
          border: 1px solid ${colors.border};
          color: var(--admin-text);
          font-size: 0.9rem;
          outline: none;
          transition: 0.3s;
        }
        .search-input:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 10px rgba(196,164,132,0.15);
        }
        .table-wrapper {
          background-color: ${colors.card};
          border-radius: 20px;
          border: 1px solid ${colors.border};
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .premium-row {
          transition: all 0.3s ease;
        }
        .premium-row:hover {
          background-color: rgba(196, 164, 132, 0.06);
        }
      `}</style>

      {/* Toast Alert */}
      {notification && (
        <div className={`premium-toast ${notification.type}`} style={{ zIndex: 4000, position: 'relative' }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.8rem', color: colors.primary, lineHeight: 1 }}>
            <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>
          </div>
          <div className="page-badge">
            <Mail size={28} color={colors.primary} />
            <span>{t("Newsletter Subscribers")}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, marginTop: '5px' }}>
            {t("Audience database subscribing to updates, coupon distributions, and collection releases.")}
          </p>
        </div>
        <div>
          <button onClick={exportPDF} style={{ backgroundColor: colors.primary, color: '#000', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px rgba(196, 164, 132, 0.2)' }}>
            <Download size={20} /> {t("Export Subscribers List")}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-container">
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', insetInlineStart: '15px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" className="search-input" placeholder={t("Search by email, name or country...")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {t("Showing")} <b>{filteredSubscribers.length}</b> {t("of")} <b>{subscribers.length}</b> {t("subscribers")}
        </div>
      </div>

      {/* Table List */}
      <div className="table-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: colors.primary }}>
            {t("Loading subscriber data...")}
          </div>
        ) : (
          <table width="100%" style={{ borderCollapse: 'collapse', color: colors.text }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--cream-dark)', borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '20px', textAlign: 'start', fontSize: '0.8rem', letterSpacing: '1px', color: colors.text, fontWeight: '700' }}>{t("Email Address")}</th>
                <th style={{ padding: '20px', textAlign: 'start', fontSize: '0.8rem', letterSpacing: '1px', color: colors.text, fontWeight: '700' }}>{t("Subscriber Name")}</th>
                <th style={{ padding: '20px', textAlign: 'start', fontSize: '0.8rem', letterSpacing: '1px', color: colors.text, fontWeight: '700' }}>{t("Country")}</th>
                <th style={{ padding: '20px', textAlign: 'start', fontSize: '0.8rem', letterSpacing: '1px', color: colors.text, fontWeight: '700' }}>{t("Date & Time")}</th>
                <th style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', letterSpacing: '1px', color: colors.text, fontWeight: '700' }}>{t("Status")}</th>
                <th style={{ padding: '20px', textAlign: 'center', fontSize: '0.8rem', letterSpacing: '1px', color: colors.text, fontWeight: '700' }}>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length > 0 ? filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="premium-row" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '20px', fontWeight: 'bold', color: 'var(--admin-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color={colors.primary} />
                      {sub.email}
                    </div>
                  </td>
                  <td style={{ padding: '20px', color: colors.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} color="rgba(100,100,100,0.6)" />
                      {sub.name || <span style={{ color: 'rgba(100,100,100,0.4)', fontStyle: 'italic' }}>{t("Anonymous")}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '20px', color: colors.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={14} color="rgba(100,100,100,0.6)" />
                      {sub.country || 'Jordan'}
                    </div>
                  </td>
                  <td style={{ padding: '20px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="rgba(100,100,100,0.6)" />
                      {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString('en-GB', { timeZone: 'Asia/Amman' }) : 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: sub.isActive ? 'rgba(56, 239, 125, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                      color: sub.isActive ? colors.success : colors.danger,
                      border: `1px solid ${sub.isActive ? 'rgba(56, 239, 125, 0.3)' : 'rgba(255, 77, 77, 0.3)'}`
                    }}>
                      {sub.isActive ? t("SUBSCRIBED") : t("UNSUBSCRIBED")}
                    </span>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(sub.id)} style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer', transition: '0.2s' }} title={t("Remove subscriber")}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {t("No subscribers found matching search criteria.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Newsletter;


