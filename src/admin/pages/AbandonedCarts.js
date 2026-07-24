import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Send, Clock, CheckCircle, Mail, Phone } from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

export default function AbandonedCarts() {
  const { t } = useAdminLang();
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCarts = () => {
    setLoading(true);
    axios.get('/api/admin/abandoned-carts')
      .then(res => setCarts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const handleSendReminder = (id) => {
    if (!window.confirm('هل أنت متأكد من إرسال بريد تذكيري لهذه السلة المتروكة؟')) return;
    
    axios.post('/api/admin/abandoned-carts/send-reminder', { id })
      .then(() => {
        alert('تم إرسال البريد التذكيري بنجاح!');
        fetchCarts();
      })
      .catch(err => {
        console.error(err);
        alert('حدث خطأ أثناء الإرسال. تأكد من إعدادات SMTP.');
      });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span style={{ background: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem' }}><Clock size={14} style={{ display: 'inline', marginRight: '5px' }} /> بانتظار الإرسال</span>;
      case 'sent': return <span style={{ background: '#d1ecf1', color: '#0c5460', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem' }}><Send size={14} style={{ display: 'inline', marginRight: '5px' }} /> تم التذكير</span>;
      case 'recovered': return <span style={{ background: '#d4edda', color: '#155724', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem' }}><CheckCircle size={14} style={{ display: 'inline', marginRight: '5px' }} /> تم الاسترجاع</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '30px', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '15px', margin: 0 }}>
            <ShoppingCart size={32} color="var(--admin-primary)" />
            إدارة السلال المتروكة
          </h1>
          <p style={{ color: 'var(--admin-secondary)', marginTop: '10px' }}>
            السلال التي تمت تعبئتها ولم يكمل أصحابها عملية الدفع.
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>جاري التحميل...</div>
        ) : carts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>لا توجد سلال متروكة حالياً.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                <th style={{ padding: '15px' }}>التاريخ</th>
                <th style={{ padding: '15px' }}>العميل</th>
                <th style={{ padding: '15px' }}>السلة</th>
                <th style={{ padding: '15px' }}>الإجمالي</th>
                <th style={{ padding: '15px' }}>الحالة</th>
                <th style={{ padding: '15px' }}>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {carts.map(cart => {
                const items = typeof cart.cart_items === 'string' ? JSON.parse(cart.cart_items) : cart.cart_items;
                return (
                  <tr key={cart.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px', color: '#555' }}>
                      {new Date(cart.updated_at).toLocaleString('ar-JO')}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {cart.email && <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><Mail size={14} color="#888" /> {cart.email}</div>}
                      {cart.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={14} color="#888" /> <span dir="ltr">{cart.phone}</span></div>}
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                      {items.map((i, idx) => (
                        <div key={idx} style={{ marginBottom: '5px' }}>• {i.name} (x{i.quantity})</div>
                      ))}
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{cart.total_price} JOD</td>
                    <td style={{ padding: '15px' }}>{getStatusBadge(cart.status)}</td>
                    <td style={{ padding: '15px' }}>
                      {cart.status === 'pending' && cart.email && (
                        <button 
                          onClick={() => handleSendReminder(cart.id)}
                          style={{ background: 'var(--admin-primary)', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Send size={14} /> إرسال تذكير
                        </button>
                      )}
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
