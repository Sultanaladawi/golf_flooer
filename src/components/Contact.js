import { useState } from 'react';
import { Star } from 'lucide-react';
import { shopInfo } from '../data/shopData';
import { useReveal } from '../hooks/useReveal';
import { useLanguage } from '../context/LanguageContext';
import styles from './Contact.module.css';

const validate = {
  name:    v => v.trim().length < 2   ? 'يرجى إدخال اسمكِ الكريم.' : '',
  email:   v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'يرجى إدخال بريد إلكتروني صالح.' : '',
  message: v => v.trim().length < 10  ? 'مضمون الرسالة قصير جداً (10 أحرف كحد أدنى).' : '',
};

export default function Contact() {
  const { t, currentLang } = useLanguage();
  const [infoRef, infoVis] = useReveal();
  const [formRef, formVis] = useReveal();

  const [formType, setFormType] = useState('message'); // 'message' or 'review'
  const [rating, setRating] = useState(5);
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const change = e => {
    const { name, value } = e.target;
    setFields(p => ({ ...p, [name]: value }));
    if (touched[name] && validate[name]) {
      setErrors(p => ({ ...p, [name]: validate[name](value) }));
    }
  };

  const blur = e => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    if (validate[name]) {
      setErrors(p => ({ ...p, [name]: validate[name](value) }));
    }
  };

  const submit = async e => {
    e.preventDefault();
    let errs = {};
    if (formType === 'message') {
      errs = {
        name: validate.name(fields.name),
        email: validate.email(fields.email),
        message: validate.message(fields.message)
      };
    } else {
      errs = {
        message: fields.message.trim().length < 5 ? 'مضمون التقييم قصير جداً (5 أحرف كحد أدنى).' : ''
      };
    }
    setErrors(errs);
    
    if (formType === 'message') {
      setTouched({ name: true, email: true, message: true });
    } else {
      setTouched({ message: true });
    }

    if (!Object.values(errs).every(x => !x)) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      if (formType === 'message') {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fields.name.trim(),
            email: fields.email.trim(),
            message: fields.message.trim(),
          }),
        });

        if (!response.ok) throw new Error('حدث خطأ في الإرسال');
      } else {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: fields.name.trim() || 'عميلة زهرة بيسان',
            comment: fields.message.trim(),
            rating: rating,
            productName: 'تقييم عام للمتجر'
          }),
        });

        if (!response.ok) throw new Error('حدث خطأ في تقديم التقييم');
      }
      
      setDone(true);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'تعذر الإرسال حالياً. يُرجى المحاولة لاحقاً.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.section} id="contact" style={{ direction: currentLang.dir || 'rtl' }}>
      <div className="section-wrap">
        <div className={styles.inner}>
          
          <div ref={infoRef} className={`${styles.info} reveal ${infoVis ? 'vis' : ''}`} style={{ textAlign: currentLang.dir === 'ltr' ? 'left' : 'right' }}>
            <div className="label" style={{ color: 'var(--gold)' }}>{t('contactBadge')}</div>
            <div className="divider" style={{ background: 'var(--gold)' }} />
            <h2 className="h2" style={{ color: 'var(--espresso)' }}>{t('contactTitle')}</h2>
            <p className={styles.infoDesc} style={{ color: 'var(--espresso-mid)' }}>
              {t('contactDescription')}
            </p>

            <div className={styles.contactDetails} style={{ display: 'flex', flexDirection: 'column', gap: '22px', margin: '30px 0' }}>
               <div className={styles.detailItem} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <i className="fas fa-globe" style={{ color: 'var(--gold, #c5a880)', fontSize: '1.25rem', marginTop: '4px' }} />
                  <div>
                    <strong style={{ color: 'var(--espresso, #2c1d11)', fontSize: '1.02rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>{t('globalBoutique')}</strong>
                    <p style={{ color: 'var(--espresso, #2c1d11)', fontSize: '0.92rem', fontWeight: 700, margin: 0, opacity: 0.9 }}>{t('globalBoutiqueDesc')}</p>
                  </div>
               </div>
               <div className={styles.detailItem} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <i className="fas fa-envelope" style={{ color: 'var(--gold, #c5a880)', fontSize: '1.25rem', marginTop: '4px' }} />
                  <div>
                    <strong style={{ color: 'var(--espresso, #2c1d11)', fontSize: '1.02rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>{t('emailContact')}</strong>
                    <a 
                      href={`mailto:${shopInfo.email}`} 
                      style={{ color: 'var(--espresso, #2c1d11)', fontSize: '0.92rem', fontWeight: 700, margin: 0, textDecoration: 'none', direction: 'ltr', display: 'inline-block', transition: 'color 0.25s ease' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--gold, #b8966c)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--espresso, #2c1d11)'}
                    >
                      {shopInfo.email}
                    </a>
                  </div>
               </div>
               <div className={styles.detailItem} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <i className="fab fa-instagram" style={{ color: 'var(--gold, #c5a880)', fontSize: '1.25rem', marginTop: '4px' }} />
                  <div>
                    <strong style={{ color: 'var(--espresso, #2c1d11)', fontSize: '1.02rem', fontWeight: 800, display: 'block', marginBottom: '4px' }}>Instagram</strong>
                    <a 
                      href={shopInfo.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: 'var(--espresso, #2c1d11)', fontSize: '0.92rem', fontWeight: 700, margin: 0, textDecoration: 'none', direction: 'ltr', display: 'inline-block', fontFamily: 'system-ui, sans-serif', transition: 'color 0.25s ease' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--gold, #b8966c)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--espresso, #2c1d11)'}
                    >
                      {shopInfo.instagramHandle}
                    </a>
                  </div>
               </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 20px', borderRadius: '20px', background: 'var(--gold-glow)', border: '1px solid var(--border)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite', display: 'inline-block' }} />
              <span style={{ fontWeight: '700', color: 'var(--espresso)', fontSize: '0.9rem' }}>{t('online247')}</span>
            </div>
          </div>

          <div ref={formRef} className={`${styles.formWrap} reveal ${formVis ? 'vis' : ''}`}>
            {!done ? (
              <form onSubmit={submit} noValidate style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: 'var(--bg-base)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <button 
                    type="button" 
                    onClick={() => { setFormType('message'); setSubmitError(''); }} 
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: formType === 'message' ? 'var(--gold)' : 'transparent', color: formType === 'message' ? '#000' : 'var(--espresso-dim)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {t('contactUs')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setFormType('review'); setSubmitError(''); }} 
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: formType === 'review' ? 'var(--gold)' : 'transparent', color: formType === 'review' ? '#000' : 'var(--espresso-dim)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {t('storeReviewTab')}
                  </button>
                </div>

                <h3 className={styles.formTitle} style={{ color: 'var(--espresso)', textAlign: currentLang.dir === 'ltr' ? 'left' : 'right', marginBottom: '20px' }}>
                  {formType === 'message' ? t('sendMessageTitle') : t('storeReviewTab')}
                </h3>
                
                <div className={styles.fg} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: currentLang.dir === 'ltr' ? 'left' : 'right' }}>
                  <label htmlFor="name" style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem' }}>
                    {t('fullNameLabel')}
                  </label>
                  <input
                    id="name" name="name" type="text" placeholder={t('namePlaceholder')}
                    value={fields.name} onChange={change} onBlur={blur}
                    className={errors.name && formType === 'message' ? styles.er : ''}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--espresso)', padding: '12px 15px', borderRadius: '10px', outline: 'none', textAlign: currentLang.dir === 'ltr' ? 'left' : 'right' }}
                  />
                  {errors.name && formType === 'message' && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.name}</span>}
                </div>

                {formType === 'message' && (
                  <div className={styles.fg} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: currentLang.dir === 'ltr' ? 'left' : 'right' }}>
                    <label htmlFor="email" style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem' }}>{t('emailLabel')}</label>
                    <input
                      id="email" name="email" type="email" placeholder="you@example.com"
                      value={fields.email} onChange={change} onBlur={blur}
                      className={errors.email ? styles.er : ''}
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--espresso)', padding: '12px 15px', borderRadius: '10px', outline: 'none', textAlign: currentLang.dir === 'ltr' ? 'left' : 'right' }}
                    />
                    {errors.email && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.email}</span>}
                  </div>
                )}

                {formType === 'review' && (
                  <div className={styles.fg} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: 'right' }}>
                    <label style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem' }}>تقييمكِ بالنجوم</label>
                    <div style={{ display: 'flex', gap: '6px', direction: 'rtl', justifyContent: 'flex-start' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                          <Star size={26} fill={s <= rating ? 'var(--gold)' : 'none'} stroke={s <= rating ? 'var(--gold)' : 'var(--espresso-dim)'} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.fg} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px', textAlign: 'right' }}>
                  <label htmlFor="message" style={{ color: 'var(--espresso-dim)', fontSize: '0.85rem' }}>
                    {formType === 'message' ? 'نص الرسالة' : 'رأيكِ وتجربتكِ'}
                  </label>
                  <textarea
                    id="message" name="message" rows={5}
                    placeholder={formType === 'message' ? 'كيف يمكننا مساعدتكِ؟' : 'اكتبي رأيكِ هنا...'}
                    value={fields.message} onChange={change} onBlur={blur}
                    className={errors.message ? styles.er : ''}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--espresso)', padding: '12px 15px', borderRadius: '10px', outline: 'none', textAlign: 'right' }}
                  />
                  {errors.message && <span style={{ color: '#ef4444', fontSize: '0.78rem' }}>{errors.message}</span>}
                </div>

                {submitError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px' }}>{submitError}</p>}

                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', display: 'flex', justifyContent: 'center', background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>
                  {submitting ? 'جاري الإرسال...' : (formType === 'message' ? 'إرسال الرسالة' : 'إرسال التقييم')}
                </button>
              </form>
            ) : (
              <div className={styles.success} style={{ background: 'var(--bg-card)', padding: '50px 30px', borderRadius: '24px', textAlign: 'center', border: '1px solid var(--gold)' }}>
                <div className={styles.successIcon} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gold-glow)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.5rem' }}>
                  <i className="fas fa-check" />
                </div>
                <h3 style={{ color: 'var(--espresso)', fontSize: '1.5rem', marginBottom: '10px' }}>
                  {formType === 'message' ? 'تم استلاف رسالتكِ بنجاح' : 'شكراً لتقييمكِ الجميل!'}
                </h3>
                <p style={{ color: 'var(--espresso-mid)', fontSize: '0.95rem' }}>
                  {formType === 'message' 
                    ? 'نشكركِ على تواصلكِ معنا، وسنقوم بالرد عليكِ في أقرب وقت ممكن.' 
                    : 'يسعدنا جداً مشاركتكِ لرأيكِ، ويساعدنا ذلك على تقديم الأفضل دائماً لعشاق زهرة بيسان.'}
                </p>
                <button 
                  type="button" 
                  onClick={() => { setDone(false); setFields({ name: '', email: '', message: '' }); setRating(5); }} 
                  style={{ marginTop: '20px', background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {formType === 'message' ? 'إرسال رسالة أخرى' : 'كتابة تقييم آخر'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}