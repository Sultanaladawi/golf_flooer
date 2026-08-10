import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useLanguage } from '../context/LanguageContext';
import styles from './Cart.module.css';

export default function Cart({ isOpen, onClose, onCheckout }) {
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [hidePrice, setHidePrice] = useState(true);

  const { t } = useLanguage();

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
              <h2 className={styles.drawerTitle}>{t('cart')}</h2>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label={t('closeLabel')}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-shopping-bag" style={{ color: 'var(--gold-dim)', filter: 'drop-shadow(0 10px 20px var(--shadow-sm))' }} />
            </div>
            <p className={styles.emptyTitle}>{t('emptyCart')}</p>
            <p className={styles.emptyDesc}>{t('emptyCartDesc')}</p>
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
              {t('startShopping')}
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
            <h2 className={styles.drawerTitle}>{t('cart')}</h2>
            <span className={styles.itemCount}>{totalItems} {totalItems === 1 ? t('piece') : t('pieces')}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t('closeLabel')}>
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
                          {t('sizeLabel')}: {item.size}
                        </div>
                      )}
                      <div className={styles.itemUnit} style={{ color: '#888' }}>{formatPrice(item.priceNum)}</div>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.id)}
                      aria-label={`${t('removeItem')} ${item.name}`}
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
          border: '1px solid rgba(197, 163, 106, 0.3)'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 800, color: 'var(--espresso)', fontSize: '0.88rem' }}>
            <input 
              type="checkbox"
              checked={isGift}
              onChange={e => setIsGift(e.target.checked)}
              style={{ accentColor: 'var(--gold, #c5a36a)', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>{t('sendAsGift')}</span>
          </label>
          
          {isGift && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeInUp 0.3s ease' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--espresso-dim)', margin: 0, lineHeight: 1.5 }}>
                {t('giftDesc')}
              </p>
              <textarea
                placeholder={t('giftMsgPlaceholder')}
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
                <span>{t('hidePrices')}</span>
              </label>
            </div>
          )}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>{t('subtotal')}</span>
            <span>{formatPrice(subTotal)}</span>
          </div>
          {isBundleApplied && (
            <div className={styles.summaryRow} style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
              <span><i className="fas fa-tags" /> {t('bundleDiscountLabel')}</span>
              <span>- {formatPrice(bundleDiscount)}</span>
            </div>
          )}
          <div className={styles.summaryRow}>
            <span>{t('deliveryFee')}</span>
            <span style={{ color: 'var(--espresso)' }}>{t('calcAtCheckout')}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>{t('totalLabel')}</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          <button className={styles.checkoutBtn} onClick={() => customer ? onCheckout() : openLoginModal(onCheckout)} style={{ background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)', border: 'none', color: '#ffffff', boxShadow: '0 6px 20px rgba(197, 168, 128, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fas fa-shield-alt" />
              <span>{t('confirmOrder')}</span>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '8px', fontSize: '1rem' }}>{formatPrice(totalPrice)}</span>
          </button>
          
          <button className={styles.clearBtn} onClick={clearCart}>
            {t('clearCart')}
          </button>

          <p className={styles.orderNote}>
            <i className="fas fa-info-circle" /> {t('deliveryNoteCart')}
          </p>
        </div>
      </div>
    </div>
  );
}

