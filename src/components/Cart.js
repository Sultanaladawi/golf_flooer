import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import styles from './Cart.module.css';
import { useEffect } from 'react';

export default function Cart({ isOpen, onClose, onCheckout }) {
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [hidePrice, setHidePrice] = useState(true);

  const { 
    items, 
    removeItem, 
    setQty, 
    clearCart, 
    subTotal,
    bundleDiscount,
    isBundleApplied,
    totalPrice,
    totalItems
  } = useCart();
  const { format: formatPrice } = useCurrency();
  const { customer, openLoginModal } = useCustomerAuth();



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
                    onError={(e) => { e.target.onerror = null; e.target.src = '/12.png'; }}
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

        {/* Luxury Gifting Option */}
        <div style={{
          margin: '15px 20px 0',
          padding: '16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(197, 163, 106, 0.1) 0%, rgba(197, 163, 106, 0.03) 100%)',
          border: '1px solid rgba(197, 163, 106, 0.3)',
          direction: 'rtl'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 800, color: 'var(--espresso)', fontSize: '0.88rem' }}>
            <input 
              type="checkbox"
              checked={isGift}
              onChange={e => setIsGift(e.target.checked)}
              style={{ accentColor: 'var(--gold, #c5a36a)', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>🎁 إرسال كهدية ملكية لشخص عزيز (Luxury Gifting)</span>
          </label>
          
          {isGift && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeInUp 0.3s ease' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--espresso-dim)', margin: 0, lineHeight: 1.5 }}>
                تتضمن الهدية تغليفاً عاجياً فاخراً ومعطراً بعطر بيسان، وإخفاء الأسعار، مع طباعة كارت الإهداء الملكي.
              </p>
              <textarea
                placeholder="اكتبي رسالة الإهداء الخاصة ليتم طباعتها على كارت الإهداء..."
                value={giftMessage}
                onChange={e => setGiftMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(197, 163, 106, 0.3)',
                  background: 'var(--bg-surface, #fff)',
                  color: 'var(--espresso)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '60px'
                }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--espresso-mid)', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={hidePrice}
                  onChange={e => setHidePrice(e.target.checked)}
                  style={{ accentColor: 'var(--gold)' }}
                />
                <span>إخفاء أسعار المنتجات بالفاتورة عن المستلم</span>
              </label>
            </div>
          )}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>المجموع الفرعي</span>
            <span>{formatPrice(subTotal)}</span>
          </div>
          {isBundleApplied && (
            <div className={styles.summaryRow} style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
              <span><i className="fas fa-tags" /> خصم الباقة (10%)</span>
              <span>- {formatPrice(bundleDiscount)}</span>
            </div>
          )}
          <div className={styles.summaryRow}>
            <span>رسوم التوصيل</span>
            <span style={{ color: 'var(--espresso)' }}>يُحسب في الدفع</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>المجموع الكلي</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <button className={styles.checkoutBtn} onClick={() => customer ? onCheckout() : openLoginModal(onCheckout)} style={{ background: 'var(--brown)', border: '1px solid var(--border)', color: 'var(--cream)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-shield-alt" />
              <span>تأكيد الطلب</span>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '8px', fontSize: '1rem' }}>{formatPrice(totalPrice)}</span>
          </button>
          
          <button className={styles.clearBtn} onClick={clearCart}>
            إفراغ السلة
          </button>

          <p className={styles.orderNote}>
            <i className="fas fa-info-circle" /> يتم حساب رسوم التوصيل بدقة في صفحة الدفع.
          </p>
        </div>
      </div>
    </div>
  );
}
