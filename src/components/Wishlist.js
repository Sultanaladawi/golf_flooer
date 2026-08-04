import { useEffect } from 'react';
import { Heart, X, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Wishlist({ isOpen, onClose }) {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { format } = useCurrency();

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen && wishlist.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.35s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999,
        width: '100%', maxWidth: '480px',
        background: 'linear-gradient(160deg, #1a1209 0%, #0f0a04 100%)',
        borderLeft: '1px solid rgba(196,164,132,0.2)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
        transform: isOpen ? 'translateX(0)' : 'translateX(110%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', 'Noto Sans Arabic', sans-serif",
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '28px 28px 20px',
          borderBottom: '1px solid rgba(196,164,132,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'rgba(196,164,132,0.12)',
              border: '1px solid rgba(196,164,132,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={20} fill="#c4a484" color="#c4a484" />
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#f5ede0', fontSize: '1.3rem', fontWeight: 700, direction: 'rtl' }}>
                قائمة الأمنيات
              </h2>
              {wishlist.length > 0 && (
                <p style={{ margin: 0, color: '#c4a484', fontSize: '0.8rem' }}>
                  {wishlist.length} {wishlist.length === 1 ? 'منتج' : 'منتجات'}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#f5ede0', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {wishlist.length === 0 ? (
            /* Empty State */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '60px 20px',
              textAlign: 'center', gap: '20px',
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(196,164,132,0.08)',
                border: '1px solid rgba(196,164,132,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Heart size={32} color="rgba(196,164,132,0.4)" />
              </div>
              <div>
                <p style={{ color: '#f5ede0', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px', direction: 'rtl' }}>
                  قائمة الأمنيات فارغة
                </p>
                <p style={{ color: 'rgba(245,237,224,0.5)', fontSize: '0.9rem', margin: 0, direction: 'rtl' }}>
                  أضف المنتجات التي تعجبك بالضغط على أيقونة القلب ❤️
                </p>
              </div>
            </div>
          ) : (
            wishlist.map((item) => (
              <div key={item.id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(196,164,132,0.12)',
                borderRadius: '16px', padding: '16px',
                display: 'flex', gap: '14px', alignItems: 'center',
                transition: 'border-color 0.2s ease',
                direction: 'rtl',
              }}>
                {/* Image */}
                <div style={{
                  width: '80px', height: '95px', borderRadius: '12px',
                  overflow: 'hidden', flexShrink: 0,
                  background: 'rgba(196,164,132,0.08)',
                }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/12.png'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart size={24} color="rgba(196,164,132,0.3)" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: '0 0 6px', color: '#f5ede0', fontWeight: 600,
                    fontSize: '0.95rem', lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.name}
                  </p>
                  {item.category && (
                    <p style={{ margin: '0 0 8px', color: '#c4a484', fontSize: '0.75rem' }}>
                      {item.category}
                    </p>
                  )}
                  <p style={{ margin: '0 0 14px', color: '#c4a484', fontSize: '1rem', fontWeight: 700 }}>
                    {item.priceNum ? format(item.priceNum) : item.price || '—'}
                  </p>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => { addItem({ ...item, qty: 1 }); }}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #c4a484, #a0845c)',
                        border: 'none', color: '#1a1209',
                        fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      <ShoppingBag size={14} /> أضف للسلة
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div style={{
            padding: '20px 28px 28px',
            borderTop: '1px solid rgba(196,164,132,0.15)',
          }}>
            <button
              onClick={clearWishlist}
              style={{
                width: '100%', padding: '14px',
                borderRadius: '12px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
                fontWeight: 600, fontSize: '0.9rem',
                cursor: 'pointer', direction: 'rtl',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              <Trash2 size={16} /> مسح القائمة بالكامل
            </button>
          </div>
        )}
      </div>
    </>
  );
}
