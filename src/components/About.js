import { useReveal } from '../hooks/useReveal';
import styles from './About.module.css';
import { Sparkles, Award, ShieldCheck, ArrowLeft } from 'lucide-react';

const PILLARS = [
  { icon: <Sparkles size={22} />, title: 'تصاميم حصرية', desc: 'كل قطعة مصممة بعناية فائقة لتلائم أسلوب حياتك وتفرد إطلالتك.' },
  { icon: <Award size={22} />,     title: 'تطريز يدوي فاخر', desc: 'تطريز أصيل يدوياً بخيوط ذهبية وفضية على أيدي أمهر الحرفيين.' },
  { icon: <ShieldCheck size={22} />, title: 'خامات عالمية', desc: 'أقمشة كريب مزدوج، حرير طبيعي، وشيفون إيطالي منتقاة بعناية.' },
];

export default function About() {
  const [imgRef,  imgVis]  = useReveal();
  const [textRef, textVis] = useReveal();
  const [pilRef,  pilVis]  = useReveal();

  return (
    <section className={styles.about} id="about" style={{ direction: 'rtl', background: 'var(--cream)' }}>
      <div className="section-wrap">
        <div className={styles.twoCol}>
          
          <div ref={textRef} className={`${styles.text} reveal ${textVis ? 'vis' : ''}`} style={{ textAlign: 'right' }}>
            <div className="label" style={{ color: 'var(--gold)' }}>قصتنا</div>
            <div className="divider" style={{ background: 'var(--gold)' }} />
            <h2 className="h2" style={{ color: 'var(--espresso)' }}>أصالة توارثناها</h2>
            
            <p className={styles.body} style={{ color: 'var(--espresso-mid)' }}>
              منذ أكثر من عقدين، نُتقن في <strong>يافا اونلاين</strong> فن المطرزات الشرقية على أيدي حرفيين مهرة.
              كل خيط، كل غرزة، كل تفصيل — هو قصيدة نسجناها لكِ لتتوج إطلالتكِ بأرقى المعايير.
            </p>
            
            <p className={styles.body} style={{ color: 'var(--espresso-mid)' }}>
              نحن نؤمن بأن العباية ليست مجرد ملبس، بل هي هوية وأصالة تعكس أناقة المرأة العربية ووقارها.
              لذلك، نجمع بين عراقة التراث وخطوط الموضة الحديثة لنقدم لكِ قطعاً فريدة تدوم طويلاً.
            </p>
            
            <p className={styles.body} style={{ color: 'var(--espresso-mid)' }}>
              يسعدنا الترحيب بكِ لتصفح تشكيلاتنا المتنوعة من الكلاسيك والمناسبات والشتويات والاستمتاع بتجربة تسوق فريدة ومميزة.
            </p>

            <a href="#collection" className="btn btn-outline" style={{ marginTop: '1.6rem', display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid var(--gold)', color: 'var(--espresso)' }}>
              <ArrowLeft size={16} /> تصفحي التشكيلة
            </a>
          </div>

          <div ref={imgRef} className={`${styles.imgWrap} reveal ${imgVis ? 'vis' : ''}`}>
            <div className={styles.imgMain}>
              <img
                src="/15.jpg"
                alt="Yafa Online lookbook"
                loading="lazy"
              />
            </div>
            <div className={styles.imgAccent}>
              <img
                src="/8.png"
                alt="Yafa Online detail view"
                loading="lazy"
              />
            </div>
            <div className={styles.badge} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--gold)' }}>
              <span className={styles.badgeText} style={{ color: 'var(--espresso-dim)' }}>مطرزات شرقية</span>
              <span className={styles.badgeMain} style={{ color: 'var(--gold)' }}>منذ 2004</span>
              <span className={styles.badgeText} style={{ color: 'var(--espresso-dim)' }}>صناعة يدوية فاخرة</span>
            </div>
          </div>
        </div>

        <div ref={pilRef} className={`${styles.pillars} reveal ${pilVis ? 'vis' : ''}`}>
          {PILLARS.map((p, i) => (
            <div key={p.title} className={styles.pillar} style={{ animationDelay: `${i * 150}ms`, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className={styles.pillarIcon} style={{ color: 'var(--gold)', background: 'var(--gold-glow)' }}>{p.icon}</div>
              <h3 className={styles.pillarTitle} style={{ color: 'var(--espresso)' }}>{p.title}</h3>
              <p className={styles.pillarDesc} style={{ color: 'var(--espresso-dim)' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}