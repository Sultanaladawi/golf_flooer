import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import styles from './Cart.module.css';
import { useEffect } from 'react';

export default function Cart({ onClose, onCheckout }) {
  const { items, totalItems, totalPrice, removeItem, setQty, clearCart } = useCart();
  const { format } = useCurrency();

  const formatPrice = (n) => {
    return format(n);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (items.length === 0) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.drawer} onClick={e => e.stopPropagation()}>
          <div className={styles.drawerHead}>
            <div className={styles.drawerTitleRow}>
              <h2 className={styles.drawerTitle}>سلتكِ</h2>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق السلة">
              <i className="fas fa-times" />
            </button>
          </div>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-shopping-bag" style={{ color: 'var(--gold-dim)', filter: 'drop-shadow(0 10px 20px var(--shadow-sm))' }} />
            </div>
            <p className={styles.emptyTitle}>السلة فارغة</p>
            <p className={styles.emptyDesc}>يبدو أنكِ لم تضيفي أي عبايات إلى سلتكِ بعد.</p>
            <button
              className={styles.checkoutBtn}
              style={{ background: 'var(--brown)', border: '1px solid var(--border)', maxWidth: '250px', color: 'var(--cream)' }}
              onClick={() => {
                onClose();
                setTimeout(() => {
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              }}
            >
              ابدئي التسوق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        <div className={styles.drawerHead}>
          <div className={styles.drawerTitleRow}>
            <h2 className={styles.drawerTitle}>حقيبة التسوق</h2>
            <span className={styles.itemCount}>{totalItems} {totalItems === 1 ? 'قطعة' : 'قطع'}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق السلة">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className={styles.itemList}>
          {items.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '65px', height: '85px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(196, 164, 132, 0.2)' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName} style={{ fontFamily: 'var(--font-primary)' }}>{item.name}</div>
                      {item.size && (
                        <div className={styles.itemSize} style={{ color: 'var(--gold-dim)', fontSize: '0.85rem', fontWeight: 'bold', margin: '4px 0' }}>
                          المقاس: {item.size}
                        </div>
                      )}
                      <div className={styles.itemUnit} style={{ color: '#888' }}>{formatPrice(item.priceNum)}</div>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.id)}
                      aria-label={`حذف ${item.name}`}
                    >
                      <i className="fas fa-trash-alt" />
                    </button>
                  </div>
                  
                  <div className={styles.itemControls}>
                    <div className={styles.qtyControls}>
                      <button className={styles.qtyBtn} onClick={() => setQty(item.id, item.qty - 1)}>
                        <i className="fas fa-minus" />
                      </button>
                      <span className={styles.qty}>{item.qty}</span>
                      <button className={styles.qtyBtn} onClick={() => setQty(item.id, item.qty + 1)}>
                        <i className="fas fa-plus" />
                      </button>
                    </div>
                    <div className={styles.itemSubtotal} style={{ color: 'var(--color-primary)' }}>{formatPrice(item.priceNum * item.qty)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>المجموع الفرعي</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>رسوم التوصيل</span>
            <span style={{ color: '#27ae60' }}>مجاني</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>المجموع الكلي</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <button className={styles.checkoutBtn} onClick={onCheckout} style={{ background: 'var(--brown)', border: '1px solid var(--border)', color: 'var(--cream)' }}>
            <i className="fas fa-shield-alt" />
            <span>تأكيد الطلب</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '8px', fontSize: '1rem', marginLeft: 'auto' }}>{formatPrice(totalPrice)}</span>
          </button>
          
          <button className={styles.clearBtn} onClick={clearCart}>
            إفراغ السلة
          </button>

          <p className={styles.orderNote}>
            <i className="fas fa-info-circle" /> شحن وتوصيل مجاني وسريع لكافة دول العالم.
          </p>
        </div>
      </div>
    </div>
  );
}
