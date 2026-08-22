import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Grid, ShoppingBag, Heart, PackageSearch } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';

export default function MobileBottomBar({ onOpenCart, onOpenWishlist, onOpenTracking }) {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { t } = useLanguage();

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'calc(62px + env(safe-area-inset-bottom, 0px))',
      backgroundColor: 'rgba(18, 14, 10, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(212, 175, 55, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 9999,
      padding: '0 8px',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.5)'
    }} className="mobile-bottom-bar-wrapper">
      
      {/* Home */}
      <a href="/#home" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        color: '#c5a880',
        textDecoration: 'none',
        flex: 1,
        fontSize: '0.7rem',
        fontWeight: 600
      }}>
        <Home size={20} color="#c5a880" />
        <span>{t('home')}</span>
      </a>

      {/* Collection */}
      <a href="/#collection" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        color: '#c5a880',
        textDecoration: 'none',
        flex: 1,
        fontSize: '0.7rem',
        fontWeight: 600
      }}>
        <Grid size={20} color="#c5a880" />
        <span>{t('collection')}</span>
      </a>

      {/* Cart (Center Action with Badge) */}
      <button onClick={() => navigate('/cart')} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        color: '#ffffff',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        flex: 1,
        fontSize: '0.7rem',
        fontWeight: 600,
        position: 'relative'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
          marginTop: '-18px',
          position: 'relative'
        }}>
          <ShoppingBag size={21} color="#000000" />
          {totalItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#e63946',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #120e0a'
            }}>
              {totalItems}
            </span>
          )}
        </div>
        <span style={{ color: '#d4af37', marginTop: '2px' }}>{t('cart')}</span>
      </button>

      {/* Wishlist */}
      <button onClick={onOpenWishlist} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        color: '#c5a880',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        flex: 1,
        fontSize: '0.7rem',
        fontWeight: 600,
        position: 'relative'
      }}>
        <Heart size={20} color="#c5a880" />
        {wishlist.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '24%',
            backgroundColor: '#d4af37',
            color: '#000',
            fontSize: '0.6rem',
            fontWeight: 800,
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {wishlist.length}
          </span>
        )}
        <span>{t('wishlist')}</span>
      </button>

      {/* Track Order */}
      <button onClick={onOpenTracking} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        color: '#c5a880',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        flex: 1,
        fontSize: '0.7rem',
        fontWeight: 600
      }}>
        <PackageSearch size={20} color="#c5a880" />
        <span>{t('trackOrder')}</span>
      </button>

    </div>
  );
}

