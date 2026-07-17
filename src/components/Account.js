import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCurrency } from '../context/CurrencyContext';
import styles from './Account.module.css';
import { Link, Navigate } from 'react-router-dom';

export default function Account() {
  const { customer, logout } = useCustomerAuth();
  const { format } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customer?.email) {
      // In a real scenario, we would fetch from /api/customer/orders?email=customer.email
      // For now, we just mock or wait until backend is ready
      fetch(`/api/orders`)
        .then(res => res.json())
        .then(data => {
          if(Array.isArray(data)) {
            // Filter by email locally for demonstration if backend doesn't filter
            const userOrders = data.filter(o => o.email === customer.email || o.customer_email === customer.email);
            setOrders(userOrders);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [customer]);

  if (!customer) {
    return <Navigate to="/" />;
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
        <button onClick={logout} className={styles.logoutBtn}>تسجيل الخروج</button>
      </div>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>طلباتي السابقة</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : orders.length > 0 ? (
          <div className={styles.ordersList}>
            {orders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderId}>طلب #{order.id}</span>
                  <span className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('ar-JO')}</span>
                </div>
                <div className={styles.orderDetails}>
                  <span className={styles.orderStatus}>{order.status || 'جاري التجهيز'}</span>
                  <span className={styles.orderTotal}>{format(order.total_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <i className="fas fa-box-open" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '15px' }} />
            <p>لا يوجد لديك طلبات سابقة حتى الآن.</p>
            <Link to="/" className={styles.shopBtn}>تصفح المنتجات</Link>
          </div>
        )}
      </div>
    </div>
  );
}
