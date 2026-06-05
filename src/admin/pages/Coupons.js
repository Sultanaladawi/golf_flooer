import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Plus, Trash2, Calendar, Sparkles, X, Edit2, Download, CheckCircle2, Ticket } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: '',
    minOrderJOD: 0,
    maxUses: '',
    expiresAt: '',
    isActive: 1
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const colors = {
    bg: '#070504',
    card: 'rgba(255, 255, 255, 0.02)',
    primary: '#c4a484',
    border: 'rgba(196, 164, 132, 0.15)',
    text: '#e6d5c3',
    inputBg: 'rgba(255, 255, 255, 0.04)',
    success: '#38ef7d',
    warning: '#ffb300',
    danger: '#ff4d4d'
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/coupons');
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("API Error fetching coupons:", err);
      showToast("Failed to fetch coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenModal = (mode, coupon = null) => {
    setModalMode(mode);
    if (mode === 'edit' && coupon) {
      setCurrentId(coupon.id);
      const formattedDate = coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '';
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percent',
        discountValue: coupon.discountValue || '',
        minOrderJOD: coupon.minOrderJOD || 0,
        maxUses: coupon.maxUses !== null ? coupon.maxUses : '',
        expiresAt: formattedDate,
        isActive: coupon.isActive ?? 1
      });
    } else {
      setFormData({
        code: '',
        description: '',
        discountType: 'percent',
        discountValue: '',
        minOrderJOD: 0,
        maxUses: '',
        expiresAt: '',
        isActive: 1
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minOrderJOD: parseFloat(formData.minOrderJOD) || 0,
        maxUses: formData.maxUses === '' ? null : parseInt(formData.maxUses, 10),
        expiresAt: formData.expiresAt === '' ? null : formData.expiresAt,
        isActive: parseInt(formData.isActive, 10)
      };

      if (modalMode === 'add') {
        await axios.post('/api/coupons', payload);
        showToast("Coupon created successfully", "success");
      } else {
        await axios.put(`/api/coupons/${currentId}`, payload);
        showToast("Coupon updated successfully", "success");
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      console.error("Submit coupon error:", err);
      showToast(err.response?.data?.error || "Failed to save coupon", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon? This action is permanent.")) {
      try {
        await axios.delete(`/api/coupons/${id}`);
        showToast("Coupon deleted", "success");
        fetchCoupons();
      } catch (err) {
        console.error("Delete coupon error:", err);
        showToast("Failed to delete coupon", "error");
      }
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      const updatedStatus = coupon.isActive ? 0 : 1;
      await axios.put(`/api/coupons/${coupon.id}`, {
        ...coupon,
        isActive: updatedStatus
      });
      showToast(`Coupon ${updatedStatus ? 'Activated' : 'Deactivated'}`, "success");
      fetchCoupons();
    } catch (err) {
      console.error("Toggle coupon status error:", err);
      showToast("Failed to update status", "error");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Expiry";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const exportPDF = async () => {
    try {
      if (coupons.length === 0) {
        alert("No coupons to export.");
        return;
      }

      await axios.post('/api/log-action', {
        action: 'Export PDF',
        details: 'Administrator exported coupons database to PDF.'
      });

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(45, 41, 38);
      doc.text('Yafa Online - Coupon Codes', 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Amman' })}`, 14, 32);
      
      const tableColumn = ["Code", "Discount", "Type", "Min Order", "Uses", "Expiry", "Status"];
      const tableRows = coupons.map(c => [
        c.code,
        c.discountType === 'percent' ? `${c.discountValue}%` : `JOD ${c.discountValue}`,
        c.discountType === 'percent' ? 'Percentage' : 'Fixed Amount',
        `JOD ${parseFloat(c.minOrderJOD).toFixed(2)}`,
        `${c.usedCount} / ${c.maxUses !== null ? c.maxUses : '∞'}`,
        formatDate(c.expiresAt),
        c.isActive ? 'Active' : 'Inactive'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [196, 164, 132], textColor: [255, 255, 255] }
      });
      doc.save(`Yafa_Online_Coupons_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Error generating PDF: " + error.message);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.border}`,
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    color: colors.primary,
    marginBottom: '6px',
    fontSize: '0.85rem',
    fontWeight: '600'
  };

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
        .coupon-card {
          background-color: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(196, 164, 132, 0.15);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .coupon-card:hover {
          background-color: rgba(196, 164, 132, 0.08);
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.5);
          border-color: rgba(196, 164, 132, 0.4);
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
            <Ticket size={28} color={colors.primary} />
            <span>Discount Coupons</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 500, marginTop: '5px' }}>
            Manage promotional coupon codes, thresholds, and activation status.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={exportPDF} style={{ backgroundColor: 'rgba(196, 164, 132, 0.1)', color: colors.primary, border: `1px solid ${colors.primary}`, padding: '14px 28px', borderRadius: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: '0.3s' }}>
            <Download size={20} /> Export PDF
          </button>
          <button onClick={() => handleOpenModal('add')} style={{ backgroundColor: colors.primary, color: '#000', border: 'none', padding: '14px 28px', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(196, 164, 132, 0.2)' }}>
            <Plus size={20} /> Add Coupon
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: '#0e0a08', width: '100%', maxWidth: '500px', borderRadius: '24px', border: `1px solid ${colors.border}`, padding: '35px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '25px', right: '25px', backgroundColor: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6 }}>
              <X size={24} />
            </button>
            <h2 style={{ color: '#fff', margin: '0 0 25px 0', fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem' }}>
              {modalMode === 'add' ? 'Create New Coupon' : 'Edit Coupon'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Coupon Code *</label>
                <input style={{...inputStyle, textTransform: 'uppercase'}} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. YAFA10" required />
              </div>

              <div>
                <label style={labelStyle}>Description / Note</label>
                <input style={inputStyle} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. 10% Off on Autumn abayas" />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Discount Type *</label>
                  <select style={inputStyle} value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed JOD</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Value *</label>
                  <input type="number" step="any" style={inputStyle} value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} placeholder="e.g. 10" required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Min Order (JOD)</label>
                  <input type="number" step="any" style={inputStyle} value={formData.minOrderJOD} onChange={e => setFormData({...formData, minOrderJOD: e.target.value})} placeholder="e.g. 30.00" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Max Uses</label>
                  <input type="number" style={inputStyle} value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: e.target.value})} placeholder="Leave blank for unlimited" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Expiration Date</label>
                  <input type="date" style={inputStyle} value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Status</label>
                  <select style={inputStyle} value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value})}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 2, padding: '14px', backgroundColor: colors.primary, color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {modalMode === 'add' ? 'Create Coupon' : 'Update Coupon'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '14px', backgroundColor: 'transparent', color: '#fff', border: `1px solid ${colors.border}`, borderRadius: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons List Grid */}
      {loading ? (
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '100px' }}>
          <p>Loading discount coupons...</p>
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {coupons.length > 0 ? coupons.map((c) => {
            const hasExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const limitReached = c.maxUses !== null && c.usedCount >= c.maxUses;
            
            return (
              <div key={c.id} className="coupon-card">
                
                {/* Actions */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleOpenModal('edit', c)} style={{ background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', opacity: 0.7 }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer', opacity: 0.7 }}>
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Badge Tag */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(196,164,132,0.1)', padding: '12px', borderRadius: '12px', height: 'fit-content' }}>
                    <Tag color={colors.primary} size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                      {c.code}
                    </h3>
                    <div style={{ color: colors.primary, fontSize: '0.95rem', fontWeight: 'bold', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Sparkles size={14} /> 
                      {c.discountType === 'percent' ? `${c.discountValue}% Off` : `JOD ${c.discountValue} Off`}
                    </div>
                  </div>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.88rem', minHeight: '38px', margin: '0 0 15px 0', lineHeight: '1.4' }}>
                  {c.description || 'No description provided.'}
                </p>

                {/* Status Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                  <span onClick={() => toggleCouponStatus(c)} style={{
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: c.isActive ? 'rgba(56, 239, 125, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                    color: c.isActive ? colors.success : colors.danger,
                    border: `1px solid ${c.isActive ? 'rgba(56, 239, 125, 0.3)' : 'rgba(255, 77, 77, 0.3)'}`
                  }}>
                    {c.isActive ? '● Active' : '○ Inactive'}
                  </span>
                  
                  {hasExpired && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(255, 77, 77, 0.15)', color: colors.danger, border: `1px solid rgba(255,77,77,0.3)` }}>
                      Expired
                    </span>
                  )}
                  {limitReached && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(255, 179, 0, 0.15)', color: colors.warning, border: `1px solid rgba(255,179,0,0.3)` }}>
                      Limit Reached
                    </span>
                  )}
                </div>

                {/* Statistics / Thresholds */}
                <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Usage Count:</span>
                    <strong style={{ color: '#fff' }}>{c.usedCount} / {c.maxUses !== null ? c.maxUses : '∞'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Min Order Threshold:</span>
                    <strong style={{ color: '#fff' }}>JOD {parseFloat(c.minOrderJOD).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> Expiry:</span>
                    <strong style={{ color: colors.primary }}>{formatDate(c.expiresAt)}</strong>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', backgroundColor: colors.card, borderRadius: '24px', border: `1px dashed ${colors.border}` }}>
              <Ticket size={48} color={colors.primary} style={{ opacity: 0.3, marginBottom: '15px' }} />
              <h3 style={{ color: colors.primary }}>No coupons found</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Click "Add Coupon" to create your first e-commerce discount code.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Coupons;
