import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Plus, Trash2, Calendar, Sparkles, X, Edit2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    discount_percent: '',
    reason: '',
    end_date: '',
    active: 1
  });

  const exportPDF = async () => {
    try {
      if (offers.length === 0) {
        alert('لا توجد عروض للتصدير.');
        return;
      }
      await axios.post('/api/log-action', {
        action: 'Export PDF',
        details: 'تم تصدير العروض التسويقية إلى PDF.'
      });

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(45, 41, 38);
      doc.text('يافا اونلاين - العروض التسويقية', 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`تاريخ الإنشاء: ${new Date().toLocaleString('ar-JO', { timeZone: 'Asia/Amman' })}`, 14, 32);
      doc.text('العروض النشطة حالياً والخصومات الموسمية.', 14, 38);

      const tableColumn = ['اسم المنتج', 'الخصم', 'الوصف', 'تاريخ الانتهاء'];
      const tableRows = offers.map(offer => [
        offer.product_name || 'N/A',
        `${offer.discount_percent}%`,
        offer.reason || 'لا يوجد وصف',
        offer.end_date
          ? new Date(offer.end_date).toLocaleDateString('ar-JO', { timeZone: 'Asia/Amman' })
          : 'بدون تاريخ انتهاء'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [166, 134, 93], textColor: [255, 255, 255] }
      });
      doc.save(`Yafa_Offers_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('خطأ في إنشاء الملف: ' + error.message);
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/offers');
      setOffers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleOpenModal = (mode, offer = null) => {
    setModalMode(mode);
    if (mode === 'edit' && offer) {
      setCurrentId(offer.id);
      const formattedDate = offer.end_date ? new Date(offer.end_date).toISOString().split('T')[0] : '';
      setFormData({
        product_name: offer.product_name || '',
        discount_percent: offer.discount_percent || '',
        reason: offer.reason || '',
        end_date: formattedDate,
        active: offer.active ?? 1
      });
    } else {
      setFormData({ product_name: '', discount_percent: '', reason: '', end_date: '', active: 1 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await axios.post('/api/offers', formData);
      } else {
        await axios.put(`/api/offers/${currentId}`, formData);
      }
      setShowModal(false);
      fetchOffers();
    } catch (err) {
      console.error('Submit Error:', err);
      alert('فشل الحفظ: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('هل أنتِ متأكدة من حذف جميع العروض؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        // Delete one by one using existing API
        const deletePromises = offers.map(o => axios.delete(`/api/offers/${o.id}`));
        await Promise.all(deletePromises);
        fetchOffers();
        alert('تم حذف جميع العروض بنجاح.');
      } catch (err) {
        console.error('Delete All Error:', err);
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنتِ متأكدة من حذف هذا العرض؟')) {
      try {
        await axios.delete(`/api/offers/${id}`);
        fetchOffers();
      } catch (err) {
        console.error('Delete Error:', err);
        alert('فشل الحذف');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'بدون تاريخ انتهاء';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'تاريخ غير صالح';
    return date.toLocaleDateString('ar-JO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: 'var(--white)',
    border: '1px solid var(--admin-border)',
    color: 'var(--espresso)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: '0.3s',
    fontFamily: 'inherit'
  };

  return (
    <div style={{
      color: 'var(--admin-text)',
      backgroundColor: 'var(--admin-bg)',
      minHeight: '100vh',
      padding: '40px 10px 40px 5px',
      direction: 'rtl'
    }}>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 3000, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            width: '100%', maxWidth: '520px',
            borderRadius: '28px',
            border: '1px solid var(--admin-border)',
            padding: '40px',
            position: 'relative',
            boxShadow: '0 30px 60px rgba(0,0,0,0.12)'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: '20px', left: '20px',
                backgroundColor: 'var(--bg-elevated)',
                border: 'none', color: 'var(--espresso)',
                cursor: 'pointer', borderRadius: '50%',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            <h2 style={{
              color: 'var(--espresso)', margin: '0 0 8px 0',
              fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem'
            }}>
              {modalMode === 'add' ? 'إضافة عرض جديد' : 'تعديل العرض'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '30px' }}>
              {modalMode === 'add' ? 'أضيفي عرضاً أو خصماً جديداً يظهر في شريط العروض' : 'عدّلي بيانات العرض'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--gold-dim)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                  اسم المنتج / التشكيلة
                </label>
                <input
                  style={inputStyle}
                  value={formData.product_name}
                  onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="مثال: عباية مطرزة — أو 'All' لعرض عام"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--gold-dim)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                    نسبة الخصم (%)
                  </label>
                  <input
                    type="number" style={inputStyle}
                    value={formData.discount_percent}
                    onChange={e => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="20" min="1" max="100" required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: 'var(--gold-dim)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    style={inputStyle}
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--gold-dim)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                  وصف العرض
                </label>
                <textarea
                  style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="اكتبي وصفاً للعرض أو مناسبة الخصم..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '5px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 2, padding: '16px',
                    background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
                    color: 'var(--espresso)', border: 'none',
                    borderRadius: '14px', fontWeight: '800',
                    cursor: 'pointer', fontSize: '1rem',
                    boxShadow: 'var(--shadow-gold)'
                  }}
                >
                  {modalMode === 'add' ? '✦ إضافة العرض' : '✦ حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '16px',
                    backgroundColor: 'transparent',
                    color: 'var(--espresso-mid)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '14px', cursor: 'pointer'
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        width: '100%', display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '40px', flexWrap: 'wrap', gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-gold)'
            }}>
              <Tag size={24} color="var(--espresso)" />
            </div>
            <div>
              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '2rem', color: 'var(--espresso)',
                margin: 0, lineHeight: 1
              }}>
                العروض والخصومات
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0' }}>
                يافا اونلاين — الحملات التسويقية والخصومات الموسمية
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={exportPDF}
            style={{
              backgroundColor: 'var(--white)',
              color: 'var(--gold-dim)',
              border: '1px solid var(--border)',
              padding: '12px 22px', borderRadius: '12px',
              fontWeight: '700', display: 'flex',
              alignItems: 'center', gap: '8px',
              cursor: 'pointer', transition: '0.3s',
              fontSize: '0.9rem'
            }}
          >
            <Download size={18} /> تصدير PDF
          </button>
          <button
            onClick={() => handleOpenModal('add')}
            style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
              color: 'var(--espresso)', border: 'none',
              padding: '12px 22px', borderRadius: '12px',
              cursor: 'pointer', fontWeight: '800',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: 'var(--shadow-gold)', fontSize: '0.9rem'
            }}
          >
            <Plus size={18} /> إضافة عرض جديد
          </button>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--gold-dim)', padding: '100px' }}>
          <Sparkles size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '1.1rem' }}>جاري تحميل العروض...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {offers.length > 0 ? offers.map((offer) => (
            <div
              key={offer.id}
              style={{
                backgroundColor: 'var(--white)',
                borderRadius: '24px',
                border: '1px solid var(--border)',
                padding: '28px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px rgba(166,134,93,0.06)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-gold)';
                e.currentTarget.style.borderColor = 'var(--gold)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(166,134,93,0.06)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              {/* Action Buttons */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleOpenModal('edit', offer)}
                  style={{
                    background: 'var(--bg-elevated)', border: 'none',
                    color: 'var(--gold-dim)', cursor: 'pointer',
                    borderRadius: '8px', padding: '6px 8px',
                    display: 'flex', alignItems: 'center',
                    transition: '0.2s'
                  }}
                  title="تعديل"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  style={{
                    background: 'rgba(220,53,69,0.08)', border: 'none',
                    color: '#dc3545', cursor: 'pointer',
                    borderRadius: '8px', padding: '6px 8px',
                    display: 'flex', alignItems: 'center',
                    transition: '0.2s'
                  }}
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Discount Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
                color: 'var(--espresso)', padding: '6px 14px',
                borderRadius: '50px', fontSize: '0.85rem',
                fontWeight: '900', width: 'fit-content',
                marginBottom: '16px', boxShadow: 'var(--shadow-gold)'
              }}>
                <Sparkles size={14} />
                خصم {offer.discount_percent}%
              </div>

              {/* Product Name */}
              <h3 style={{
                margin: '0 0 10px 0', color: 'var(--espresso)',
                fontSize: '1.25rem', lineHeight: '1.3',
                fontFamily: "'DM Serif Display', serif",
                paddingLeft: '60px'
              }}>
                {offer.product_name === 'All' ? 'خصم عام على جميع المنتجات' : offer.product_name}
              </h3>

              {/* Description */}
              <p style={{
                color: 'var(--text-secondary)', fontSize: '0.95rem',
                lineHeight: '1.7', marginBottom: '24px',
                flexGrow: 1
              }}>
                {offer.reason}
              </p>

              {/* Footer */}
              <div style={{
                borderTop: '1px solid var(--divider)',
                paddingTop: '16px',
                display: 'flex', alignItems: 'center',
                gap: '8px', color: 'var(--espresso-dim)',
                fontSize: '0.88rem'
              }}>
                <Calendar size={15} color="var(--gold-dim)" />
                <span>
                  صالح حتى: <strong style={{ color: 'var(--gold-dim)' }}>{formatDate(offer.end_date)}</strong>
                </span>
              </div>
            </div>
          )) : (
            <div style={{
              gridColumn: '1/-1', textAlign: 'center',
              padding: '80px', backgroundColor: 'var(--bg-surface)',
              borderRadius: '24px', border: '1px dashed var(--border)'
            }}>
              <Tag size={48} color="var(--gold-light)" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3 style={{ color: 'var(--espresso)', fontFamily: "'DM Serif Display', serif" }}>
                لا توجد عروض نشطة
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                اضغطي على "إضافة عرض جديد" لإنشاء أول عرض تسويقي
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Offers;