"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import styles from './CartDrawer.module.css';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal, currency } = useAppContext();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const getPriceSymbol = () => {
    switch (currency) {
      case 'SAR': return 'ر.س';
      case 'AED': return 'د.إ';
      default: return 'د.أ';
    }
  };

  const getCurrencyMultiplier = () => {
    switch (currency) {
      case 'SAR': return 5.3;
      case 'AED': return 5.2;
      default: return 1.0;
    }
  };

  const multiplier = getCurrencyMultiplier();
  const subtotal = cartTotal * multiplier;

  const handleCheckoutClick = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={onClose}
      />

      {/* Sliding Drawer Container */}
      <div 
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="سلة المشتريات"
      >
        <div className={styles.header}>
          <h2>سلة التسوق</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق السلة">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.itemsList}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>حقيبتك فارغة حالياً</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <img src={item.image} alt={item.name} />
                </div>

                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <div className={styles.itemPrice}>
                    {(item.price * multiplier).toFixed(1)} {getPriceSymbol()}
                  </div>
                  
                  <div className={styles.qtyWrapper}>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="تقليل الكمية"
                    >
                      -
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button 
                      className={styles.qtyBtn} 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  className={styles.removeBtn} 
                  onClick={() => removeFromCart(item.id)}
                  aria-label="حذف من السلة"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span>المجموع الفرعي:</span>
              <span className={styles.subtotalPrice}>
                {subtotal.toFixed(1)} {getPriceSymbol()}
              </span>
            </div>
            
            <div className={styles.actions}>
              <button 
                onClick={handleCheckoutClick}
                className="btn-primary" 
                style={{ width: '100%', textAlign: 'center' }}
              >
                معاينة السلة والدفع
              </button>
              
              <button 
                onClick={onClose}
                className="btn-secondary" 
                style={{ width: '100%', textAlign: 'center' }}
              >
                <span>متابعة التسوق</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
