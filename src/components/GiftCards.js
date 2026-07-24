import React, { useState } from 'react';
import { Gift, CreditCard, CheckCircle2 } from 'lucide-react';

export default function GiftCards() {
  const [amount, setAmount] = useState(20);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [step, setStep] = useState('form'); // form, processing, success
  const [error, setError] = useState('');

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!buyerEmail || !recipientEmail) {
      setError('يرجى تعبئة البريد الإلكتروني للمشتري والمستلم');
      return;
    }
    
    setStep('processing');
    setError('');

    try {
      // Fake Stripe/Visa Payment Delay
      await new Promise(r => setTimeout(r, 2000));

      const res = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          buyerEmail,
          recipientEmail,
          message
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setStep('success');
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إتمام عملية الشراء');
      setStep('form');
    }
  };

  return (
    <div style={{ padding: '60px 20px', minHeight: '80vh', backgroundColor: 'var(--bg-surface)', direction: 'rtl' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' } }}>
        
        <div style={{ background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dim) 100%)', padding: '40px', color: 'var(--espresso)', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Gift size={60} style={{ margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontFamily: 'var(--font-primary)' }}>بطاقات الهدايا</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>أرسل لمن تحب هدية الأناقة والفخامة من زهرة بيسان</p>
          <div style={{ marginTop: '30px', fontSize: '3rem', fontWeight: 'bold' }}>{amount} JOD</div>
        </div>

        <div style={{ padding: '40px', flex: 1.5 }}>
          {step === 'success' ? (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
              <CheckCircle2 size={60} color="#27ae60" style={{ margin: '0 auto 20px' }} />
              <h2 style={{ color: 'var(--espresso)', marginBottom: '15px' }}>تم الشراء بنجاح!</h2>
              <p style={{ color: 'var(--text-secondary)' }}>تم إرسال بطاقة الهدية عبر البريد الإلكتروني إلى {recipientEmail}.</p>
              <button onClick={() => {setStep('form'); setRecipientEmail(''); setMessage('');}} style={{ marginTop: '30px', padding: '15px 30px', background: 'var(--gold)', color: 'var(--espresso)', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>شراء بطاقة أخرى</button>
            </div>
          ) : (
            <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--espresso)' }}>قيمة الهدية</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[10, 20, 50, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      style={{ 
                        flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--gold)',
                        background: amount === val ? 'var(--gold)' : 'transparent',
                        color: amount === val ? 'var(--espresso)' : 'var(--gold-dim)',
                        fontWeight: 'bold', cursor: 'pointer', transition: '0.2s'
                      }}
                    >
                      {val} JOD
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--espresso)' }}>بريدك الإلكتروني (لإيصال الدفع)</label>
                <input required type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', direction: 'ltr', textAlign: 'right' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--espresso)' }}>بريد المُهدى إليه</label>
                <input required type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="friend@email.com" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', direction: 'ltr', textAlign: 'right' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--espresso)' }}>رسالة الهدية (اختياري)</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="اكتب رسالة تهنئة جميلة..." rows={3} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', resize: 'vertical' }} />
              </div>

              {error && <div style={{ color: '#dc3545', padding: '10px', background: 'rgba(220,53,69,0.1)', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}

              <button 
                type="submit" 
                disabled={step === 'processing'}
                style={{ 
                  marginTop: '10px', padding: '18px', background: 'var(--espresso)', color: 'var(--gold)', 
                  border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: step === 'processing' ? 0.7 : 1
                }}
              >
                {step === 'processing' ? 'جاري الدفع...' : <><CreditCard size={20} /> دفع {amount} JOD عبر البطاقة (Visa/MasterCard)</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
