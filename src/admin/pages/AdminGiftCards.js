import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Gift, Printer, Send, Plus, X } from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

export default function AdminGiftCards() {
  const { t } = useAdminLang();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardForPrint, setSelectedCardForPrint] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New card form state
  const [amount, setAmount] = useState(50);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCards = () => {
    setLoading(true);
    axios.get('/api/admin/gift-cards')
      .then(res => setCards(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!recipientPhone.trim()) return alert('يرجى إدخال رقم واتساب المستلم الدولي');
    setSubmitting(true);
    try {
      await axios.post('/api/admin/gift-cards', {
        amount,
        recipientName,
        recipientPhone,
        buyerContact,
        message
      });
      setShowCreateModal(false);
      setRecipientName('');
      setRecipientPhone('');
      setBuyerContact('');
      setMessage('');
      fetchCards();
    } catch (err) {
      alert('حدث خطأ في عملية إضافة البطاقة');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (card) => {
    const newStatus = card.status === 'active' ? 'used' : 'active';
    try {
      await axios.put(`/api/admin/gift-cards/${card.id}/status`, { status: newStatus });
      fetchCards();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = (card) => {
    const cleanPhone = (card.recipient_phone || card.recipient_email || '').replace(/\D/g, '');
    const text = `🎁 *بطاقة إهداء ملكية من دار زهرة بيسان* 🎁\n\nأهلاً ${card.recipient_name || ''}،\nتم إرسال بطاقة إهداء بقيمة *${card.initial_value || card.amount} JOD* خصيصاً لكِ!\n\n🔑 رمز البطاقة الملكي: *${card.code}*\n\n💬 الرسالة: "${card.message || 'مع أطيب التمنيات بإطلالة ملكية ساحرة'}"\n\nتسوقي عبر متجرنا الرسمي: https://zahratbeesan.com`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ padding: '25px', direction: 'rtl', fontFamily: "'DM Sans', 'Inter', 'Cairo', sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--admin-text, #1a1a1a)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontWeight: 900 }}>
            <Gift size={28} color="var(--admin-primary, #c5a880)" />
            بطاقات الهدايا الملكية
          </h1>
          <p style={{ color: 'var(--admin-secondary, #666)', marginTop: '6px', fontSize: '0.9rem' }}>
            إدارة وطباعة ومشاركة بطاقات الهدايا المباشرة للزبائن والمُهدى إليهم.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 22px',
            background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(197, 168, 128, 0.3)'
          }}
        >
          <Plus size={18} />
          <span>إصدار بطاقة إهداء جديدة</span>
        </button>
      </div>

      {/* Cards Table / Grid */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid rgba(197, 168, 128, 0.2)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gold)' }}>جاري التحميل...</div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>لا يوجد بطاقات هدايا حالياً.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', color: '#666', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px' }}>تاريخ الإصدار</th>
                <th style={{ padding: '12px' }}>رمز البطاقة</th>
                <th style={{ padding: '12px' }}>المستلم (الواتساب الدولي)</th>
                <th style={{ padding: '12px' }}>المشتري</th>
                <th style={{ padding: '12px' }}>القيمة</th>
                <th style={{ padding: '12px' }}>الحالة</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>إجراءات الطباعة والتسليم</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => {
                const isUsed = card.status === 'used' || card.balance === 0;
                return (
                  <tr key={card.id} style={{ borderBottom: '1px solid #f2f2f2', fontSize: '0.9rem' }}>
                    <td style={{ padding: '14px', color: '#666' }}>
                      {new Date(card.created_at || Date.now()).toLocaleDateString('ar-JO')}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--gold-dim, #a6865d)' }}>
                      {card.code}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 800, color: '#1a1a1a' }}>{card.recipient_name || 'المستلم'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#777', direction: 'ltr', textAlign: 'right' }}>{card.recipient_phone || card.recipient_email || '—'}</div>
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.85rem', color: '#555' }}>
                      {card.buyer_contact || card.buyer_email || '—'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 900, color: '#1a1a1a' }}>
                      {card.initial_value || card.amount} JOD
                    </td>
                    <td style={{ padding: '14px' }}>
                      <button
                        onClick={() => toggleStatus(card)}
                        style={{
                          background: isUsed ? '#e2e3e5' : 'rgba(39, 174, 96, 0.12)',
                          color: isUsed ? '#383d41' : '#27ae60',
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {isUsed ? 'مستخدمة' : 'فعالة ✦'}
                      </button>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {/* Print Card Button */}
                        <button
                          onClick={() => setSelectedCardForPrint(card)}
                          title="عرض وطباعة بطاقة الإهداء الملكية"
                          style={{
                            padding: '8px 14px',
                            background: '#1a1a1a',
                            color: 'var(--gold, #c5a880)',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Printer size={15} />
                          <span>معاينة وتصدير</span>
                        </button>

                        {/* WhatsApp Button */}
                        <button
                          onClick={() => handleWhatsApp(card)}
                          title="مشاركة عبر واتساب المستلم"
                          style={{
                            padding: '8px 12px',
                            background: '#25D366',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center'
                          }}
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 🖨️ Royal Gift Card Print Modal */}
      {selectedCardForPrint && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '550px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedCardForPrint(null)}
              className="no-print"
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888'
              }}
            >
              <X size={22} />
            </button>

            <h3 className="no-print" style={{ fontSize: '1.2rem', margin: '0 0 20px', fontWeight: 900, color: '#1a1a1a' }}>
              معاينة بطاقة الإهداء الملكية للطباعة
            </h3>

            {/* Physical Royal Gift Card Graphic Container */}
            <div id="printable-gift-card" style={{
              background: 'linear-gradient(135deg, #1f1a14 0%, #3a2e21 50%, #1f1a14 100%)',
              borderRadius: '20px',
              padding: '30px 25px',
              color: '#faf8f5',
              border: '2px solid rgba(197, 168, 128, 0.5)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
              position: 'relative',
              overflow: 'hidden',
              direction: 'rtl'
            }}>
              {/* Logo & Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '1px solid rgba(197, 168, 128, 0.3)', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/logo.png" alt="زهرة بيسان" style={{ height: '42px', width: 'auto', borderRadius: '6px', border: '1px solid rgba(197, 168, 128, 0.4)' }} />
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>زهرة بيسان</h2>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gold, #c5a880)', letterSpacing: '1px' }}>ROYAL GIFT CARD</span>
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
                  color: '#ffffff',
                  padding: '6px 16px',
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: 900
                }}>
                  {selectedCardForPrint.initial_value || selectedCardForPrint.amount} JOD
                </div>
              </div>

              {/* Recipient Details */}
              <div style={{ margin: '15px 0', fontSize: '0.88rem', lineHeight: 1.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ opacity: 0.7 }}>إلى الشخص العزيز:</span>
                  <strong style={{ color: 'var(--gold, #c5a880)', fontWeight: 900 }}>{selectedCardForPrint.recipient_name || 'المستلم الكريم'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ opacity: 0.7 }}>واتساب المستلم الدولي:</span>
                  <span style={{ direction: 'ltr', color: '#ffffff', fontWeight: 700 }}>{selectedCardForPrint.recipient_phone || selectedCardForPrint.recipient_email || '—'}</span>
                </div>
              </div>

              {/* Message */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px dashed rgba(197, 168, 128, 0.4)',
                borderRadius: '12px',
                padding: '12px 15px',
                margin: '15px 0',
                fontSize: '0.82rem',
                color: 'rgba(255, 255, 255, 0.95)',
                lineHeight: 1.6
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--gold)', display: 'block', marginBottom: '4px', fontWeight: 800 }}>
                  ✦ رسالة الإهداء المطبوعة:
                </span>
                {selectedCardForPrint.message || 'مع أطيب التمنيات بإطلالة ملكية ساحرة من دار زهرة بيسان...'}
              </div>

              {/* Footer Serial */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(197, 168, 128, 0.2)', fontSize: '0.72rem', opacity: 0.85 }}>
                <span>رمز البطاقة: <strong style={{ color: 'var(--gold)', letterSpacing: '1px' }}>{selectedCardForPrint.code}</strong></span>
                <span>صالحة لاستخدام متجر زهرة بيسان ✦</span>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="no-print" style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
              <button
                onClick={handlePrint}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(197, 168, 128, 0.3)'
                }}
              >
                <Printer size={18} />
                <span>طباعة البطاقة الملكية الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ➕ Create Card Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', margin: '0 0 20px', fontWeight: 900, color: '#1a1a1a' }}>
              إصدار بطاقة إهداء جديدة من الأدمن
            </h3>

            <form onSubmit={handleCreateCard} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 800 }}>قيمة البطاقة (JOD):</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 800 }}>رقم واتساب المستلم الدولي (مطلوب):</label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={e => setRecipientPhone(e.target.value)}
                  placeholder="مثال: +962796697413 أو +966500000000"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', direction: 'ltr', textAlign: 'right' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 800 }}>اسم المستلم:</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="اسم الشخص العزيز..."
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 800 }}>بيانات المشتري (اختياري):</label>
                <input
                  type="text"
                  value={buyerContact}
                  onChange={e => setBuyerContact(e.target.value)}
                  placeholder="اسم أو رقم المشتري..."
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 800 }}>رسالة الإهداء المطبوعة:</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="اكتب تهنئة فاخرة ليتم طباعتها على البطاقة..."
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'جاري الإصدار...' : 'حفظ وإصدار البطاقة الملكية ✦'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSS for Clean Printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          #printable-gift-card, #printable-gift-card * { visibility: visible; }
          #printable-gift-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 90% !important;
            max-width: 600px !important;
            box-shadow: none !important;
            border: 2px solid #c5a880 !important;
          }
        }
      `}</style>

    </div>
  );
}
