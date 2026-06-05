import { useState, useEffect } from 'react';
import { useReveal } from '../hooks/useReveal';
import styles from './Careers.module.css';
import { shopInfo } from '../data/shopData';
import { User, Mail, Phone, Briefcase, Trash2, CheckCircle, XCircle, Download } from 'lucide-react';

export default function Careers() {
  const [headerRef, headerVis] = useReveal();
  const [bodyRef,   bodyVis]   = useReveal();
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cover_letter: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/careers');
      const data = await response.json();
      setRoles(Array.isArray(data) ? data.filter(r => r.active) : []);
    } catch (err) {
      console.error("Fetch careers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const getIcon = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('خياط') || t.includes('tailor')) return 'fa-scissors';
    if (t.includes('مبيعات') || t.includes('sales')) return 'fa-store';
    if (t.includes('تصميم') || t.includes('designer')) return 'fa-pencil-ruler';
    return 'fa-user-tie';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          cover_letter: formData.cover_letter.trim(),
          position: selectedRole.title,
          resume_url: null 
        })
      });

      if (response.ok) {
        setStatusMsg({ type: 'success', text: 'تم تقديم طلبكِ بنجاح! سنتواصل معكِ قريباً.' });
        setFormData({ name: '', email: '', phone: '', cover_letter: '' });
        setTimeout(() => setSelectedRole(null), 3000);
      } else {
        const resData = await response.json();
        throw new Error(resData.error || 'Failed to submit');
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.careers} id="careers" style={{ direction: 'rtl', background: 'var(--cream)' }}>
      <div className="section-wrap">
        <div ref={headerRef} className={`${styles.header} reveal ${headerVis ? 'vis' : ''}`} style={{ textAlign: 'center' }}>
          <div className="label" style={{ color: 'var(--gold)' }}>انضمي لعائلتنا</div>
          <div className="divider" style={{ background: 'var(--gold)', margin: '.8rem auto 1.2rem' }} />
          <h2 className={styles.mainTitle} style={{ color: 'var(--espresso)' }}>فرص العمل المتاحة</h2>
        </div>

        <div ref={bodyRef} className={`${styles.body} reveal ${bodyVis ? 'vis' : ''}`}>
          <div className={styles.left}>
            {selectedRole ? (
              <div className={styles.formContainer} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className={styles.applyingFor} style={{ color: 'var(--espresso)' }}>
                  التقديم لوظيفة: <span style={{ color: 'var(--gold)' }}>{selectedRole.title}</span>
                </h3>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <input 
                    type="text" placeholder="الاسم الكامل" required 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className={styles.inputField}
                    style={{ background: 'var(--bg-base)', color: 'var(--espresso)', border: '1px solid var(--border)', textAlign: 'right' }}
                  />
                  <input 
                    type="email" placeholder="البريد الإلكتروني" required 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className={styles.inputField}
                    style={{ background: 'var(--bg-base)', color: 'var(--espresso)', border: '1px solid var(--border)', textAlign: 'right' }}
                  />
                  <input 
                    type="tel" placeholder="رقم الهاتف" required 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className={styles.inputField}
                    style={{ background: 'var(--bg-base)', color: 'var(--espresso)', border: '1px solid var(--border)', textAlign: 'right' }}
                  />
                  <textarea 
                    placeholder="أخبرينا عن خبراتك وسيرتك المهنية..." required 
                    value={formData.cover_letter} onChange={e => setFormData({...formData, cover_letter: e.target.value})}
                    className={styles.textAreaField}
                    style={{ background: 'var(--bg-base)', color: 'var(--espresso)', border: '1px solid var(--border)', textAlign: 'right' }}
                  />
                  
                  {statusMsg.text && (
                    <p style={{ color: statusMsg.type === 'error' ? '#ef4444' : 'var(--gold)', fontSize: '0.9rem', marginBottom: '15px' }}>
                      {statusMsg.text}
                    </p>
                  )}

                  <div className={styles.formActions} style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting} style={{ background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}>
                      {isSubmitting ? 'جاري التقديم...' : 'إرسال طلب التوظيف'}
                    </button>
                    <button type="button" className={styles.cancelBtn} onClick={() => setSelectedRole(null)} style={{ border: '1px solid var(--border)', color: 'var(--espresso)' }}>
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className={styles.introContainer} style={{ textAlign: 'right' }}>
                <p className={styles.intro} style={{ color: 'var(--espresso-mid)', fontSize: '1.1rem' }}>
                  في <strong>يافا اونلاين</strong>، نبحث دائماً عن العقول المبدعة والأيدي الماهرة التي تشاركنا شغف التميز والارتقاء بفن المطرزات الشرقية والعبايات الراقية.
                </p>
                <div className={styles.applyBox} style={{ background: 'var(--gold-glow)', border: '1px dashed var(--gold)' }}>
                  <span className={styles.applyText} style={{ color: 'var(--gold)' }}>للتواصل المباشر:</span>
                  <a href={`mailto:${shopInfo.careersEmail}`} className={styles.applyEmail} style={{ color: 'var(--espresso)' }}>
                    <i className="fas fa-envelope" style={{ marginLeft: '8px' }} /> {shopInfo.careersEmail}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className={styles.right} style={{ textAlign: 'right' }}>
            <div className={styles.rolesLabel} style={{ color: 'var(--gold)', letterSpacing: '1px' }}>الوظائف المتاحة حالياً</div>

            {loading ? (
              <p style={{ opacity: 0.6, color: 'var(--espresso-dim)' }}>جاري تحميل الوظائف...</p>
            ) : roles.length === 0 ? (
               <p style={{ opacity: 0.6, color: 'var(--espresso-dim)' }}>لا توجد شواغر حالياً. يرجى مراجعتنا لاحقاً.</p>
            ) : roles.map(r => (
              <div key={r.id} className={`${styles.roleCard} ${selectedRole?.id === r.id ? styles.activeCard : ''}`} onClick={() => setSelectedRole(r)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className={styles.roleIcon} style={{ color: 'var(--gold)', background: 'var(--gold-glow)' }}>
                  <i className={`fas ${getIcon(r.title)}`} />
                </div>
                <div className={styles.roleInfo} style={{ marginRight: '15px', flex: 1 }}>
                  <div className={styles.roleTitle} style={{ color: 'var(--espresso)' }}>{r.title}</div>
                  <div className={styles.roleType} style={{ color: 'var(--espresso-dim)', fontSize: '0.8rem' }}>{r.type} · {r.location}</div>
                </div>
                <div className={styles.roleArrow} style={{ transform: 'rotate(180deg)' }}>
                  <i className="fas fa-arrow-right" style={{ color: 'var(--gold)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
