import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Search, Trash2, Calendar, Download, CheckCircle2, X, Globe, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Newsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  const colors = {
    bg: '#070504',
    card: 'rgba(255, 255, 255, 0.02)',
    primary: '#c4a484',
    border: 'rgba(196, 164, 132, 0.15)',
    text: '#e6d5c3',
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
      showToast("Failed to fetch subscribers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this subscriber?")) {
      try {
        await axios.delete(`/api/newsletter/${id}`);
        showToast("Subscriber removed", "success");
        fetchSubscribers();
      } catch (err) {
        console.error("Delete subscriber error:", err);
        showToast("Failed to remove subscriber", "error");
      }
    }
  };

  const exportPDF = async () => {
    try {
      if (subscribers.length === 0) {
        alert("No subscribers to export.");
        return;
      }

      await axios.post('/api/log-action', {
        action: 'Export PDF',
        details: 'Administrator exported newsletter subscriptions to PDF.'
      });

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(45, 41, 38);
      doc.text('Yafa Online - Newsletter Subscribers', 14, 22);
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
      doc.save(`Yafa_Online_Subscribers_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Error generating PDF: " + error.message);
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
      <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(circle at 50% -20%, #2a1b10 0%, #070504 70%)`, zIndex: 0, pointerEvents: 'none' }} />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <style>{`
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.05; animation: float 25s infinite alternate ease-in-out; }
        .orb-1 { width: 600px; height: 600px; background: ${colors.primary}; top: -200px; right: -100px; }
        .orb-2 { width: 500px; height: 500px; background: #2a1b10; bottom: -100px; left: -100px; }
        @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.1); } }
        .page-badge { background: #1b130e; border: 1px solid ${colors.border}; padding: 12px 25px; border-radius: 18px; display: inline-flex; align-items: center; gap: 12px; margin: 20px 0; }
        .page-badge span { font-family: 'Inter', sans-serif; font-size: 2rem; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
        .search-container {
          position: relative;
          width: 320px;
        }
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border-radius: 12px;
          background-color: ${colors.inputBg};
          border: 1px solid ${colors.border};
          color: #fff;
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
            Yafa Online <span style={{ color: '#fff', fontStyle: 'italic' }}>يافا اونلاين</span>
          </div>
          <div className="page-badge">
            <Mail size={28} color={colors.primary} />
            <span>Newsletter Subscribers</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 500, marginTop: '5px' }}>
            Audience database subscribing to updates, coupon distributions, and collection releases.
          </p>
        </div>
        <div>
          <button onClick={exportPDF} style={{ backgroundColor: colors.primary, color: '#000', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 20px rgba(196, 164, 132, 0.2)' }}>
            <Download size={20} /> Export Subscribers List
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-container">
          <Search size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" className="search-input" placeholder="Search by email, name or country..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
          Showing <b>{filteredSubscribers.length}</b> of <b>{subscribers.length}</b> subscribers
        </div>
      </div>

      {/* Table List */}
      <div className="table-wrapper" style={{ position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: colors.primary }}>
            Loading subscriber data...
          </div>
        ) : (
          <table width="100%" style={{ borderCollapse: 'collapse', color: colors.text }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(45, 41, 38, 0.7)', borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', letterSpacing: '1px', color: colors.primary }}>EMAIL ADDRESS</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', letterSpacing: '1px', color: colors.primary }}>SUBSCRIBER NAME</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', letterSpacing: '1px', color: colors.primary }}>LOCATION (COUNTRY)</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.8rem', letterSpacing: '1px', color: colors.primary }}>DATE & TIME</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.8rem', letterSpacing: '1px', color: colors.primary }}>STATUS</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.8rem', letterSpacing: '1px', color: colors.primary }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length > 0 ? filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="premium-row" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '18px 20px', fontWeight: 'bold', color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color={colors.primary} />
                      {sub.email}
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', color: colors.text }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={14} color="rgba(255,255,255,0.4)" />
                      {sub.name || <span style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Anonymous</span>}
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={14} color="rgba(255,255,255,0.4)" />
                      {sub.country || 'Jordan'}
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', color: 'rgba(255,255,255,0.6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="rgba(255,255,255,0.4)" />
                      {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString('en-GB', { timeZone: 'Asia/Amman' }) : 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: sub.isActive ? 'rgba(56, 239, 125, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                      color: sub.isActive ? colors.success : colors.danger,
                      border: `1px solid ${sub.isActive ? 'rgba(56, 239, 125, 0.3)' : 'rgba(255, 77, 77, 0.3)'}`
                    }}>
                      {sub.isActive ? 'SUBSCRIBED' : 'UNSUBSCRIBED'}
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(sub.id)} style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer', transition: '0.2s' }} title="Remove subscriber">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                    No subscribers found matching search criteria.
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
