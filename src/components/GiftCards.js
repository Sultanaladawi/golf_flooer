import React, { useState } from 'react';
import { Gift, CreditCard, CheckCircle2, Phone, Send } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function GiftCards() {
  const [amount, setAmount] = useState(50);
  const [buyerContact, setBuyerContact] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const [step, setStep] = useState('form'); // form, processing, success
  const [createdCard, setCreatedCard] = useState(null);
  const [error, setError] = useState('');
  const { format: formatPrice } = useCurrency();

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!recipientPhone.trim()) {
      setError('يرجى إدخال رقم هاتف / واتساب المستلم الدولي');
      return;
    }
    
    setStep('processing');
    setError('');

    try {
      const res = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          buyerContact,
          recipientPhone,
          recipientName: recipientName || 'المستلم العزيز',
          message
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'حدث خطأ في عملية إنشاء بطاقة الهدية');
      
      setCreatedCard(data);
      setStep('success');
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء إتمام عملية الشراء');
      setStep('form');
    }
  };

  const shareOnWhatsApp = () => {
    if (!createdCard) return;
    const cleanPhone = createdCard.recipientPhone?.replace(/\D/g, '');
    const text = `🎁 *بطاقة إهداء ملكية من دار زهرة بيسان* 🎁\n\nأهلاً ${createdCard.recipientName || ''}،\nتم إرسال بطاقة إهداء بقيمة *${createdCard.amount} JOD* خصيصاً لكِ!\n\n🔑 رمز البطاقة الملكي: *${createdCard.code}*\n\n💬 الرسالة: "${createdCard.message || 'مع أطيب التمنيات بإطلالة ملكية ساحرة'}"\n\nتسوقي عبايتكِ المفضلّة عبر موقعنا الرسمى.`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ padding: '90px 20px 80px', minHeight: '90vh', backgroundColor: 'var(--cream, #faf7f2)', direction: 'rtl', fontFamily: "'DM Sans', 'Inter', 'Cairo', sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', borderRadius: '30px', background: 'rgba(197, 168, 128, 0.12)', border: '1px solid rgba(197, 168, 128, 0.3)', color: 'var(--gold-dim, #a6865d)', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px' }}>
            <Gift size={16} />
            <span>بطاقات الإهداء الملكية</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--espresso, #1a1a1a)', margin: '0 0 10px' }}>
            بطاقة إهداء زهرة بيسان
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--espresso-dim, #665544)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
            أهدِ من تحبين بطاقة تسوق فاخرة تتيح لها اختيار عبايتها المفضلّة، وسيتم تسليم البطاقة الملكية مباشرة عبر الواتساب الدولي.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          
          {/* 👑 Physical Royal Gift Card Graphic Preview */}
          <div style={{
            background: 'linear-gradient(135deg, #1f1a14 0%, #3a2e21 50%, #1f1a14 100%)',
            borderRadius: '24px',
            padding: '35px 30px',
            color: '#faf8f5',
            border: '1.5px solid rgba(197, 168, 128, 0.45)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '180px', height: '180px', background: 'rgba(197, 168, 128, 0.15)', borderRadius: '50%', filter: 'blur(40px)' }} />

            {/* Store Logo & Branding Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid rgba(197, 168, 128, 0.25)', paddingBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/logo.png" alt="زهرة بيسان" style={{ height: '48px', width: 'auto', borderRadius: '8px', border: '1px solid rgba(197, 168, 128, 0.4)' }} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>زهرة بيسان</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--gold, #c5a880)', letterSpacing: '1px' }}>ROYAL GIFT CARD</span>
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '20px',
                fontSize: '1.2rem',
                fontWeight: 900,
                boxShadow: '0 4px 15px rgba(197, 168, 128, 0.3)'
              }}>
                {amount} JOD
              </div>
            </div>

            {/* Recipient Details */}
            <div style={{ margin: '20px 0', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ opacity: 0.7 }}>إلى الشخص العزيز:</span>
                <strong style={{ color: 'var(--gold, #c5a880)', fontWeight: 800 }}>{recipientName || 'اسم المستلم'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ opacity: 0.7 }}>رقم واتساب المستلم:</span>
                <span style={{ direction: 'ltr', color: '#ffffff', fontWeight: 700 }}>{recipientPhone || '+962 79XXXXXXX'}</span>
              </div>
            </div>

            {/* Printed Message Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px dashed rgba(197, 168, 128, 0.4)',
              borderRadius: '16px',
              padding: '16px',
              margin: '20px 0',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: 1.6,
              minHeight: '70px'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--gold)', display: 'block', marginBottom: '4px', fontWeight: 800 }}>
                ✦ رسالة الإهداء المطبوعة:
              </span>
              {message || 'مع أطيب التمنيات بإطلالة ملكية ساحرة من دار زهرة بيسان...'}
            </div>

            {/* Serial Code & Security Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid rgba(197, 168, 128, 0.2)', fontSize: '0.75rem', opacity: 0.8 }}>
              <span>رمز البطاقة: <strong style={{ color: 'var(--gold)', letterSpacing: '1px' }}>{createdCard?.code || 'BEESAN-VIP-ROYAL'}</strong></span>
              <span>صالحة لمدة عام كامل ✦</span>
            </div>
          </div>

          {/* Form / Purchase Box */}
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(197, 168, 128, 0.25)' }}>
            {step === 'success' ? (
              <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeInUp 0.4s ease' }}>
                <CheckCircle2 size={65} color="var(--gold, #c5a880)" style={{ margin: '0 auto 15px' }} />
                <h2 style={{ color: 'var(--espresso, #1a1a1a)', margin: '0 0 10px', fontSize: '1.6rem' }}>تم إصدار البطاقة بنجاح! ✦</h2>
                <p style={{ color: 'var(--espresso-dim, #665544)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  تم إنشاء بطاقة الإهداء الملكية بقيمة <strong>{createdCard?.amount} JOD</strong> برقم رمز: 
                  <span style={{ display: 'inline-block', background: 'rgba(197, 168, 128, 0.15)', color: 'var(--gold-dim)', padding: '2px 10px', borderRadius: '8px', fontWeight: 900, margin: '0 5px' }}>{createdCard?.code}</span>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '30px' }}>
                  <button
                    onClick={shareOnWhatsApp}
                    style={{
                      padding: '14px 24px',
                      background: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
                    }}
                  >
                    <Send size={18} />
                    <span>مشاركة البطاقة عبر واتساب المستلم المباشر</span>
                  </button>

                  <button
                    onClick={() => { setStep('form'); setRecipientPhone(''); setMessage(''); setRecipientName(''); }}
                    style={{
                      padding: '12px 24px',
                      background: 'none',
                      color: 'var(--gold-dim)',
                      border: '1px solid var(--gold)',
                      borderRadius: '16px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    شراء بطاقة إهداء أخرى
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Amount Selection */}
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 800, color: 'var(--espresso, #1a1a1a)', fontSize: '0.9rem' }}>
                    اختر قيمة بطاقة الإهداء الملكية:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {[25, 50, 100, 200].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        style={{ 
                          padding: '12px 8px',
                          borderRadius: '14px',
                          border: amount === val ? 'none' : '1px solid rgba(197, 168, 128, 0.3)',
                          background: amount === val ? 'linear-gradient(135deg, var(--gold, #c5a880), var(--gold-dim, #a6865d))' : 'var(--bg-card, #fff)',
                          color: amount === val ? '#ffffff' : 'var(--espresso, #1a1a1a)',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: amount === val ? '0 4px 15px rgba(197, 168, 128, 0.3)' : 'none'
                        }}
                      >
                        {val} JOD
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recipient Phone (Primary Required Field) */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 800, color: 'var(--espresso, #1a1a1a)', fontSize: '0.88rem' }}>
                    <Phone size={15} color="var(--gold)" />
                    <span>رقم هاتف / واتساب المُهدى إليه الدولي (مطلوب)</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={recipientPhone}
                    onChange={e => setRecipientPhone(e.target.value)}
                    placeholder="مثال: +962796697413 أو +966500000000"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(197, 168, 128, 0.35)',
                      fontSize: '0.9rem',
                      direction: 'ltr',
                      textAlign: 'right',
                      outline: 'none',
                      background: 'var(--bg-surface, #fff)',
                      color: 'var(--espresso)'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--espresso-dim)', marginTop: '4px', display: 'block' }}>
                    * سيتم إرسال بطاقة الإهداء الملكية مباشرة لـ واتساب المستلم الدولي.
                  </span>
                </div>

                {/* Recipient Name */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800, color: 'var(--espresso, #1a1a1a)', fontSize: '0.88rem' }}>
                    اسم المُهدى إليه (اختياري):
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="أدخلي اسم الشخص العزيز..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(197, 168, 128, 0.35)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: 'var(--bg-surface, #fff)',
                      color: 'var(--espresso)'
                    }}
                  />
                </div>

                {/* Buyer Contact for Receipt */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800, color: 'var(--espresso, #1a1a1a)', fontSize: '0.88rem' }}>
                    رقم هاتف أو بريد المشتري (لإرسال إيصال الدفع):
                  </label>
                  <input
                    type="text"
                    value={buyerContact}
                    onChange={e => setBuyerContact(e.target.value)}
                    placeholder="رقم هاتفكِ أو بريدكِ الإلكتروني..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(197, 168, 128, 0.35)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: 'var(--bg-surface, #fff)',
                      color: 'var(--espresso)'
                    }}
                  />
                </div>

                {/* Gift Message Textarea */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 800, color: 'var(--espresso, #1a1a1a)', fontSize: '0.88rem' }}>
                    رسالة الإهداء الخاصة (تُطبع على البطاقة):
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="اكتبي تهنئة جميلة ليتم طباعتها بنمط كليجرافي فاخر على البطاقة..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(197, 168, 128, 0.35)',
                      fontSize: '0.88rem',
                      resize: 'vertical',
                      outline: 'none',
                      background: 'var(--bg-surface, #fff)',
                      color: 'var(--espresso)'
                    }}
                  />
                </div>

                {error && <div style={{ color: '#dc3545', padding: '10px 14px', background: 'rgba(220,53,69,0.1)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>{error}</div>}

                <button 
                  type="submit" 
                  disabled={step === 'processing'}
                  style={{ 
                    marginTop: '10px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
                    color: '#ffffff', 
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    gap: '10px',
                    boxShadow: '0 6px 20px rgba(197, 168, 128, 0.35)',
                    opacity: step === 'processing' ? 0.7 : 1
                  }}
                >
                  {step === 'processing' ? 'جاري إتمام العملية...' : <><CreditCard size={18} /> إتمام الشراء والتجهيز ({amount} JOD)</>}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
