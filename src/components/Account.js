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
            <div className={styles.emptyState}>
              <Star size={48} color="var(--gold)" style={{ marginBottom: '15px' }} />
              <h3 style={{color:'var(--gold)'}}>0 نقطة</h3>
              <p>تسوّق لجمع النقاط واستبدالها بخصومات!</p>
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
