import { useState } from 'react';
import { shopInfo } from '../data/shopData';
import { useReveal } from '../hooks/useReveal';
import styles from './Contact.module.css';

const validate = {
  name:    v => v.trim().length < 2   ? 'يرجى إدخال اسمكِ الكريم.' : '',
  email:   v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'يرجى إدخال بريد إلكتروني صالح.' : '',
  message: v => v.trim().length < 10  ? 'مضمون الرسالة قصير جداً (10 أحرف كحد أدنى).' : '',
};

export default function Contact() {
  const [infoRef, infoVis] = useReveal();
  const [formRef, formVis] = useReveal();

  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const change = e => {
    const { name, value } = e.target;
    setFields(p => ({ ...p, [name]: value }));
    if (touched[name]) setErrors(p => ({ ...p, [name]: validate[name](value) }));
  };

  const blur = e => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validate[name](value) }));
  };

  const submit = async e => {
    e.preventDefault();
    const errs = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, validate[k](v)]));
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });
    if (!Object.values(errs).every(x => !x)) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setDone(true);
    } catch (error) {
      console.error('Contact submit error:', error);
      setSubmitError('حدث خطأ ما. يرجى إعادة المحاولة لاحقاً أو مراسلتنا بالبريد الإلكتروني.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.contact} id="contact" style={{ direction: 'rtl', background: 'var(--cream-dark)' }}>
      <div className="section-wrap">
        <div className={styles.inner}>
          
          <div ref={infoRef} className={`${styles.info} reveal ${infoVis ? 'vis' : ''}`} style={{ textAlign: 'right' }}>
            <div className="label" style={{ color: 'var(--gold)' }}>اتصلي بنا</div>
            <div className="divider" style={{ background: 'var(--gold)' }} />
            <h2 className="h2" style={{ color: 'var(--espresso)' }}>يسعدنا تواصلكِ معنا</h2>
            <p className={styles.infoDesc} style={{ color: 'var(--espresso-mid)' }}>
              يافا اونلاين — متجر عالمي يصل إلى جميع دول العالم. تواصلي معنا عبر البريد الإلكتروني وسنرد عليكِ في أقرب وقت.
            </p>

            <div className={styles.contactDetails} style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '30px 0' }}>
               <div className={styles.detailItem} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <i className="fas fa-globe" style={{ color: 'var(--gold)', fontSize: '1.2rem', marginTop: '4px' }} />
                  <div>
                    <strong style={{ color: 'var(--espresso)', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>متجر عالمي</strong>
                    <p style={{ color: 'var(--espresso-dim)', margin: 0 }}>نشحن لجميع دول العالم — تسوقي بلا حدود</p>
                  </div>
               </div>
               <div className={styles.detailItem} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <i className="fas fa-envelope" style={{ color: 'var(--gold)', fontSize: '1.2rem', marginTop: '4px' }} />
                  <div>
                    <strong style={{ color: 'var(--espresso)', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>البريد الإلكتروني</strong>
                    <p style={{ color: 'var(--espresso-dim)', margin: 0 }}>{shopInfo.email}</p>
                  </div>
               </div>
               <div className={styles.detailItem} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <i className="fab fa-instagram" style={{ color: 'var(--gold)', fontSize: '1.2rem', marginTop: '4px' }} />
                  <div>
                    <strong style={{ color: 'var(--espresso)', fontSize: '1rem', display: 'block', marginBottom: '4px' }}>Instagram</strong>
                    <a href={shopInfo.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-dim)', margin: 0, textDecoration: 'none' }}>{shopInfo.instagramHandle}</a>
                  </div>
               </div>
            </div>

            {/* 24/7 Online badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '20px', background: 'var(--gold-glow)', border: '1px solid var(--border)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              <span style={{ fontWeight: '700', color: 'var(--espresso)', fontSize: '0.9rem' }}>متاح دائماً — 24/7 Online</span>
            </div>
          </div>

          <div ref={formRef} className={`${styles.formWrap} reveal ${formVis ? 'vis' : ''}`}>
            {!done ? (
              <form onSubmit={submit} noValidate style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <h3 className={styles.formTitle} style={{ color: 'var(--espresso)', textAlign: 'right', marginBottom: '20px' }}>أرسلي لنا رسالة</h3>
                
                <div className={styles.fg} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'right' }}>
                  <label htmlFor="name" style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem' }}>الاسم الكريم</label>
                  <input
                    id="name" name="name" type="text" placeholder="مثال: سارة أحمد"
                    value={fields.name} onChange={change} onBlur={blur}
                    className={errors.name ? styles.er : ''}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--espresso)', padding: '12px 15px', borderRadius: '10px', outline: 'none', textAlign: 'right' }}
                  />
                  {errors.name && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.name}</span>}
                </div>

                <div className={styles.fg} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'right' }}>
                  <label htmlFor="email" style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem' }}>البريد الإلكتروني</label>
                  <input
                    id="email" name="email" type="email" placeholder="you@example.com"
                    value={fields.email} onChange={change} onBlur={blur}
                    className={errors.email ? styles.er : ''}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--espresso)', padding: '12px 15px', borderRadius: '10px', outline: 'none', textAlign: 'right' }}
                  />
                  {errors.email && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.email}</span>}
                </div>

                <div className={styles.fg} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px', textAlign: 'right' }}>
                  <label htmlFor="message" style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem' }}>نص الرسالة</label>
                  <textarea
                    id="message" name="message" rows={5}
                    placeholder="كيف يمكننا مساعدتكِ؟"
                    value={fields.message} onChange={change} onBlur={blur}
                    className={errors.message ? styles.er : ''}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--espresso)', padding: '12px 15px', borderRadius: '10px', outline: 'none', textAlign: 'right' }}
                  />
                  {errors.message && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.message}</span>}
                </div>

                {submitError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px' }}>{submitError}</p>}

                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', display: 'flex', justifyContent: 'center', background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>
                  {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </form>
            ) : (
              <div className={styles.success} style={{ background: 'var(--bg-card)', padding: '50px 30px', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--gold)' }}>
                <div className={styles.successIcon} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gold-glow)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.5rem' }}>
                  <i className="fas fa-check" />
                </div>
                <h3 style={{ color: 'var(--espresso)', fontSize: '1.5rem', marginBottom: '10px' }}>تم استلام رسالتكِ بنجاح</h3>
                <p style={{ color: 'var(--espresso-mid)', fontSize: '0.95rem' }}>نشكركِ على تواصلكِ معنا، وسنقوم بالرد عليكِ في أقرب وقت ممكن.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}