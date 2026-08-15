import React, { useState, useEffect, useRef } from 'react';
import styles from './TechAgency.module.css';
import {
  Code2, Smartphone, Globe2, Cpu, ShieldCheck, Sparkles,
  Check, CheckCircle2, Send, MessageCircle, Phone, Mail,
  Layers, Zap, ArrowLeft, Star, ChevronDown, ChevronUp,
  Server, HardDrive, Wifi, Globe, ShoppingBag, Utensils,
  Heart, Home, GraduationCap, Building2, Car, Scissors,
  Package, Filter, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ─── SERVICES ──────────────────────────────────────── */
const SERVICES = [
  { icon: Globe2, num: '01', title: 'المتاجر الإلكترونية الفاخرة', enTitle: 'Luxury E-Commerce', desc: 'منصات تجارة إلكترونية فائقة السرعة مع بوابات الدفع (كليك، تمارا، فيزا)، الشحن الآلي، وإدارة المخزون الحية.', tags: ['React / Next.js', 'Node.js', 'بوابات دفع', 'لوحة ERP'] },
  { icon: Smartphone, num: '02', title: 'تطبيقات الهواتف الذكية', enTitle: 'iOS & Android Apps', desc: 'تطبيقات جوال فائقة السلاسة تعمل على App Store وGoogle Play بتجربة مستخدم استثنائية لا تُنسى.', tags: ['Flutter', 'React Native', 'Push Notifications', 'Offline Support'] },
  { icon: Cpu, num: '03', title: 'حلول الذكاء الاصطناعي', enTitle: 'AI & Smart Automation', desc: 'دمج GPT-4 وGemini، روبوتات المحادثة الذكية، وأتمتة العمليات لرفع الإنتاجية ومضاعفة المبيعات.', tags: ['LLM Integration', 'AI Chatbots', 'أتمتة واتساب', 'تحليل البيانات'] },
  { icon: Code2, num: '04', title: 'أنظمة ERP وإدارة الأعمال', enTitle: 'Custom ERP Systems', desc: 'أنظمة سحابية شاملة للمبيعات، الفواتير، الحسابات، شؤون الموظفين، وسلاسل التوريد في منصة واحدة.', tags: ['SaaS Cloud ERP', 'CRM', 'إدارة المخازن', 'تقارير ذكية'] },
  { icon: Layers, num: '05', title: 'تصميم UI/UX الفاخر', enTitle: 'Premium UI/UX Design', desc: 'واجهات عصرية فاخرة تركز على سهولة الاستخدام وجمالية التفاصيل، مما يضاعف معدلات التحويل والمبيعات.', tags: ['Figma', 'Design Systems', 'Prototyping', 'Mobile-First'] },
  { icon: ShieldCheck, num: '06', title: 'الاستضافة السحابية والحماية', enTitle: 'Cloud & Cybersecurity', desc: 'بنية تحتية على Azure وAWS مع حماية سيبرانية متعددة الطبقات، CDN عالمي، وضمان 99.9% uptime.', tags: ['Azure Cloud', 'AWS', 'WAF & DDoS', '24/7 Monitoring'] },
];

/* ─── PORTFOLIO ─────────────────────────────────────── */
const PORTFOLIO = [
  {
    id: 1, cat: 'ecommerce',
    title: 'متجر الأزياء الفاخرة',
    industry: '👗 أزياء وعبايات',
    desc: 'متجر إلكتروني متكامل بلوحة تحكم ERP، بوابات دفع محلية ودولية، شحن آلي، وشات بوت AI.',
    image: '/portfolio/fashion.png',
    tags: ['React', 'Node.js', 'MySQL', 'Azure'],
    badge: 'E-Commerce'
  },
  {
    id: 2, cat: 'ecommerce',
    title: 'سوبرماركت الإلكتروني',
    industry: '🛒 بقالة وسوبرماركت',
    desc: 'منصة طلب بقالة أونلاين مع تتبع حي للطلبات، إدارة مخزون ذكية، وتطبيق جوال للتوصيل.',
    image: '/portfolio/grocery.png',
    tags: ['Next.js', 'Flutter', 'MongoDB', 'Vercel'],
    badge: 'E-Commerce + App'
  },
  {
    id: 3, cat: 'restaurant',
    title: 'منصة الطلب والتوصيل',
    industry: '🍕 مطاعم وكافيهات',
    desc: 'نظام طلب طعام أونلاين مع QR Menu، إدارة المطبخ الحية، نظام نقاط ولاء، وتتبع التوصيل على الخريطة.',
    image: '/portfolio/restaurant.png',
    tags: ['React', 'Node.js', 'Socket.io', 'Google Maps'],
    badge: 'Restaurant System'
  },
  {
    id: 4, cat: 'clinic',
    title: 'منظومة العيادات الذكية',
    industry: '🏥 عيادات ومستشفيات',
    desc: 'نظام حجز مواعيد ذكي، ملفات مرضى إلكترونية، متابعة وصفات طبية، ودفع أونلاين مع تذكيرات واتساب.',
    image: '/portfolio/clinic.png',
    tags: ['React', 'PostgreSQL', 'HIPAA Compliant', 'WhatsApp API'],
    badge: 'Healthcare System'
  },
  {
    id: 5, cat: 'realestate',
    title: 'منصة العقارات الفاخرة',
    industry: '🏡 عقارات ومقاولات',
    desc: 'منصة عقارية شاملة مع خرائط تفاعلية، جولات 360°، نظام حجز وتواصل مع الوكلاء، وتقارير السوق الذكية.',
    image: '/portfolio/realestate.png',
    tags: ['Next.js', 'Mapbox', 'PostgreSQL', 'AWS S3'],
    badge: 'Real Estate'
  },
  {
    id: 6, cat: 'education',
    title: 'منصة التعليم الإلكتروني',
    industry: '📚 مراكز تعليمية',
    desc: 'LMS متكامل مع بث مباشر للدروس، اختبارات تفاعلية، شهادات رقمية، وتحليل أداء الطلاب.',
    image: '/portfolio/education.png',
    tags: ['React', 'Node.js', 'Video Streaming', 'Analytics'],
    badge: 'EdTech Platform'
  },
  {
    id: 7, cat: 'app',
    title: 'تطبيق خدمات VIP وحجوزات',
    industry: '💎 خدمات VIP',
    desc: 'تطبيق جوال فاخر لخدمات الحجز والتوصيل مع نظام دفع آمن، تتبع جغرافي، وإشعارات حية.',
    image: '/portfolio/vipapp.png',
    tags: ['Flutter', 'Firebase', 'Google Maps', 'Stripe'],
    badge: 'Mobile App'
  },
  {
    id: 8, cat: 'app',
    title: 'تطبيق توصيل الأدوية',
    industry: '💊 صيدليات',
    desc: 'تطبيق طلب أدوية مع وصفات طبية رقمية، تأكيد صيدلاني، تتبع التوصيل، وسجل طبي للمريض.',
    image: '/portfolio/pharmacy.png',
    tags: ['React Native', 'Node.js', 'ML Prescription OCR'],
    badge: 'HealthApp'
  },
  {
    id: 9, cat: 'erp',
    title: 'نظام ERP الصناعي الشامل',
    industry: '🏭 مصانع وشركات كبرى',
    desc: 'نظام ERP سحابي متكامل لإدارة الإنتاج، المخازن، سلاسل التوريد، الموارد البشرية، والمحاسبة.',
    image: '/portfolio/erp.png',
    tags: ['SaaS ERP', 'Docker', 'Microservices', 'BI Reports'],
    badge: 'Enterprise ERP'
  },
  {
    id: 10, cat: 'corporate',
    title: 'موقع شركة المقاولات',
    industry: '🏗️ مقاولات وهندسة',
    desc: 'موقع مؤسسي احترافي مع معرض مشاريع، نماذج طلب عروض، خريطة المشاريع التفاعلية، وبوابة عملاء.',
    image: '/portfolio/corporate.png',
    tags: ['Next.js', 'Sanity CMS', 'Mapbox', 'Vercel'],
    badge: 'Corporate Website'
  },
  {
    id: 11, cat: 'restaurant',
    title: 'نظام إدارة سلسلة المطاعم',
    industry: '🍔 سلاسل وفرانشايز',
    desc: 'إدارة مركزية لجميع الفروع مع تقارير مبيعات حية، إدارة الطاقم، التوريد المركزي، والمنيو الرقمي.',
    image: '/portfolio/restaurant2.png',
    tags: ['React', 'Node.js', 'Multi-Branch ERP', 'Analytics'],
    badge: 'Restaurant Chain'
  },
  {
    id: 12, cat: 'corporate',
    title: 'منصة الحجوزات الفندقية',
    industry: '🏨 فنادق وشقق مفروشة',
    desc: 'نظام إدارة فندقي PMS شامل مع حجز أونلاين، تحكم بالغرف، الفواتير، والتكامل مع Booking.com.',
    image: '/portfolio/hotel.png',
    tags: ['React', 'PMS Integration', 'Channel Manager', 'Payment'],
    badge: 'Hospitality System'
  },
];

const PORT_CATS = [
  { id: 'all', label: 'جميع المشاريع', icon: Package },
  { id: 'ecommerce', label: 'متاجر إلكترونية', icon: ShoppingBag },
  { id: 'restaurant', label: 'مطاعم وكافيهات', icon: Utensils },
  { id: 'clinic', label: 'صحة وعيادات', icon: Heart },
  { id: 'realestate', label: 'عقارات', icon: Home },
  { id: 'education', label: 'تعليم', icon: GraduationCap },
  { id: 'app', label: 'تطبيقات جوال', icon: Smartphone },
  { id: 'erp', label: 'أنظمة ERP', icon: Building2 },
  { id: 'corporate', label: 'مواقع مؤسسية', icon: Globe2 },
];

/* ─── HOSTING PLANS ────────────────────────────────── */
const HOSTING_PLANS = [
  {
    name: 'ابتدائي',
    nameEn: 'STARTER',
    icon: Globe,
    price: '24',
    period: 'سنة',
    desc: 'مثالي للمواقع التعريفية والمدونات',
    features: [
      { label: 'مساحة تخزين', value: '5 GB SSD' },
      { label: 'نطاق ترددي', value: 'غير محدود' },
      { label: 'نطاقات مجانية', value: '1 دومين' },
      { label: 'بريد إلكتروني', value: '5 صناديق بريد' },
      { label: 'SSL مجاني', value: '✓' },
      { label: 'لوحة cPanel', value: '✓' },
      { label: 'نسخ احتياطي', value: 'أسبوعي' },
      { label: 'دعم', value: '8/5' },
    ],
    highlighted: false,
    color: '#6366f1'
  },
  {
    name: 'احترافي',
    nameEn: 'PROFESSIONAL',
    icon: Server,
    price: '59',
    period: 'سنة',
    desc: 'الأنسب للمتاجر الإلكترونية والمواقع النشطة',
    features: [
      { label: 'مساحة تخزين', value: '25 GB NVMe SSD' },
      { label: 'نطاق ترددي', value: 'غير محدود' },
      { label: 'نطاقات مجانية', value: '5 دومينات' },
      { label: 'بريد إلكتروني', value: '25 صندوق بريد' },
      { label: 'SSL مجاني', value: '✓' },
      { label: 'لوحة cPanel', value: '✓' },
      { label: 'نسخ احتياطي', value: 'يومي' },
      { label: 'دعم', value: '24/7' },
    ],
    highlighted: true,
    color: '#b8943a'
  },
  {
    name: 'سحابي VPS',
    nameEn: 'CLOUD VPS',
    icon: HardDrive,
    price: '149',
    period: 'سنة',
    desc: 'لتطبيقات الأعمال والمنصات الكبيرة',
    features: [
      { label: 'RAM', value: '4 GB DDR4' },
      { label: 'معالج', value: '4 vCPU Cores' },
      { label: 'مساحة', value: '80 GB NVMe SSD' },
      { label: 'نطاق ترددي', value: '5 TB/شهر' },
      { label: 'IP ثابت', value: '1 Dedicated IP' },
      { label: 'نظام تشغيل', value: 'Ubuntu / CentOS' },
      { label: 'نسخ احتياطي', value: 'يومي تلقائي' },
      { label: 'دعم', value: '24/7 Priority' },
    ],
    highlighted: false,
    color: '#8b5cf6'
  },
  {
    name: 'إنتربرايز',
    nameEn: 'ENTERPRISE CLOUD',
    icon: Wifi,
    price: 'مخصص',
    period: '',
    desc: 'Azure / AWS مخصص للأنظمة الضخمة',
    features: [
      { label: 'بنية تحتية', value: 'Azure / AWS / GCP' },
      { label: 'Auto Scaling', value: '✓ تلقائي' },
      { label: 'Load Balancer', value: '✓ مدمج' },
      { label: 'CDN عالمي', value: '✓ 200+ موقع' },
      { label: 'WAF & DDoS', value: '✓ حماية كاملة' },
      { label: 'Uptime SLA', value: '99.99%' },
      { label: 'نسخ احتياطي', value: 'لحظي Multi-Zone' },
      { label: 'دعم', value: 'فريق مخصص 24/7' },
    ],
    highlighted: false,
    color: '#10b981'
  }
];

/* ─── DOMAINS ───────────────────────────────────────── */
const DOMAINS = [
  { ext: '.com', reg: '12', renew: '15', popular: true },
  { ext: '.net', reg: '14', renew: '16', popular: false },
  { ext: '.jo', reg: '30', renew: '30', popular: true },
  { ext: '.store', reg: '8', renew: '18', popular: false },
  { ext: '.online', reg: '5', renew: '20', popular: false },
  { ext: '.tech', reg: '10', renew: '25', popular: false },
  { ext: '.shop', reg: '8', renew: '20', popular: false },
  { ext: '.app', reg: '18', renew: '20', popular: false },
];

/* ─── PROCESS ───────────────────────────────────────── */
const PROCESS_STEPS = [
  { num: '01', title: 'الاستشارة والتحليل', desc: 'نجتمع بك لفهم أهدافك، نحلل المنافسين، ونضع استراتيجية تقنية دقيقة وشاملة.' },
  { num: '02', title: 'التصميم والنمذجة', desc: 'نصمم الواجهات بـ Figma ونبني نماذج تفاعلية قابلة للاختبار قبل كتابة أي كود.' },
  { num: '03', title: 'البرمجة والتطوير', desc: 'يبدأ فريقنا الهندسي بالبرمجة بأحدث المعايير مع تحديثات تقدم أسبوعية شفافة.' },
  { num: '04', title: 'الاختبار والضبط', desc: 'نختبر كل جزء على جميع الأجهزة والمتصفحات ونضبط الأداء لمستوى مثالي.' },
  { num: '05', title: 'الإطلاق والدعم', desc: 'نطلق مشروعك بثقة على السحابة مع دعم فني مستمر ومجاني بعد التسليم.' },
];

/* ─── TESTIMONIALS ──────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'أحمد المنصوري', role: 'مدير العمليات — مجموعة النخبة التجارية', quote: 'فريق زهرة بيسان التقني حوّل فكرتنا إلى منصة ضخمة خلال 3 أسابيع. مبيعاتنا ارتفعت 240% خلال أول شهر.', rating: 5 },
  { name: 'سارة الخطيب', role: 'مؤسسة — بوتيك سارة للأزياء', quote: 'التصميم فاخر جداً ويعكس هوية علامتنا بدقة مذهلة. الموقع سريع جداً وتجربة الشراء سلسة. عملاؤنا معجبون للغاية.', rating: 5 },
  { name: 'خالد العمري', role: 'الرئيس التنفيذي — مجموعة العمري للمقاولات', quote: 'نظام ERP الذي طوروه لنا وفّر أكثر من 15 ساعة عمل أسبوعياً في العمليات اليدوية. استثمار يستحق كل دينار.', rating: 5 },
];

/* ─── FAQs ──────────────────────────────────────────── */
const FAQS = [
  { q: 'كم يستغرق تطوير موقع أو تطبيق متكامل؟', a: 'الموقع التعريفي 5-7 أيام، المتجر الإلكتروني 2-4 أسابيع، والأنظمة المخصصة 4-8 أسابيع. نلتزم بالجدول 100%.' },
  { q: 'هل تقدمون ضماناً وصيانة بعد التسليم؟', a: 'نعم، ضمان كامل 3 أشهر لإصلاح أي مشكلة مجاناً، مع عروض صيانة شهرية بأسعار تنافسية.' },
  { q: 'ما التقنيات التي تستخدمونها؟', a: 'React وNext.js للويب، Flutter وReact Native للجوال، MySQL وPostgreSQL للبيانات، Azure وAWS للاستضافة.' },
  { q: 'هل تعملون مع شركات خارج الأردن؟', a: 'بالتأكيد! نخدم الأردن، السعودية، الإمارات، الكويت، والبحرين. نتواصل عن بُعد بكفاءة عالية.' },
  { q: 'ما الفرق بين الاستضافة المشتركة والـ VPS؟', a: 'الاستضافة المشتركة مثالية للمواقع البسيطة بتكلفة منخفضة. VPS يوفر موارد مخصصة وأداءً أعلى للمتاجر والتطبيقات. السحابة (Azure/AWS) للأنظمة الضخمة التي تحتاج توسعاً تلقائياً.' },
];

/* ─── ANIMATED COUNTER ──────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = (target / 1800) * 16;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqOpen : ''}`}>
      <button className={styles.faqQ} onClick={() => setOpen(!open)}>
        <span>{q}</span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && <div className={styles.faqA}>{a}</div>}
    </div>
  );
}

/* ─── PORTFOLIO CARD ────────────────────────────────── */
function PortfolioCard({ p }) {
  // Use a placeholder colored card since real images might not exist
  const bgColors = {
    ecommerce: '#fdf4ff',
    restaurant: '#fff7ed',
    clinic: '#f0fdf4',
    realestate: '#eff6ff',
    education: '#fefce8',
    app: '#f0f9ff',
    erp: '#faf5ff',
    corporate: '#f8fafc',
  };
  const accentColors = {
    ecommerce: '#a855f7',
    restaurant: '#f97316',
    clinic: '#16a34a',
    realestate: '#3b82f6',
    education: '#eab308',
    app: '#0ea5e9',
    erp: '#8b5cf6',
    corporate: '#64748b',
  };
  const bg = bgColors[p.cat] || '#f8fafc';
  const accent = accentColors[p.cat] || '#6366f1';

  return (
    <div className={styles.portCard}>
      <div className={styles.portMedia} style={{ background: bg }}>
        <div className={styles.portPlaceholder} style={{ '--accent': accent }}>
          <span className={styles.portIndustryBig}>{p.industry.split(' ')[0]}</span>
          <span className={styles.portMockBar} style={{ background: accent }} />
          <div className={styles.portMockRows}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.portMockRow} style={{ width: `${85 - i * 12}%`, background: i === 0 ? accent : `${accent}30` }} />
            ))}
          </div>
          <div className={styles.portMockCards}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.portMockCard} style={{ '--c': accent }} />
            ))}
          </div>
        </div>
        <div className={styles.portBadgeWrap}>
          <span className={styles.portBadge} style={{ background: accent }}>{p.badge}</span>
        </div>
      </div>
      <div className={styles.portBody}>
        <span className={styles.portIndustry}>{p.industry}</span>
        <h3 className={styles.portTitle}>{p.title}</h3>
        <p className={styles.portDesc}>{p.desc}</p>
        <div className={styles.portTags}>
          {p.tags.map((t, i) => <span key={i} className={styles.portTag}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ──────────────────────────────────────────── */
export default function TechAgency() {
  const [portFilter, setPortFilter] = useState('all');
  const [projectType, setProjectType] = useState('ecommerce');
  const [platforms, setPlatforms] = useState(['web']);
  const [features, setFeatures] = useState(['payments', 'admin']);
  const [timeline, setTimeline] = useState('standard');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', company: '',
    service: 'متجر إلكتروني متكامل', budget: '700 - 1,500 د.أ', details: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const filteredPorts = portFilter === 'all' ? PORTFOLIO : PORTFOLIO.filter(p => p.cat === portFilter);

  const calcEstimate = () => {
    const bases = { ecommerce: 700, mobile: 950, erp: 1300, custom: 850 };
    const base = bases[projectType] || 700;
    const plat = platforms.length === 3 ? 2.2 : platforms.length === 2 ? 1.65 : 1;
    const feat = features.length * 130;
    const rush = timeline === 'express' ? 1.3 : 1;
    const total = Math.round((base * plat + feat) * rush);
    return { min: total, max: Math.round(total * 1.4) };
  };
  const est = calcEstimate();

  const togglePlatform = p => {
    if (platforms.includes(p)) { if (platforms.length > 1) setPlatforms(platforms.filter(x => x !== p)); }
    else setPlatforms([...platforms, p]);
  };
  const toggleFeature = f => setFeatures(features.includes(f) ? features.filter(x => x !== f) : [...features, f]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitting(true);
    try {
      await axios.post('/api/tech/lead', {
        ...formData,
        estimated_quote: `JOD ${est.min} - ${est.max}`,
        calculator_details: JSON.stringify({ projectType, platforms, features, timeline })
      });
    } catch (_) {}
    setSubmitted(true);
    setSubmitting(false);
  };

  const openWhatsApp = () => {
    const txt = encodeURIComponent(`مرحباً زهرة بيسان للتكنولوجيا 💻\nأود الاستفسار عن: ${formData.service}\nالاسم: ${formData.name || 'عميل مهتم'}`);
    window.open(`https://wa.me/962788888888?text=${txt}`, '_blank');
  };

  return (
    <div className={styles.page} dir="rtl">

      {/* ── NAV ──────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/tech" className={styles.brand}>
            <div className={styles.brandIcon}><Code2 size={20} /></div>
            <div>
              <span className={styles.brandMain}>زهرة بيسان تك</span>
              <span className={styles.brandSub}>ZAHRAT BEESAN TECH & SOFTWARE</span>
            </div>
          </Link>
          <nav className={styles.navLinks}>
            <a href="#services">الخدمات</a>
            <a href="#portfolio">أعمالنا</a>
            <a href="#hosting">الاستضافة</a>
            <a href="#calculator">الأسعار</a>
            <a href="#contact" className={styles.navCta}>ابدأ مشروعك ←</a>
            <Link to="/" className={styles.navStore}>👑 المتجر الملكي</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.gridOverlay} />
          <div className={styles.codeFloat1}><span style={{color:'#b8943a'}}>const</span> success = <span style={{color:'#16a34a'}}>true</span>;</div>
          <div className={styles.codeFloat2}>npm run <span style={{color:'#b8943a'}}>deploy</span></div>
          <div className={styles.codeFloat3}><span style={{color:'#6366f1'}}>{'{'}</span> uptime: <span style={{color:'#16a34a'}}>"99.9%"</span> <span style={{color:'#6366f1'}}>{'}'}</span></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}><Sparkles size={14} /> شريكك الرقمي الموثوق منذ 2018 — الأردن والخليج</div>
          <h1 className={styles.heroTitle}>
            نبني حلولاً رقمية<span className={styles.heroGold}> تصنع الفارق </span>الحقيقي
          </h1>
          <p className={styles.heroDesc}>
            من الفكرة إلى الإطلاق — متاجر إلكترونية، تطبيقات ذكية، أنظمة ERP، حلول ذكاء اصطناعي، واستضافة سحابية تضمن نمو أعمالك وتضاعف مبيعاتك.
          </p>
          <div className={styles.heroButtons}>
            <a href="#contact" className={styles.btnGold}><Zap size={18} /> ابدأ مشروعك الآن</a>
            <a href="#portfolio" className={styles.btnGhost}><span>شوف أعمالنا</span> <ArrowLeft size={18} /></a>
          </div>
          <div className={styles.statsStrip}>
            <div className={styles.statItem}><span className={styles.statNum}><AnimatedCounter target={99} suffix=".9%" /></span><span className={styles.statLbl}>وقت تشغيل مضمون</span></div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}><span className={styles.statNum}><AnimatedCounter target={3} suffix="X" /></span><span className={styles.statLbl}>مضاعفة متوسطة للمبيعات</span></div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}><span className={styles.statNum}><AnimatedCounter target={80} suffix="+" /></span><span className={styles.statLbl}>مشروع مُنجز</span></div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}><span className={styles.statNum}><AnimatedCounter target={24} suffix="/7" /></span><span className={styles.statLbl}>دعم فني</span></div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────── */}
      <section className={styles.section} id="services">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>مجالات خبرتنا</span>
            <h2 className={styles.sectionTitle}>خدمات برمجية بمعايير عالمية</h2>
            <p className={styles.sectionDesc}>حلول هندسية متكاملة للشركات الناشئة والمتاجر الرائدة والشركات الكبرى.</p>
          </div>
          <div className={styles.servicesGrid}>
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={styles.serviceCard}>
                  <div className={styles.serviceNum}>{s.num}</div>
                  <div className={styles.serviceIconBox}><Icon size={26} color="#b8943a" /></div>
                  <h3 className={styles.serviceTitle}>{s.title}</h3>
                  <span className={styles.serviceEn}>{s.enTitle}</span>
                  <p className={styles.serviceDesc}>{s.desc}</p>
                  <div className={styles.tagRow}>{s.tags.map((t, j) => <span key={j} className={styles.tag}>{t}</span>)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ────────────────────────── */}
      <section className={styles.portfolioSection} id="portfolio">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>أعمالنا ومشاريعنا</span>
            <h2 className={styles.sectionTitle}>نبني لجميع القطاعات والمجالات</h2>
            <p className={styles.sectionDesc}>80+ مشروع منجز في الأردن والخليج عبر أكثر من 12 قطاعاً تجارياً وخدمياً.</p>
          </div>

          {/* Category Filter */}
          <div className={styles.portFilters}>
            {PORT_CATS.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => setPortFilter(cat.id)}
                  className={`${styles.portFilter} ${portFilter === cat.id ? styles.portFilterActive : ''}`}>
                  <Icon size={14} /> {cat.label}
                </button>
              );
            })}
          </div>

          <div className={styles.portGrid}>
            {filteredPorts.map(p => <PortfolioCard key={p.id} p={p} />)}
          </div>

          <div className={styles.portCta}>
            <p>هذه مجرد أمثلة من أعمالنا — نبني لأي مجال أو فكرة!</p>
            <a href="#contact" className={styles.btnGold}><Send size={18} /> اطلب مشروعك الآن</a>
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────── */}
      <section className={styles.processSection} id="process">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>منهجيتنا في العمل</span>
            <h2 className={styles.sectionTitle}>من الفكرة إلى الإطلاق</h2>
          </div>
          <div className={styles.processGrid}>
            {PROCESS_STEPS.map((s, i) => (
              <div key={i} className={styles.processCard}>
                <div className={styles.processLine} />
                <div className={styles.processNum}>{s.num}</div>
                <h3 className={styles.processTitle}>{s.title}</h3>
                <p className={styles.processDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOSTING & DOMAINS ─────────────────── */}
      <section className={styles.section} id="hosting">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>استضافة ودومينات</span>
            <h2 className={styles.sectionTitle}>استضافة احترافية وأسعار الدومينات</h2>
            <p className={styles.sectionDesc}>خوادم سريعة وآمنة في الشرق الأوسط وأوروبا — SSL مجاني، دعم 24/7، وضمان استرداد خلال 30 يوم.</p>
          </div>

          {/* Hosting Plans */}
          <div className={styles.hostingGrid}>
            {HOSTING_PLANS.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <div key={i} className={`${styles.hostCard} ${plan.highlighted ? styles.hostHighlighted : ''}`}>
                  {plan.highlighted && <div className={styles.hostPopular}><Sparkles size={12} /> الأكثر طلباً</div>}
                  <div className={styles.hostIconWrap} style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}>
                    <Icon size={26} style={{ color: plan.color }} />
                  </div>
                  <div className={styles.hostNameEn}>{plan.nameEn}</div>
                  <div className={styles.hostNameAr}>{plan.name}</div>
                  <div className={styles.hostPrice}>
                    {plan.price === 'مخصص' ? (
                      <span className={styles.hostPriceBig}>بالاتفاق</span>
                    ) : (
                      <><span className={styles.hostPriceCur}>JOD</span><span className={styles.hostPriceBig}>{plan.price}</span><span className={styles.hostPricePer}>/{plan.period}</span></>
                    )}
                  </div>
                  <p className={styles.hostDesc}>{plan.desc}</p>
                  <div className={styles.hostFeatures}>
                    {plan.features.map((f, j) => (
                      <div key={j} className={styles.hostFeature}>
                        <span className={styles.hostFeatLabel}>{f.label}</span>
                        <span className={styles.hostFeatVal}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                  <a href="#contact" className={plan.highlighted ? styles.btnGold : styles.btnOutline} style={plan.highlighted ? {} : { '--outline-color': plan.color }}>
                    اطلب الآن ←
                  </a>
                </div>
              );
            })}
          </div>

          {/* Domain Prices */}
          <div className={styles.domainsSection}>
            <h3 className={styles.domainTitle}>أسعار تسجيل الدومينات <span className={styles.domainSub}>(بالدينار الأردني / سنة)</span></h3>
            <div className={styles.domainGrid}>
              {DOMAINS.map((d, i) => (
                <div key={i} className={`${styles.domainCard} ${d.popular ? styles.domainPopular : ''}`}>
                  {d.popular && <span className={styles.domainPopBadge}>شائع</span>}
                  <span className={styles.domainExt}>{d.ext}</span>
                  <div className={styles.domainPriceRow}>
                    <span className={styles.domainLabel}>تسجيل</span>
                    <span className={styles.domainPrice}>JOD {d.reg}</span>
                  </div>
                  <div className={styles.domainPriceRow}>
                    <span className={styles.domainLabel}>تجديد</span>
                    <span className={styles.domainRenew}>JOD {d.renew}</span>
                  </div>
                  <a href="#contact" className={styles.domainBtn}>اطلب ←</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ───────────────────────── */}
      <section className={styles.calcSection} id="calculator">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>حاسبة التكلفة الذكية</span>
            <h2 className={styles.sectionTitle}>قدّر تكلفة مشروعك فوراً</h2>
            <p className={styles.sectionDesc}>اختر مواصفات مشروعك واحصل على تقدير شفاف في ثوانٍ.</p>
          </div>
          <div className={styles.calcLayout}>
            <div className={styles.calcForm}>
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>نوع المشروع</label>
                <div className={styles.calcOptions}>
                  {[
                    { id: 'ecommerce', label: '🛍️ متجر إلكتروني', desc: 'دفع + شحن + ERP' },
                    { id: 'mobile', label: '📱 تطبيق جوال', desc: 'iOS + Android' },
                    { id: 'erp', label: '🏢 نظام ERP', desc: 'إدارة سحابية شاملة' },
                    { id: 'custom', label: '⚡ موقع مخصص', desc: 'عيادات، شركات، حجز' }
                  ].map(o => (
                    <button key={o.id} type="button" onClick={() => setProjectType(o.id)}
                      className={`${styles.calcOpt} ${projectType === o.id ? styles.calcOptActive : ''}`}>
                      <span className={styles.calcOptLabel}>{o.label}</span>
                      <span className={styles.calcOptDesc}>{o.desc}</span>
                      {projectType === o.id && <CheckCircle2 size={16} className={styles.calcCheck} color="#b8943a" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>المنصات</label>
                <div className={styles.calcPills}>
                  {[{ id: 'web', label: '🌐 ويب' }, { id: 'ios', label: '🍏 iOS' }, { id: 'android', label: '🤖 Android' }].map(p => (
                    <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                      className={`${styles.pill} ${platforms.includes(p.id) ? styles.pillActive : ''}`}>
                      {platforms.includes(p.id) && <Check size={13} />} {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>الميزات والإضافات</label>
                <div className={styles.calcFeatures}>
                  {[
                    { id: 'payments', label: '💳 بوابات الدفع الإلكتروني' },
                    { id: 'admin', label: '📊 لوحة تحكم مع إحصائيات' },
                    { id: 'ai', label: '🤖 شات بوت ذكاء اصطناعي' },
                    { id: 'multilang', label: '🌍 عربي + إنجليزي' },
                    { id: 'loyalty', label: '🏆 نقاط ولاء وكوبونات' },
                    { id: 'whatsapp', label: '💬 ربط واتساب آلي' }
                  ].map(f => (
                    <div key={f.id} onClick={() => toggleFeature(f.id)}
                      className={`${styles.featureRow} ${features.includes(f.id) ? styles.featureActive : ''}`}>
                      <div className={styles.checkbox}>{features.includes(f.id) && <Check size={11} />}</div>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>مدة التنفيذ</label>
                <div className={styles.timelineBtns}>
                  <button type="button" onClick={() => setTimeline('standard')} className={`${styles.timeBtn} ${timeline === 'standard' ? styles.timeBtnActive : ''}`}>⏳ قياسي (3-5 أسابيع)</button>
                  <button type="button" onClick={() => setTimeline('express')} className={`${styles.timeBtn} ${timeline === 'express' ? styles.timeBtnActive : ''}`}>⚡ مكثف سريع <span className={styles.rushBadge}>+30%</span></button>
                </div>
              </div>
            </div>
            <div className={styles.estimateCard}>
              <div className={styles.estHeader}><Sparkles size={20} color="#b8943a" /><span>التقدير المبدئي</span></div>
              <div className={styles.estPrice}>
                <span className={styles.estCur}>JOD</span>
                <span className={styles.estRange}>{est.min.toLocaleString()} – {est.max.toLocaleString()}</span>
              </div>
              <p className={styles.estNote}>* يشمل التصميم والبرمجة والاستضافة وشهر دعم مجاني</p>
              <div className={styles.estIncludes}>
                {['تصميم UI/UX فاخر مخصص', 'كود نظيف وآمن 100%', 'استضافة سحابية + SSL', 'دعم فني مجاني بعد التسليم'].map((item, i) => (
                  <div key={i} className={styles.estIncItem}><CheckCircle2 size={14} color="#16a34a" /> <span>{item}</span></div>
                ))}
              </div>
              <a href="#contact" className={styles.btnGoldFull}>احجز استشارة مجانية ←</a>
              <button onClick={openWhatsApp} className={styles.btnWa}><MessageCircle size={17} /> واتساب مباشر</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────── */}
      <section className={styles.testimSection}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>آراء عملائنا</span>
            <h2 className={styles.sectionTitle}>قصص نجاح حقيقية</h2>
          </div>
          <div className={styles.testimGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`${styles.testimCard} ${i === activeTestimonial ? styles.testimActive : ''}`}>
                <div className={styles.stars}>{[...Array(t.rating)].map((_, j) => <Star key={j} size={15} fill="#b8943a" color="#b8943a" />)}</div>
                <p className={styles.testimQuote}>"{t.quote}"</p>
                <div className={styles.testimAuthor}>
                  <div className={styles.testimAvatar}>{t.name[0]}</div>
                  <div><strong>{t.name}</strong><span>{t.role}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.testimDots}>
            {TESTIMONIALS.map((_, i) => <button key={i} onClick={() => setActiveTestimonial(i)} className={`${styles.dot} ${i === activeTestimonial ? styles.dotActive : ''}`} />)}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>أسئلة شائعة</span>
            <h2 className={styles.sectionTitle}>كل ما تريد معرفته</h2>
          </div>
          <div className={styles.faqList}>{FAQS.map((f, i) => <FAQItem key={i} {...f} />)}</div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────── */}
      <section className={styles.contactSection} id="contact">
        <div className={styles.container}>
          <div className={styles.contactLayout}>
            <div className={styles.contactInfo}>
              <span className={styles.sectionTag}>تواصل معنا</span>
              <h2 className={styles.contactTitle}>جاهزون لتحويل فكرتك إلى واقع</h2>
              <p className={styles.contactDesc}>فريقنا الهندسي جاهز لدراسة فكرتك وتنفيذ مشروعك بأعلى معايير الاحترافية.</p>
              <div className={styles.contactItems}>
                <div className={styles.contactItem}><div className={styles.contactIcon}><Phone size={18} color="#b8943a" /></div><div><strong>هاتف وواتساب</strong><span dir="ltr">+962 7 8888 8888</span></div></div>
                <div className={styles.contactItem}><div className={styles.contactIcon}><Mail size={18} color="#b8943a" /></div><div><strong>البريد الإلكتروني</strong><span dir="ltr">tech@zahratbeesan.com</span></div></div>
                <div className={styles.contactItem}><div className={styles.contactIcon}><Globe2 size={18} color="#b8943a" /></div><div><strong>المقر الرئيسي</strong><span>عمّان، المملكة الأردنية الهاشمية</span></div></div>
              </div>
              <button onClick={openWhatsApp} className={styles.btnWaLarge}><MessageCircle size={20} /> تواصل مباشر عبر الواتساب</button>
            </div>
            <div className={styles.contactForm}>
              {submitted ? (
                <div className={styles.successBox}>
                  <CheckCircle2 size={56} color="#16a34a" />
                  <h3>تم استلام طلبك! 🎉</h3>
                  <p>سيتواصل معك مستشارنا خلال دقائق.</p>
                  <button onClick={() => setSubmitted(false)} className={styles.btnOutline}>إرسال طلب آخر</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <h3 className={styles.formTitle}>طلب استشارة مجانية</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}><label>الاسم *</label><input required placeholder="سلطان العدوي" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                    <div className={styles.formField}><label>الهاتف *</label><input required dir="ltr" placeholder="079XXXXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                    <div className={styles.formField}><label>البريد الإلكتروني</label><input type="email" dir="ltr" placeholder="name@company.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                    <div className={styles.formField}><label>اسم الشركة / المشروع</label><input placeholder="اسم نشاطك التجاري" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} /></div>
                    <div className={styles.formField}><label>الخدمة المطلوبة</label>
                      <select value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })}>
                        <option>متجر إلكتروني متكامل</option>
                        <option>تطبيق هواتف ذكية</option>
                        <option>نظام ERP مخصص</option>
                        <option>حلول ذكاء اصطناعي</option>
                        <option>موقع تعريفي فاخر</option>
                        <option>استضافة سحابية ودومين</option>
                        <option>نظام إدارة مطعم</option>
                        <option>منصة عقارية</option>
                        <option>نظام عيادة طبية</option>
                        <option>منصة تعليمية</option>
                        <option>استشارة تقنية</option>
                      </select>
                    </div>
                    <div className={styles.formField}><label>الميزانية التقريبية</label>
                      <select value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })}>
                        <option>أقل من 300 د.أ (استضافة/دومين)</option>
                        <option>300 - 700 د.أ</option>
                        <option>700 - 1,500 د.أ</option>
                        <option>1,500 - 3,000 د.أ</option>
                        <option>أكثر من 3,000 د.أ</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formField}><label>تفاصيل مشروعك</label><textarea rows={4} placeholder="اكتب نبذة عن فكرتك، الميزات المطلوبة، أو أي استفسار..." value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} /></div>
                  <button type="submit" disabled={submitting} className={styles.btnSubmit}>
                    {submitting ? 'جاري الإرسال...' : <><Send size={17} /> إرسال الطلب والبدء فوراً</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.brandIcon}><Code2 size={16} /></div>
            <div><strong>زهرة بيسان للحلول الرقمية</strong><span>شريكك الهندسي لصناعة الحلول الرقمية الفاخرة.</span></div>
          </div>
          <div className={styles.footerLinks}>
            <Link to="/">👑 متجر الأزياء</Link>
            <a href="#services">الخدمات</a>
            <a href="#portfolio">أعمالنا</a>
            <a href="#hosting">الاستضافة</a>
            <a href="#contact">تواصل</a>
          </div>
          <div className={styles.footerCopy}>© {new Date().getFullYear()} Zahrat Beesan Tech — All Rights Reserved</div>
        </div>
      </footer>

    </div>
  );
}
