import React, { useState } from 'react';
import { Award, Gift, Search, X, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function LoyaltyCard({ isOpen, onClose }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const { format } = useCurrency();

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');
    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const res = await fetch(`/api/loyalty/${cleanPhone}`);
      if (!res.ok) {
        throw new Error('لم نجد سجل نقاط لهذا الرقم بعد. يمكنكِ كسب النقاط مع أول طلب لكِ!');
      }
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      // Fallback demo data if phone has no records yet
      setUserData({
        phone: cleanPhone,
        points: 0,
        tier: 'برونزي',
        discountValue: 0,
        history: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier) => {
    if (tier === 'ذهب') return '🥇 التاج الذهبي';
    if (tier === 'فضة') return '🥈 المستوى الفضي';
    return '🥉 المستوى البرونزي';
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease'
        }}
      />

      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 9999, width: '92%', maxWidth: '520px', maxHeight: '90vh',
        background: 'linear-gradient(165deg, #1f160c 0%, #120b05 100%)',
        border: '1.5px solid rgba(197, 168, 128, 0.35)',
        borderRadius: '24px', boxShadow: '0 25px 70px rgba(0,0,0,0.7)',
        color: '#ffffff', direction: 'rtl', padding: '30px',
        overflowY: 'auto', fontFamily: "'DM Sans', 'Inter', sans-serif"
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid rgba(197, 168, 128, 0.2)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={26} color="var(--gold, #c5a880)" />
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--gold, #c5a880)' }}>
              برنامج الولاء والنقاط الملكية
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}>
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
          <input
            type="text"
            placeholder="أدخلي رقم هاتفكِ للاستعلام عن النقاط..."
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(197,168,128,0.3)',
              color: '#fff', fontSize: '0.9rem', outline: 'none'
            }}
          />
          <button
            type="submit" disabled={loading}
            style={{
              padding: '12px 20px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
              border: 'none', color: '#000', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Search size={16} />
            <span>بحث</span>
          </button>
        </form>

        {userData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* VIP Member Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(197, 168, 128, 0.2) 0%, rgba(197, 168, 128, 0.05) 100%)',
              border: '1px solid rgba(197, 168, 128, 0.4)',
              borderRadius: '20px', padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold, #c5a880)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {getTierIcon(userData.tier)}
              </span>

              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#ffffff', margin: '10px 0 4px', textShadow: '0 0 20px rgba(197, 168, 128, 0.5)' }}>
                {userData.points || 0}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '15px' }}>
                نقطة ولاء معتمدة
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '10px 16px',
                fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold-light, #e5cda8)', display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}>
                <Sparkles size={16} />
                <span>تساوي خصم بقيمة: {format((userData.points || 0) * 0.1)} عند الشراء</span>
              </div>
            </div>

            {/* How Loyalty Works */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.92rem', color: 'var(--gold, #c5a880)', fontWeight: 800 }}>
                كيف يعمل برنامج الولاء الملكي؟
              </h4>
              <ul style={{ margin: 0, paddingRight: '20px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                <li>تكتسبين <strong>1 نقطة</strong> مقابل كل 1 JOD في مشترياتكِ.</li>
                <li>كل <strong>10 نقاط</strong> تمنحكِ خصماً بمقدار 1 JOD في طلباتكِ القادمة.</li>
                <li>تُحتسب النقاط وتُضاف تلقائياً إلى رقم هاتفكِ فور إتمام كل طلب.</li>
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: '24px', padding: '14px', borderRadius: '16px',
            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
          }}
        >
          إغلاق
        </button>
      </div>
    </>
  );
}
