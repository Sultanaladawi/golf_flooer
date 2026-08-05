import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { LogOut, Package, MapPin, Heart, Star, ChevronRight, Ruler } from 'lucide-react';
import styles from './Account.module.css';

export default function Account() {
  const { customer, logout } = useCustomerAuth();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Size profile state
  const [sizeProfile, setSizeProfile] = useState(customer?.sizeProfile || { height: '', weight: '', abayaSize: '' });
  const [savedSize, setSavedSize] = useState(false);

  useEffect(() => {
    if (!customer?.email) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(customer.email)}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          const fallback = await fetch('/api/orders');
          const allOrders = await fallback.json();
          setOrders(allOrders.filter(o => o.email === customer.email || o.customer_email === customer.email));
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [customer]);

  const saveSizes = () => {
    const updatedCustomer = { ...customer, sizeProfile };
    // This is temporary, for a full production app we'd save this to backend
    localStorage.setItem('zahrat_customer', JSON.stringify(updatedCustomer));
    setSavedSize(true);
    setTimeout(() => setSavedSize(false), 3000);
  };

  if (!customer) {
    navigate('/');
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{customer.email[0].toUpperCase()}</div>
          <div>
            <h1 className={styles.title}>مرحباً بك</h1>
            <p className={styles.email}>{customer.email}</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className={styles.logoutBtn}>
          تسجيل الخروج <LogOut size={16} />
        </button>
      </div>

      <div className={styles.accountLayout}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <button className={activeTab === 'orders' ? styles.active : ''} onClick={() => setActiveTab('orders')}>
              <Package size={20} /> طلباتي السابقة <ChevronRight size={16} className={styles.arrow} />
            </button>
            <button className={activeTab === 'wishlist' ? styles.active : ''} onClick={() => setActiveTab('wishlist')}>
              <Heart size={20} /> قائمة الأمنيات <ChevronRight size={16} className={styles.arrow} />
            </button>
            <button className={activeTab === 'sizes' ? styles.active : ''} onClick={() => setActiveTab('sizes')}>
              <Ruler size={20} /> قياساتي <ChevronRight size={16} className={styles.arrow} />
            </button>
            <button className={activeTab === 'points' ? styles.active : ''} onClick={() => setActiveTab('points')}>
              <Star size={20} /> نقاط الولاء <ChevronRight size={16} className={styles.arrow} />
            </button>
            <button className={activeTab === 'address' ? styles.active : ''} onClick={() => setActiveTab('address')}>
              <MapPin size={20} /> العناوين المحفوظة <ChevronRight size={16} className={styles.arrow} />
            </button>
          </nav>
        </aside>

        <main className={styles.content}>
          {activeTab === 'orders' && (
            <div>
              <h2 className={styles.sectionTitle}>طلباتي السابقة</h2>
              {loading ? <p>جاري التحميل...</p> : orders.length > 0 ? (
                <div className={styles.ordersList}>
                  {orders.map(order => (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <span className={styles.orderId}>طلب #{order.id}</span>
                        <span className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('ar-JO')}</span>
                      </div>
                      <div className={styles.orderDetails}>
                        <span className={styles.orderStatus}>{
                          order.status === 'pending' ? 'قيد المراجعة' : 
                          order.status === 'preparing' ? 'جاري التجهيز' :
                          order.status === 'shipped' ? 'في الطريق' :
                          order.status === 'delivered' ? 'تم التسليم' : order.status
                        }</span>
                        <span className={styles.orderTotal}>{format(order.total_amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Package size={48} color="#ccc" style={{ marginBottom: '15px' }} />
                  <p>لا يوجد لديك طلبات سابقة حتى الآن.</p>
                  <button onClick={() => navigate('/')} className={styles.shopBtn}>تصفح المنتجات</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className={styles.emptyState}>
              <Heart size={48} color="#ccc" style={{ marginBottom: '15px' }} />
              <p>تم ربط الأمنيات بحسابك تلقائياً.</p>
              <button onClick={() => navigate('/')} className={styles.shopBtn}>أضف للأمنيات</button>
            </div>
          )}

          {activeTab === 'sizes' && (
            <div>
              <h2 className={styles.sectionTitle}>ملف القياسات</h2>
              <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>احفظي قياساتك لتسهيل عملية الشراء واختيار المقاس الأنسب لكِ تلقائياً.</p>
              
              <div style={{ display: 'grid', gap: '20px', maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>الطول (سم)</label>
                  <input type="number" className={styles.filterInput} placeholder="مثال: 165" 
                         value={sizeProfile.height} onChange={e => setSizeProfile({...sizeProfile, height: e.target.value})} 
                         style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>الوزن التقريبي (كغ)</label>
                  <input type="number" className={styles.filterInput} placeholder="مثال: 60" 
                         value={sizeProfile.weight} onChange={e => setSizeProfile({...sizeProfile, weight: e.target.value})} 
                         style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px' }}>مقاس العباية المفضل</label>
                  <select value={sizeProfile.abayaSize} onChange={e => setSizeProfile({...sizeProfile, abayaSize: e.target.value})}
                          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                    <option value="">اختاري المقاس</option>
                    <option value="50">50</option>
                    <option value="52">52</option>
                    <option value="54">54</option>
                    <option value="56">56</option>
                    <option value="58">58</option>
                    <option value="60">60</option>
                  </select>
                </div>
                
                <button onClick={saveSizes} className={styles.shopBtn} style={{ marginTop: '10px' }}>
                  {savedSize ? 'تم الحفظ بنجاح ✓' : 'حفظ القياسات'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div style={{ animation: 'fadeInUp 0.4s ease' }}>
              <div style={{
                background: 'linear-gradient(135deg, #1f1a14 0%, #3a2e21 50%, #1f1a14 100%)',
                color: '#faf8f5',
                borderRadius: '24px',
                padding: '30px',
                border: '1px solid rgba(197, 163, 106, 0.4)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '30px'
              }}>
                <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '160px', height: '160px', background: 'rgba(197, 163, 106, 0.1)', borderRadius: '50%', filter: 'blur(30px)' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gold, #c5a36a)' }}>
                      👑 نادي زهرة بيسان الملكي
                    </span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '6px 0 0', color: '#ffffff' }}>
                      عضوية النادي الملكي (VIP Lounge)
                    </h2>
                  </div>
                  <div style={{ background: 'rgba(197,163,106,0.15)', border: '1px solid rgba(197,163,106,0.4)', padding: '8px 18px', borderRadius: '30px', color: 'var(--gold, #c5a36a)', fontWeight: 800, fontSize: '0.85rem' }}>
                    ✦ الرتبة المخملية Velvet VIP
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(197,163,106,0.2)' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', opacity: 0.8 }}>رصيد النقاط الملكية</span>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--gold, #c5a36a)', marginTop: '4px' }}>
                      {orders.length * 150 + 100} <span style={{ fontSize: '1rem', fontWeight: 600 }}>نقطة</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', opacity: 0.8 }}>الرتبة القادمة</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                      الرتبة الزمردية Emerald
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', opacity: 0.8 }}>معدل التجميع</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
                      1 دينار = 1 نقطة ملكية
                    </div>
                  </div>
                </div>
              </div>

              {/* VIP Tiers Comparison */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--espresso, #2b2015)', marginBottom: '20px' }}>
                مزايا وحصريات النادي الملكي (Bisan VIP Lounge)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {[
                  {
                    title: 'الرتبة المخملية Velvet',
                    points: '0 - 500 نقطة',
                    badge: '💎 الحالية',
                    active: true,
                    perks: ['خصم 5% حصري على الطلبات', 'كارت إهداء ملكي معطر', 'خدمة عملاء أولوية']
                  },
                  {
                    title: 'الرتبة الزمردية Emerald',
                    points: '501 - 1500 نقطة',
                    badge: '🌟 النادي المتقدم',
                    active: false,
                    perks: ['خصم 10% على كل التشكيلات', 'أولوية التجهيز والشحن', 'سحوبات حصرية للأعضاء']
                  },
                  {
                    title: 'الرتبة الماسية Royal Diamond',
                    points: 'أكثر من 1500 نقطة',
                    badge: '👑 القمة الملكية',
                    active: false,
                    perks: ['خصم 15% دائم ومباشر', 'وصول مبكر حاد للتشكيلات قبل صدورها', 'عينة عطر بيسان الملكي مع كل شحنة']
                  }
                ].map((tier, idx) => (
                  <div key={idx} style={{
                    background: tier.active ? 'rgba(197, 163, 106, 0.08)' : 'var(--bg-card, #fff)',
                    border: `1.5px solid ${tier.active ? 'var(--gold, #c5a36a)' : 'rgba(197, 163, 106, 0.2)'}`,
                    borderRadius: '20px',
                    padding: '24px',
                    position: 'relative'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: tier.active ? 'var(--gold)' : 'var(--espresso-dim)', background: tier.active ? 'rgba(197,163,106,0.2)' : 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '12px' }}>
                      {tier.badge}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '14px 0 4px', color: 'var(--espresso)' }}>{tier.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--espresso-dim)', fontWeight: 700 }}>{tier.points}</span>
                    <ul style={{ paddingRight: '18px', marginTop: '16px', fontSize: '0.88rem', color: 'var(--espresso-mid)', lineHeight: 1.7 }}>
                      {tier.perks.map((p, i) => (
                        <li key={i} style={{ marginBottom: '6px' }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className={styles.emptyState}>
              <MapPin size={48} color="#ccc" style={{ marginBottom: '15px' }} />
              <p>لا يوجد عناوين محفوظة.</p>
              <button className={styles.shopBtn}>إضافة عنوان جديد</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
