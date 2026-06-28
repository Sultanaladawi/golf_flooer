import { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, Package, Truck, Clock, HelpCircle, Loader2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function OrderTracking({ isOpen, onClose }) {
  const [orderId, setOrderId] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);
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

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    
    setLoading(true);
    setError('');
    setOrderData(null);

    // Clean order id (e.g. #ORD-9920 or ORD9920 or just 9920 -> 9920)
    const cleanId = orderId.replace(/[^0-9]/g, '');

    try {
      const res = await fetch(`/api/orders/${cleanId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('الطلب غير موجود. يرجى التأكد من رقم الطلب الصحيح.');
        } else {
          throw new Error('حدث خطأ أثناء البحث عن الطلب. يرجى المحاولة لاحقاً.');
        }
      }
      const data = await res.json();
      
      // If user provided email, verify it matches
      if (searchEmail.trim() && data.email && searchEmail.trim().toLowerCase() !== data.email.toLowerCase()) {
        throw new Error('البريد الإلكتروني المدخل لا يتطابق مع هذا الطلب.');
      }
      
      setOrderData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Determine current active step in timeline
  // Statuses usually: pending, preparing, ready, completed
  const getActiveStep = (status) => {
    const s = String(status || 'pending').toLowerCase();
    if (s === 'pending') return 1; // Order Received
    if (s === 'preparing') return 2; // In preparation
    if (s === 'ready') return 3; // Out for Delivery / Shipped
    if (s === 'completed') return 4; // Delivered
    return 1;
  };

  const activeStep = orderData ? getActiveStep(orderData.status) : 0;

  const steps = [
    { label: 'تم استلام الطلب', desc: 'تم تلقي طلبك وتأكيد الدفع بنجاح.', icon: <Clock size={20} /> },
    { label: 'قيد التحضير والتطريز', desc: 'جاري حياكة وتجهيز طلبك الفاخر بكل حب.', icon: <Package size={20} /> },
    { label: 'شُحن / جاهز للتوصيل', desc: 'تم تسليم الشحنة لشركة التوصيل في طريقها إليك.', icon: <Truck size={20} /> },
    { label: 'تم التوصيل', desc: 'تم تسليم الشحنة بنجاح. تتهني فيها يا رب! ❤️', icon: <CheckCircle2 size={20} /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          animation: 'fadeIn 0.3s ease forwards'
        }}
      />

      {/* Modal Container */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 9999, width: '90%', maxWidth: '600px', maxHeight: '90vh',
        background: 'linear-gradient(160deg, #1a1209 0%, #0f0a04 100%)',
        border: '1px solid rgba(196,164,132,0.25)',
        borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        fontFamily: "'Inter', 'Noto Sans Arabic', sans-serif",
        direction: 'rtl',
        animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', borderBottom: '1px solid rgba(196,164,132,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Truck size={24} color="#c4a484" />
            <h2 style={{ margin: 0, color: '#f5ede0', fontSize: '1.25rem', fontWeight: 700 }}>تتبع حالة طلبكِ</h2>
          </div>
          <button onClick={onClose} style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#f5ede0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Form / Search Block */}
        <div style={{ padding: '28px' }}>
          {!orderData ? (
            <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ color: 'rgba(245,237,224,0.7)', fontSize: '0.9rem', margin: '0 0 8px', lineHeight: 1.6 }}>
                أدخلي رقم طلبكِ (الذي يبدأ بـ ORD) والبريد الإلكتروني لتتبع حالة الشحن والتجهيز مباشرة.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#c4a484', fontWeight: 600 }}>رقم الطلب *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" required
                    placeholder="مثال: ORD-9920"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,164,132,0.2)',
                      color: '#f5ede0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  <Search size={18} color="rgba(196,164,132,0.5)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: '#c4a484', fontWeight: 600 }}>البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  placeholder="البريد المستخدم عند إتمام الطلب"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,164,132,0.2)',
                    color: '#f5ede0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {error && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #c4a484, #a0845c)',
                  border: 'none', color: '#1a1209', fontWeight: 700, fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'opacity 0.25s ease', marginTop: '10px'
                }}
              >
                {loading ? <Loader2 size={18} className="spin-animation" /> : <Search size={18} />}
                تتبع حالة الطلب
              </button>
            </form>
          ) : (
            /* Order Tracking Result Visuals */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Order Info Summary */}
              <div style={{ padding: '18px 22px', borderRadius: '16px', background: 'rgba(196,164,132,0.06)', border: '1px solid rgba(196,164,132,0.15)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,224,0.5)', marginBottom: '4px' }}>رقم الطلب</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#c4a484', direction: 'ltr', textAlign: 'right' }}>#ORD-{orderData.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,224,0.5)', marginBottom: '4px' }}>الاسم</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#f5ede0' }}>{orderData.customer_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(245,237,224,0.5)', marginBottom: '4px' }}>المبلغ الإجمالي</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f5ede0' }}>{format(orderData.total_amount)}</div>
                </div>
              </div>

              {/* Status Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingRight: '32px' }}>
                {/* Timeline Line */}
                <div style={{
                  position: 'absolute', top: '10px', bottom: '10px', right: '15px',
                  width: '2px', background: 'rgba(196,164,132,0.15)'
                }} />

                {/* Timeline Steps */}
                {steps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted = stepNum < activeStep;
                  const isActive = stepNum === activeStep;
                  const isFuture = stepNum > activeStep;

                  return (
                    <div key={idx} style={{
                      display: 'flex', gap: '20px', marginBottom: idx === steps.length - 1 ? 0 : '30px',
                      position: 'relative', opacity: isFuture ? 0.45 : 1
                    }}>
                      
                      {/* Timeline Node */}
                      <div style={{
                        position: 'absolute', right: '-32px', top: '2px',
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: isCompleted || isActive ? '#c4a484' : '#1a1209',
                        border: '2px solid #c4a484',
                        color: isCompleted || isActive ? '#1a1209' : '#c4a484',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isActive ? '0 0 15px rgba(196,164,132,0.6)' : 'none',
                        zIndex: 2, transition: 'all 0.3s ease'
                      }}>
                        {step.icon}
                      </div>

                      {/* Content */}
                      <div>
                        <h4 style={{
                          margin: '0 0 4px', fontSize: '1rem', fontWeight: 700,
                          color: isActive ? '#c4a484' : '#f5ede0'
                        }}>
                          {step.label}
                          {isActive && (
                            <span style={{
                              marginRight: '8px', fontSize: '0.75rem', fontWeight: 'bold',
                              background: 'rgba(196,164,132,0.15)', color: '#c4a484',
                              padding: '2px 8px', borderRadius: '8px'
                            }}>
                              قيد المتابعة حالياً
                            </span>
                          )}
                        </h4>
                        <p style={{ margin: 0, color: 'rgba(245,237,224,0.5)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => setOrderData(null)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(196,164,132,0.2)',
                    color: '#f5ede0', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  تتبع طلب آخر
                </button>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #c4a484, #a0845c)', border: 'none',
                    color: '#1a1209', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  حسناً، فهمت
                </button>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: translate(-50%, -45%) scale(0.95); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin-animation {
            animation: spin 1s linear infinite;
          }
        `}</style>
      </div>
    </>
  );
}
