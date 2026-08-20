import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Send, Clock, CheckCircle, Mail, Phone, MessageSquare, Tag, Trash2, ArrowUpRight } from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

export default function AbandonedCarts() {
  const { t } = useAdminLang();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCarts = () => {
    setLoading(true);
    axios.get('/api/admin/abandoned-carts')
      .then(res => setCarts(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const handleSendWhatsApp = (cart) => {
    if (!cart.phone) {
      alert('لا يتوفر رقم هاتف لهذه السلة المتروكة.');
      return;
    }

    let cleanPhone = cart.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('07') && cleanPhone.length === 10) {
      cleanPhone = '962' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('05') && cleanPhone.length === 10) {
      cleanPhone = '966' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('962') && !cleanPhone.startsWith('966') && !cleanPhone.startsWith('971') && !cleanPhone.startsWith('965') && cleanPhone.length === 9) {
      cleanPhone = '962' + cleanPhone;
    }

    const items = typeof cart.cart_items === 'string' ? JSON.parse(cart.cart_items) : (cart.cart_items || []);
    const firstItemName = items[0]?.name || 'قطع فاخرة من العبايات';

    const msg = `مرحباً بكِ من متجر زهرة بيسان 🌸✨\n\nلاحظنا أنكِ تركتِ قطعاً مميزة في سلة التسوق الخاصة بكِ (${firstItemName})!\n\n🎁 يسعدنا تقديم كود خصم خاص 10% (BEESAN10) لإتمام طلبكِ الآن والاستمتاع بتجربة تسوق راقية:\nhttps://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net\n\nإذا كنتِ بحاجة لأي مساعدة في المقاسات أو التوصيل، يسعدنا الرد عليكِ فوراً 💕`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');

    // Mark status as sent in local state / backend
    axios.post('/api/admin/abandoned-carts/send-reminder', { id: cart.id }).catch(() => {});
  };

  const handleSendEmail = (id) => {
    if (!window.confirm('هل أنت متأكد من إرسال بريد تذكيري لهذه السلة المتروكة؟')) return;
    
    axios.post('/api/admin/abandoned-carts/send-reminder', { id })
      .then(() => {
        alert('تم إرسال البريد التذكيري بنجاح!');
        fetchCarts();
      })
      .catch(err => {
        console.error(err);
        alert('حدث خطأ أثناء الإرسال.');
      });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': 
        return <span style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#b45309', padding: '6px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Clock size={13} /> بانتظار التذكير</span>;
      case 'sent': 
        return <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#1d4ed8', padding: '6px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><Send size={13} /> تم إرسال العرض</span>;
      case 'recovered': 
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#047857', padding: '6px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={13} /> تم الاسترجاع والطلب</span>;
      default: 
        return <span>{status}</span>;
    }
  };

  const totalValue = carts.reduce((acc, c) => acc + (parseFloat(c.total_price) || 0), 0);
  const recoveredCount = carts.filter(c => c.status === 'recovered').length;

  return (
    <div style={{ padding: '30px', direction: 'rtl', minHeight: '100vh', background: 'var(--admin-bg)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontFamily: "'DM Serif Display', serif" }}>
            <ShoppingCart size={32} color="var(--admin-accent)" />
            إدارة السلال المتروكة (Abandoned Cart Recovery)
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1rem' }}>
            تتبع العميلات اللاتي لم يكملن الدفع وإرسال عروض ترويجية وتذكيرات واتساب لزيادة المبيعات.
          </p>
        </div>
        <button
          onClick={fetchCarts}
          style={{
            background: 'var(--admin-card)',
            border: '1px solid var(--admin-border)',
            color: 'var(--admin-text)',
            padding: '10px 20px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 تحديث السلال
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>إجمالي السلات المتروكة</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--admin-text)' }}>{carts.length}</div>
        </div>
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>القيمة الإجمالية المتروكة</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>{totalValue.toFixed(2)} JOD</div>
        </div>
        <div style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>السلات المسترجعة</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>{recoveredCount}</div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--admin-card)', borderRadius: '16px', border: '1px solid var(--admin-border)', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>جاري التحميل...</div>
        ) : carts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
            <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '15px' }} />
            <p>لا توجد سلال متروكة حالياً. جميع الطلبات تتم بنجاح!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--admin-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <th style={{ padding: '15px' }}>التاريخ والوقت</th>
                <th style={{ padding: '15px' }}>بيانات العميلة</th>
                <th style={{ padding: '15px' }}>المنتجات في السلة</th>
                <th style={{ padding: '15px' }}>قيمة السلة</th>
                <th style={{ padding: '15px' }}>الحالة</th>
                <th style={{ padding: '15px' }}>إجراءات الاسترجاع السريع</th>
              </tr>
            </thead>
            <tbody>
              {carts.map(cart => {
                const items = typeof cart.cart_items === 'string' ? JSON.parse(cart.cart_items) : (cart.cart_items || []);
                return (
                  <tr key={cart.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(cart.updated_at).toLocaleString('ar-JO')}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {cart.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontWeight: 'bold', color: 'var(--admin-text)' }}>
                          <Phone size={14} color="var(--admin-accent)" /> 
                          <span dir="ltr">{cart.phone}</span>
                        </div>
                      )}
                      {cart.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <Mail size={14} color="#888" /> 
                          <span>{cart.email}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                      {items.map((i, idx) => (
                        <div key={idx} style={{ marginBottom: '4px', color: 'var(--admin-text)' }}>
                          • {i.name} {i.size ? `(${i.size})` : ''} <strong style={{ color: 'var(--admin-accent)' }}>x{i.quantity || i.qty || 1}</strong>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '15px', fontWeight: 900, color: 'var(--admin-text)', fontSize: '1.05rem' }}>
                      {parseFloat(cart.total_price || 0).toFixed(2)} JOD
                    </td>
                    <td style={{ padding: '15px' }}>
                      {getStatusBadge(cart.status)}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {cart.phone && (
                          <button 
                            onClick={() => handleSendWhatsApp(cart)}
                            style={{ 
                              background: '#25D366', 
                              color: '#fff', 
                              border: 'none', 
                              padding: '8px 14px', 
                              borderRadius: '8px', 
                              cursor: 'pointer', 
                              fontWeight: 'bold', 
                              fontSize: '0.85rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)'
                            }}
                          >
                            <MessageSquare size={14} /> إرسال كود خصم بالواتساب
                          </button>
                        )}
                        {cart.email && (
                          <button 
                            onClick={() => handleSendEmail(cart.id)}
                            style={{ 
                              background: 'var(--admin-card)', 
                              border: '1px solid var(--admin-border)', 
                              color: 'var(--admin-text)', 
                              padding: '8px 12px', 
                              borderRadius: '8px', 
                              cursor: 'pointer', 
                              fontWeight: 'bold', 
                              fontSize: '0.82rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '5px' 
                            }}
                          >
                            <Mail size={13} /> إيميل
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
