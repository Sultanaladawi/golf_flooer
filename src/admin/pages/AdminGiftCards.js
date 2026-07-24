import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Gift, CheckCircle, Clock } from 'lucide-react';
import { useAdminLang } from '../AdminLangContext';

export default function AdminGiftCards() {
  const { t } = useAdminLang();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = () => {
    setLoading(true);
    axios.get('/api/admin/gift-cards')
      .then(res => setCards(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <span style={{ background: '#d4edda', color: '#155724', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem' }}><CheckCircle size={14} style={{ display: 'inline', marginRight: '5px' }} /> فعالة</span>;
      case 'used': return <span style={{ background: '#e2e3e5', color: '#383d41', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem' }}><Clock size={14} style={{ display: 'inline', marginRight: '5px' }} /> مستخدمة بالكامل</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '30px', direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '15px', margin: 0 }}>
            <Gift size={32} color="var(--admin-primary)" />
            بطاقات الهدايا
          </h1>
          <p style={{ color: 'var(--admin-secondary)', marginTop: '10px' }}>
            سجل بطاقات الهدايا الإلكترونية المباعة وأرصدتها الحالية.
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>جاري التحميل...</div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>لا يوجد بطاقات هدايا حالياً.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', color: '#666' }}>
                <th style={{ padding: '15px' }}>تاريخ الإصدار</th>
                <th style={{ padding: '15px' }}>كود البطاقة</th>
                <th style={{ padding: '15px' }}>المشتري</th>
                <th style={{ padding: '15px' }}>المستلم</th>
                <th style={{ padding: '15px' }}>القيمة الأصلية</th>
                <th style={{ padding: '15px' }}>الرصيد المتبقي</th>
                <th style={{ padding: '15px' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => {
                return (
                  <tr key={card.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px', color: '#555' }}>
                      {new Date(card.created_at).toLocaleString('ar-JO')}
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {card.code}
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>{card.buyer_email}</td>
                    <td style={{ padding: '15px', fontSize: '0.9rem' }}>{card.recipient_email}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{card.initial_value} JOD</td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: card.balance > 0 ? '#27ae60' : '#888' }}>
                      {card.balance} JOD
                    </td>
                    <td style={{ padding: '15px' }}>{getStatusBadge(card.balance > 0 ? 'active' : 'used')}</td>
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
