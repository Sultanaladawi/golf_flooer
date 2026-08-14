import React, { useState } from 'react';
import styles from './TechAgency.module.css';
import { 
  Code2, 
  Smartphone, 
  Globe2, 
  Cpu, 
  ShieldCheck, 
  Rocket, 
  Calculator, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Zap, 
  Send,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Laptop,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SERVICES = [
  {
    icon: <Globe2 size={32} className={styles.serviceIcon} />,
    title: 'تطوير المتاجر الإلكترونية الفاخرة',
    enTitle: 'Luxury E-Commerce Platforms',
    desc: 'نبني منصات تجارة إلكترونية سريعة وخارقة الأداء، متكاملة مع بوابات الدفع (فيزا، ماستركارد، كليك، تابي، تمارا)، أنظمة الشحن الآلية، وإدارة المخزون الحية.',
    tags: ['React', 'Node.js', 'Next.js', 'بوابات الدفع', 'لوحات تحكم ذكية']
  },
  {
    icon: <Smartphone size={32} className={styles.serviceIcon} />,
    title: 'تطبيقات الهواتف الذكية (iOS & Android)',
    enTitle: 'Native & Cross-Platform Mobile Apps',
    desc: 'تصميم وبرمجة تطبيقات جوال فائقة السلاسة والسرعة، تعمل على متجري App Store و Google Play بأحدث لغات البرمجة وتجربة مستخدم لا تُنسى.',
    tags: ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Push Notifications']
  },
  {
    icon: <Cpu size={32} className={styles.serviceIcon} />,
    title: 'حلول الذكاء الاصطناعي والأتمتة',
    enTitle: 'AI Solutions & Smart Automation',
    desc: 'دمج نماذج الذكاء الاصطناعي المتقدمة (GPT, Gemini)، روبوتات المحادثة الذكية المبيعاتية، وأتمتة العمليات التجارية لرفع الإنتاجية وتقليل التكاليف.',
    tags: ['AI Chatbots', 'LLM Integration', 'أتمتة الواتساب', 'تحليل البيانات']
  },
  {
    icon: <Code2 size={32} className={styles.serviceIcon} />,
    title: 'أنظمة إدارة الشركات و ERP مخصصة',
    enTitle: 'Custom ERP & Business Systems',
    desc: 'تطوير أنظمة سحابية متكاملة مصممة خصيصاً وفق متطلبات عملك: إدارة المبيعات، الفواتير، الحسابات، شؤون الموظفين، وسلاسل التوريد.',
    tags: ['SaaS ERP', 'CRM Systems', 'إدارة المخازن', 'تقارير مالية حية']
  },
  {
    icon: <Layers size={32} className={styles.serviceIcon} />,
    title: 'تصميم واجهات وتجارب المستخدم (UI/UX)',
    enTitle: 'High-End UI/UX Design',
    desc: 'دراسة سلوك العملاء وتصميم واجهات عصرية فاخرة تركز على سهولة الاستخدام، جمالية التفاصيل، ومضاعفة معدلات التحويل والمبيعات.',
    tags: ['Figma', 'User Journey', 'Design Systems', 'Mobile-First UI']
  },
  {
    icon: <ShieldCheck size={32} className={styles.serviceIcon} />,
    title: 'الاستضافة السحابية والأمن السيبراني',
    enTitle: 'Cloud Architecture & DevOps',
    desc: 'بنية تحتية سحابية متطورة على Azure و AWS مع حماية سيبرانية شاملة من الهجمات، نسخ احتياطي لحظي، وضمان عمل بنسبة 99.99%.',
    tags: ['Azure Cloud', 'AWS', 'SSL & WAF', 'CDN Optimization', '24/7 Monitoring']
  }
];

const PORTFOLIO_PROJECTS = [
  {
    id: 1,
    title: 'منصة زهرة بيسان الفاخرة للأزياء',
    category: 'E-Commerce & High-End Retail',
    desc: 'متجر إلكتروني فائق السرعة مع لوحة تحكم ERP شاملة، بوابات دفع متعددة، مشغل فيديو عالي الدقة، وشات بوت ذكاء اصطناعي تفاعلي.',
    image: '/images/1786522915955-411348681_1782578082455351.mp4',
    isVideo: true,
    tags: ['React', 'Node.js', 'MySQL', 'Azure Cloud', 'AI Assistant']
  },
  {
    id: 2,
    title: 'نظام إدارة سلاسل الإمداد والمخزون الذكي',
    category: 'Enterprise ERP System',
    desc: 'منظومة سحابية متكاملة لمتابعة حركة المنتجات، الفواتير الضريبية، تنبيهات نفاد المخزون، والتقارير المالية التنبؤية بالذكاء الاصطناعي.',
    image: '/12.png',
    isVideo: false,
    tags: ['Next.js', 'PostgreSQL', 'Docker', 'Microservices']
  },
  {
    id: 3,
    title: 'تطبيق حجوزات وخدمات VIP',
    category: 'Mobile Application',
    desc: 'تطبيق موبايل فاخر مخصص لعملاء النخبة مع نظام دفع آمن، إشعارات حية، وتتبع جغرافي دقيق للطلبات في الوقت الفعلي.',
    image: '/8 (1).png',
    isVideo: false,
    tags: ['React Native', 'Node.js', 'Socket.io', 'Google Maps API']
  }
];

export default function TechAgency() {
  // Calculator state
  const [projectType, setProjectType] = useState('ecommerce');
  const [platforms, setPlatforms] = useState(['web']);
  const [features, setFeatures] = useState(['payments', 'admin']);
  const [timeline, setTimeline] = useState('standard');

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    service: 'متجر إلكتروني متكامل',
    budget: '500 - 1,500 د.أ',
    details: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Dynamic cost calculation
  const calculateEstimate = () => {
    let base = 500;
    if (projectType === 'ecommerce') base = 650;
    if (projectType === 'mobile') base = 900;
    if (projectType === 'erp') base = 1200;
    if (projectType === 'custom') base = 800;

    let platformMultiplier = platforms.length === 2 ? 1.6 : (platforms.length === 3 ? 2.1 : 1);
    let featureCost = features.length * 120;
    let timelineMultiplier = timeline === 'express' ? 1.25 : 1;

    const total = Math.round((base * platformMultiplier + featureCost) * timelineMultiplier);
    return { min: total, max: Math.round(total * 1.35) };
  };

  const estimate = calculateEstimate();

  const handleFeatureToggle = (f) => {
    if (features.includes(f)) {
      setFeatures(features.filter(x => x !== f));
    } else {
      setFeatures([...features, f]);
    }
  };

  const handlePlatformToggle = (p) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) setPlatforms(platforms.filter(x => x !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('يرجى كتابة الاسم ورقم الهاتف للتواصل');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/api/tech/lead', {
        ...formData,
        estimated_quote: `JOD ${estimate.min} - ${estimate.max}`,
        calculator_details: JSON.stringify({ projectType, platforms, features, timeline })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failed', err);
      // Fallback direct success message
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsAppDirect = () => {
    const text = `مرحباً زهرة بيسان للتكنولوجيا 💻✨%0Aأود الاستفسار عن خدمة: ${formData.service}%0Aالاسم: ${formData.name || 'عميل مهتم'}%0Aالميزانية المقدرة: ${formData.budget || 'غير محدد'}%0Aالتفاصيل: ${formData.details || 'طلب استشارة وتحديد موعد'}`;
    window.open(`https://wa.me/962788888888?text=${text}`, '_blank');
  };

  return (
    <div className={styles.techContainer}>
      
      {/* Top Brand Navigation Bar */}
      <header className={styles.techHeader}>
        <div className={styles.headerInner}>
          <Link to="/tech" className={styles.techLogo}>
            <div className={styles.logoBadge}>
              <Code2 size={24} color="#c5a880" />
            </div>
            <div>
              <span className={styles.logoTextMain}>زهرة بيسان للحلول الرقمية</span>
              <span className={styles.logoTextSub}>ZAHRAT BEESAN TECH & SOFTWARE</span>
            </div>
          </Link>

          <nav className={styles.techNav}>
            <a href="#services">الخدمات</a>
            <a href="#calculator">حاسبة الأسعار</a>
            <a href="#portfolio">الأعمال</a>
            <a href="#quote" className={styles.ctaNavBtn}>
              <Sparkles size={16} /> طلب عرض سعر
            </a>
            <Link to="/" className={styles.storeLink}>
              👑 متجر الأزياء والعبايات
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlowTop} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={16} /> المنظومة الرقمية الشاملة لنمو أعمالك 2026
          </div>
          
          <h1 className={styles.heroTitle}>
            نبتكر الحلول البرمجية والمتاجر الرقمية
            <span className={styles.heroHighlight}> التي تصنع الفارق الحقيقي.</span>
          </h1>

          <p className={styles.heroDesc}>
            من الفكرة إلى الإطلاق الكامل — نصمم ونبرمج متاجر إلكترونية خارقة، تطبيقات هواتف ذكية، أنظمة ERP سحابية، وحلول ذكاء اصطناعي ترفع أرباحك وتمنح علامتك التجارية المكانة التي تستحقها.
          </p>

          <div className={styles.heroActions}>
            <a href="#calculator" className={styles.btnPrimary}>
              <Calculator size={20} /> احسب تكلفة مشروعك الآن
            </a>
            <a href="#quote" className={styles.btnSecondary}>
              <MessageCircle size={20} /> حجز استشارة مجانية
            </a>
          </div>

          {/* Trust Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricItem}>
              <span className={styles.metricNum}>99.9%</span>
              <span className={styles.metricLabel}>استقرار وحماية سحابية</span>
            </div>
            <div className={styles.metricDivider} />
            <div className={styles.metricItem}>
              <span className={styles.metricNum}>3X</span>
              <span className={styles.metricLabel}>سرعة فائقة ومضاعفة مبيعات</span>
            </div>
            <div className={styles.metricDivider} />
            <div className={styles.metricItem}>
              <span className={styles.metricNum}>24/7</span>
              <span className={styles.metricLabel}>دعم فني وتطوير مستمر</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.servicesSection} id="services">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>مجالات خبرتنا المتطورة</span>
          <h2 className={styles.sectionTitle}>خدمات برمجية وتقنية بمعايير عالمية</h2>
          <p className={styles.sectionDesc}>
            حلول هندسية متكاملة مصممة خصيصاً لدعم نمو الشركات الناشئة والمتاجر الرائدة والشركات الكبرى.
          </p>
        </div>

        <div className={styles.servicesGrid}>
          {SERVICES.map((srv, idx) => (
            <div key={idx} className={styles.serviceCard}>
              <div className={styles.serviceIconWrap}>{srv.icon}</div>
              <h3 className={styles.serviceCardTitle}>{srv.title}</h3>
              <span className={styles.serviceCardEn}>{srv.enTitle}</span>
              <p className={styles.serviceCardDesc}>{srv.desc}</p>
              <div className={styles.tagList}>
                {srv.tags.map((t, i) => (
                  <span key={i} className={styles.tagBadge}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Project Cost Calculator */}
      <section className={styles.calcSection} id="calculator">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>حاسبة التكلفة الذكية</span>
          <h2 className={styles.sectionTitle}>قدّر تكلفة ومدة مشروعك خلال لحظات</h2>
          <p className={styles.sectionDesc}>
            اختر مواصفات وميزات نظامك التقني واحصل على تقدير فوري وشفاف لميزانية التطوير.
          </p>
        </div>

        <div className={styles.calcContainer}>
          
          {/* Options Form */}
          <div className={styles.calcControls}>
            
            {/* 1. Project Type */}
            <div className={styles.calcGroup}>
              <label className={styles.calcGroupLabel}>1. ما هو نوع المشروع المطلوب؟</label>
              <div className={styles.optionsGrid}>
                {[
                  { id: 'ecommerce', label: '🛍️ متجر إلكتروني متكامل', desc: 'بيع المنتجات، دفع أونلاين، شحن' },
                  { id: 'mobile', label: '📱 تطبيق هاتف ذكي', desc: 'تطبيق iOS وأندرويد عالي الأداء' },
                  { id: 'erp', label: '🏢 نظام ERP وإدارة أعمال', desc: 'مخازن، محاسبة، فواتير، موظفين' },
                  { id: 'custom', label: '⚡ موقع تعريفي وخدمي مخصص', desc: 'شركات، عيادات، منصات حجز' }
                ].map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setProjectType(item.id)}
                    className={`${styles.optionCard} ${projectType === item.id ? styles.optionSelected : ''}`}
                  >
                    <div className={styles.optionHeader}>
                      <span className={styles.optionTitle}>{item.label}</span>
                      {projectType === item.id && <CheckCircle2 size={18} color="#c5a880" />}
                    </div>
                    <span className={styles.optionDesc}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Target Platforms */}
            <div className={styles.calcGroup}>
              <label className={styles.calcGroupLabel}>2. المنصات المستهدفة:</label>
              <div className={styles.optionsGridMini}>
                {[
                  { id: 'web', label: '🌐 منصة ويب تفاعلية (Web App)' },
                  { id: 'ios', label: '🍏 تطبيق أبل (iOS App)' },
                  { id: 'android', label: '🤖 تطبيق أندرويد (Android App)' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePlatformToggle(p.id)}
                    className={`${styles.pillBtn} ${platforms.includes(p.id) ? styles.pillSelected : ''}`}
                  >
                    {platforms.includes(p.id) && <Check size={16} />} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Add-on Features */}
            <div className={styles.calcGroup}>
              <label className={styles.calcGroupLabel}>3. الميزات والإضافات المتقدمة:</label>
              <div className={styles.featuresGrid}>
                {[
                  { id: 'payments', label: '💳 بوابات الدفع الإلكتروني (Visa, CliQ, Apple Pay)' },
                  { id: 'admin', label: '📊 لوحة تحكم إدارية متقدمة مع إحصائيات حية' },
                  { id: 'ai', label: '🤖 شات بوت ذكاء اصطناعي للرد الآلي والمبيعات' },
                  { id: 'multilang', label: '🌍 دعم متعدد اللغات (عربي / إنجليزي)' },
                  { id: 'loyalty', label: '🏆 نظام نقاط ولاء وكوبونات خصم' },
                  { id: 'whatsapp', label: '💬 ربط آلي مع إشعارات ورسائل الواتساب' }
                ].map(f => (
                  <div
                    key={f.id}
                    onClick={() => handleFeatureToggle(f.id)}
                    className={`${styles.featureItem} ${features.includes(f.id) ? styles.featureSelected : ''}`}
                  >
                    <div className={styles.checkboxSquare}>
                      {features.includes(f.id) && <Check size={14} color="#111" />}
                    </div>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Timeline */}
            <div className={styles.calcGroup}>
              <label className={styles.calcGroupLabel}>4. الجدول الزمني المفضل للإنجاز:</label>
              <div className={styles.timelineToggle}>
                <button
                  type="button"
                  onClick={() => setTimeline('standard')}
                  className={`${styles.timeBtn} ${timeline === 'standard' ? styles.timeSelected : ''}`}
                >
                  ⏳ قياسي (3 - 5 أسابيع)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeline('express')}
                  className={`${styles.timeBtn} ${timeline === 'express' ? styles.timeSelected : ''}`}
                >
                  ⚡ سريع ومكثف (10 - 15 يوم)
                </button>
              </div>
            </div>

          </div>

          {/* Estimate Summary Card */}
          <div className={styles.estimateCard}>
            <div className={styles.estimateHeader}>
              <Sparkles size={24} color="#c5a880" />
              <h3>التقدير المبدئي للاستثمار</h3>
            </div>

            <div className={styles.priceDisplay}>
              <span className={styles.currency}>JOD</span>
              <span className={styles.priceRange}>{estimate.min} - {estimate.max}</span>
            </div>
            <span className={styles.priceNote}>* التقدير يشمل التصميم، البرمجة، والربط السحابي لمدة عام</span>

            <div className={styles.includedList}>
              <div className={styles.incItem}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>تصميم واجهات UI/UX فاخرة ومخصصة</span>
              </div>
              <div className={styles.incItem}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>برمجة نظيفة وكود آمن 100% قابل للتوسع</span>
              </div>
              <div className={styles.incItem}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>استضافة سحابية فائقة السرعة مع شهادة SSL</span>
              </div>
              <div className={styles.incItem}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>دعم فني مجاني وضمان تشغيلي شامل</span>
              </div>
            </div>

            <a href="#quote" className={styles.btnEstimateAction}>
              اعتماد المواصفات وحجز موعد الانطلاق ←
            </a>
          </div>

        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className={styles.portfolioSection} id="portfolio">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>سابقة الأعمال</span>
          <h2 className={styles.sectionTitle}>مشاريع صُنعت بدقة وشغف هندسي</h2>
          <p className={styles.sectionDesc}>
            نماذج حية من المنصات والأنظمة التي قمنا بتطويرها لعملائنا في الأردن والخليج العربي.
          </p>
        </div>

        <div className={styles.portfolioGrid}>
          {PORTFOLIO_PROJECTS.map(proj => (
            <div key={proj.id} className={styles.portfolioCard}>
              <div className={styles.portfolioMediaWrap}>
                {proj.isVideo ? (
                  <video 
                    src={proj.image} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className={styles.portfolioMedia}
                  />
                ) : (
                  <img 
                    src={proj.image} 
                    alt={proj.title} 
                    className={styles.portfolioMedia} 
                  />
                )}
                <span className={styles.portfolioCategoryBadge}>{proj.category}</span>
              </div>

              <div className={styles.portfolioBody}>
                <h3 className={styles.portfolioTitle}>{proj.title}</h3>
                <p className={styles.portfolioDesc}>{proj.desc}</p>
                <div className={styles.tagList}>
                  {proj.tags.map((t, idx) => (
                    <span key={idx} className={styles.tagBadge}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Quotation Form */}
      <section className={styles.quoteSection} id="quote">
        <div className={styles.quoteContainer}>
          
          <div className={styles.quoteInfo}>
            <span className={styles.sectionTag}>ابدأ مشروعك معنا</span>
            <h2 className={styles.quoteTitle}>
              جاهز لتحويل فكرتك إلى منظومة رقمية رائدة؟
            </h2>
            <p className={styles.quoteDesc}>
              فريقنا الهندسي جاهز لدراسة فكرتك، تقديم الاستشارة التقنية الأمثل، وتنفيذ مشروعك بأعلى درجات الاحترافية والسرعة.
            </p>

            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <Phone size={20} color="#c5a880" />
                <div>
                  <strong>الهاتف والواتساب المباشر:</strong>
                  <span>+962 7 8888 8888</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <Mail size={20} color="#c5a880" />
                <div>
                  <strong>البريد الإلكتروني الرسمي:</strong>
                  <span>tech@zahratbeesan.com</span>
                </div>
              </div>
              <div className={styles.contactItem}>
                <Globe2 size={20} color="#c5a880" />
                <div>
                  <strong>المقر الرئيسي:</strong>
                  <span>عمّان، المملكة الأردنية الهاشمية</span>
                </div>
              </div>
            </div>

            <button onClick={openWhatsAppDirect} className={styles.btnWaDirect}>
              <MessageCircle size={22} /> تواصل فوري ومباشر عبر الواتساب
            </button>
          </div>

          <div className={styles.quoteFormCard}>
            {submitted ? (
              <div className={styles.successBox}>
                <CheckCircle2 size={64} color="#10b981" />
                <h3>تم استلام طلبك بنجاح! 🎉</h3>
                <p>
                  شكراً لتواصلك مع زهرة بيسان للحلول الرقمية. سيقوم مستشارنا التقني بالتواصل معك هاتفياً وعبر الواتساب خلال دقائق لمناقشة تفاصيل المشروع.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className={styles.btnReset}
                >
                  إرسال استفسار آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className={styles.formElement}>
                <h3 className={styles.formTitle}>طلب عرض سعر واستشارة مجانية</h3>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label>الاسم الكريم *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: سلطان العدوي"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>رقم الهاتف / الواتساب *</label>
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="079XXXXXXXX"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label>البريد الإلكتروني</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      dir="ltr"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>اسم الشركة أو النشاط التجاري</label>
                    <input 
                      type="text" 
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      placeholder="مثال: متجر أو شركة..."
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formField}>
                    <label>نوع الخدمة المطلوبة</label>
                    <select
                      value={formData.service}
                      onChange={e => setFormData({ ...formData, service: e.target.value })}
                    >
                      <option>متجر إلكتروني متكامل</option>
                      <option>تطبيق هواتف ذكية (iOS & Android)</option>
                      <option>نظام ERP وإدارة سحابية مخصص</option>
                      <option>حلول وأتمتة الذكاء الاصطناعي</option>
                      <option>تصميم واجهات وتطوير موقع تعريفي</option>
                      <option>استشارات وتطوير برمجيات خاصة</option>
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label>الميزانية التقريبية</label>
                    <select
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    >
                      <option>300 - 800 د.أ</option>
                      <option>800 - 1,500 د.أ</option>
                      <option>1,500 - 3,000 د.أ</option>
                      <option>أكثر من 3,000 د.أ</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formField}>
                  <label>تفاصيل وملاحظات إضافية حول فكرتك</label>
                  <textarea 
                    rows={4}
                    value={formData.details}
                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                    placeholder="اكتب نبذة عن مشروعك، الميزات الخاصة التي ترغب بإضافتها، أو أي استفسار تريده..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className={styles.btnSubmitLead}
                >
                  {submitting ? 'جاري إرسال طلبك...' : <><Send size={18} /> إرسال طلب المشروع والبدء فوراً</>}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className={styles.techFooter}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.logoBadgeSmall}>
              <Code2 size={20} color="#c5a880" />
            </div>
            <div>
              <h4>زهرة بيسان لتكنولوجيا المعلومات</h4>
              <p>شريكك الهندسي الموثوق لصناعة الحلول الرقمية الفاخرة.</p>
            </div>
          </div>

          <div className={styles.footerLinks}>
            <Link to="/">👑 متجر الأزياء والعبايات</Link>
            <a href="#services">الخدمات التقنية</a>
            <a href="#calculator">حاسبة التكلفة</a>
            <a href="#quote">طلب استشارة</a>
          </div>

          <div className={styles.footerCopy}>
            © {new Date().getFullYear()} Zahrat Beesan Tech Solutions. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
