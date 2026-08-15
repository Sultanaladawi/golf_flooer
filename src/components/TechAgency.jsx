import React, { useState, useEffect, useRef } from 'react';
import styles from './TechAgency.module.css';
import {
  Code2, Smartphone, Globe2, Cpu, ShieldCheck, Sparkles,
  Check, CheckCircle2, Send, MessageCircle, Phone, Mail,
  Layers, Zap, ArrowLeft, Star, ChevronDown, ChevronUp,
  Server, HardDrive, Wifi, Globe, ShoppingBag, Utensils,
  Heart, Home, GraduationCap, Building2, Car, Scissors,
  Package, Filter, ExternalLink, BarChart3, Receipt, Users,
  Bot, Video, Database, MonitorCheck, Lock, CreditCard,
  CloudLightning, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ─── SERVICES ──────────────────────────────────────── */
const SERVICES = [
  {
    icon: Globe2,
    num: '01',
    title: 'المتاجر الإلكترونية الفاخرة',
    enTitle: 'Luxury E-Commerce Platforms',
    desc: 'نبني منصات تجارة إلكترونية متطورة وسريعة متكاملة مع بوابات الدفع (كليك، تمارا، تابي، فيزا)، الشحن الآلي، وإدارة المخزون الحية.',
    tags: ['React / Next.js', 'Node.js', 'بوابات دفع محلية ودولية', 'لوحة ERP ذكية'],
    accent: '#b8943a'
  },
  {
    icon: Smartphone,
    num: '02',
    title: 'تطبيقات الهواتف الذكية (iOS & Android)',
    enTitle: 'Native & Flutter Mobile Apps',
    desc: 'تصميم وبرمجة تطبيقات جوال فائقة السلاسة والسرعة تعمل على App Store وGoogle Play بتجربة مستخدم فاخرة ومريحة للعملاء.',
    tags: ['Flutter', 'React Native', 'Push Notifications', 'Offline Mode'],
    accent: '#3b82f6'
  },
  {
    icon: Cpu,
    num: '03',
    title: 'حلول الذكاء الاصطناعي والأتمتة',
    enTitle: 'AI Solutions & Smart Automation',
    desc: 'دمج نماذج GPT-4 وGemini، روبوتات المحادثة الذكية للمبيعات، وأتمتة رسائل الواتساب لرفع كفاءة العمليات ومضاعفة المبيعات.',
    tags: ['AI Chatbots', 'LLM Integration', 'أتمتة الواتساب', 'تحليل البيانات'],
    accent: '#8b5cf6'
  },
  {
    icon: Code2,
    num: '04',
    title: 'أنظمة ERP وإدارة الشركات المخصصة',
    enTitle: 'Custom ERP & Business Systems',
    desc: 'منظومة سحابية متكاملة مصممة لعملك: إدارة المبيعات، الفواتير الضريبية، المحاسبة، شؤون الموظفين، وسلاسل التوريد في منصة واحدة.',
    tags: ['SaaS ERP', 'CRM Systems', 'إدارة المخازن', 'تقارير مالية حية'],
    accent: '#10b981'
  },
  {
    icon: Layers,
    num: '05',
    title: 'تصميم واجهات وتجارب المستخدم (UI/UX)',
    enTitle: 'High-End UI/UX Design',
    desc: 'دراسة سلوك العملاء وتصميم واجهات عصرية فاخرة تركز على سهولة الاستخدام، جمالية التفاصيل، ومضاعفة معدلات التحويل والمبيعات.',
    tags: ['Figma UI/UX', 'Design Systems', 'Interactive Prototypes', 'Mobile-First'],
    accent: '#f43f5e'
  },
  {
    icon: ShieldCheck,
    num: '06',
    title: 'الاستضافة السحابية وحماية البيانات',
    enTitle: 'Cloud Architecture & DevOps',
    desc: 'بنية تحتية سحابية موثوقة على Azure وAWS مع حماية سيبرانية شاملة من الهجمات، نسخ احتياطي لحظي، وضمان عمل 99.9%.',
    tags: ['Microsoft Azure', 'Amazon AWS', 'WAF & DDoS Shield', '24/7 Monitoring'],
    accent: '#6366f1'
  }
];

/* ─── ALL-INDUSTRIES PORTFOLIO ──────────────────────── */
const PORTFOLIO = [
  {
    id: 1,
    cat: 'ecommerce',
    title: 'منصة زهرة بيسان الفاخرة للأزياء',
    industry: '👗 أزياء وعبايات راقية',
    desc: 'متجر إلكتروني فائق السرعة مع لوحة تحكم ERP شاملة، بوابات دفع متعددة، مشغل فيديو عالي الدقة، وتتبع حي للطلبات.',
    image: '/portfolio/fashion.jpg',
    tags: ['React', 'Node.js', 'MySQL', 'Azure Cloud', 'AI Assistant'],
    badge: 'E-Commerce Platform'
  },
  {
    id: 2,
    cat: 'ecommerce',
    title: 'منصة السوبرماركت والتوصيل السريع',
    industry: '🛒 بقالة وسوبرماركت',
    desc: 'منظومة طلب بقالة أونلاين مع تتبع جغرافي حي لمركبات التوصيل، إدارة ذكية لتعدد الفروع والمخزون، وتطبيق جوال فائق السلاسة.',
    image: '/portfolio/grocery.jpg',
    tags: ['Next.js', 'Flutter', 'MongoDB', 'Real-time GPS'],
    badge: 'Grocery & Delivery'
  },
  {
    id: 3,
    cat: 'restaurant',
    title: 'نظام المطاعم والكافيهات والمنيو الرقمي',
    industry: '🍕 مطاعم وكافيهات فاخرة',
    desc: 'منصة طلب طعام أونلاين مع QR Code Menu ذكي، نظام إدارة شاشات المطبخ KDS، تتبع التوصيل، ونقاط ولاء العملاء.',
    image: '/portfolio/restaurant.jpg',
    tags: ['React', 'Node.js', 'Socket.io', 'Google Maps API'],
    badge: 'Restaurant & POS'
  },
  {
    id: 4,
    cat: 'clinic',
    title: 'منظومة العيادات والمراكز الطبية الذكية',
    industry: '🏥 عيادات وأطباء ومستشفيات',
    desc: 'نظام حجز مواعيد أونلاين، سجلات طبية إلكترونية للمرضى، تذكيرات واتساب تلقائية، ودفع إلكتروني آمن وفق معايير HIPAA.',
    image: '/portfolio/clinic.jpg',
    tags: ['React', 'PostgreSQL', 'WhatsApp API', 'HIPAA Secure'],
    badge: 'Smart Healthcare'
  },
  {
    id: 5,
    cat: 'realestate',
    title: 'بوابة العقارات والمقاولات الفاخرة',
    industry: '🏡 عقارات وفلل وهندسة',
    desc: 'منصة عقارية متكاملة مع خرائط تفاعلية، جولات افتراضية 360°، نظام فلترة وبحث متقدم، وبوابة حجز وتواصل مع الوكلاء.',
    image: '/portfolio/realestate.jpg',
    tags: ['Next.js', 'Mapbox', 'PostgreSQL', 'AWS S3'],
    badge: 'Real Estate Portal'
  },
  {
    id: 6,
    cat: 'education',
    title: 'منصة التعليم والأكاديميات الإلكترونية (LMS)',
    industry: '📚 جامعات وأكاديميات تعليمية',
    desc: 'نظام إدارة تعلم ذكي LMS مع بث مباشر للمحاضرات، اختبارات تفاعلية، تصحيح آلي، إصدار شهادات رقمية، وبنوك أسئلة.',
    image: '/portfolio/education.jpg',
    tags: ['React', 'Node.js', 'Video Streaming', 'Student Analytics'],
    badge: 'EdTech & LMS'
  },
  {
    id: 7,
    cat: 'app',
    title: 'تطبيق حجوزات وخدمات VIP الفاخرة',
    industry: '💎 خدمات النخبة والكونسيرج',
    desc: 'تطبيق جوال فخم لخدمات كبار الشخصيات مع دفع آمن بنقرة واحدة، إشعارات حية، وتتبع الموقع اللحظي لمقدم الخدمة.',
    image: '/portfolio/vipapp.jpg',
    tags: ['Flutter', 'Firebase', 'Google Maps', 'Apple Pay'],
    badge: 'Mobile App (iOS & Android)'
  },
  {
    id: 8,
    cat: 'clinic',
    title: 'تطبيق الصيدليات وطلب الأدوية المعتمد',
    industry: '💊 صيدليات ومستلزمات طبية',
    desc: 'تطبيق طلب أدوية مع رفع الوصفة الطبية إلكترونياً، تحقق الصيدلي المعتمد، استشارات طبية فورية، وتوصيل سريع مع تتبع.',
    image: '/portfolio/pharmacy.jpg',
    tags: ['React Native', 'Node.js', 'Prescription OCR', 'Express Delivery'],
    badge: 'Pharmacy & Health App'
  },
  {
    id: 9,
    cat: 'erp',
    title: 'نظام ERP المؤسسي لإدارة المصانع والشركات',
    industry: '🏭 مصانع وسلاسل توريد',
    desc: 'منظومة سحابية مركزية لإدارة خطوط الإنتاج، المستودعات، المحاسبة العامة، الفواتير الضريبية، وإدارة شؤون الموظفين.',
    image: '/portfolio/erp.jpg',
    tags: ['SaaS Cloud ERP', 'Docker', 'Microservices', 'BI Analytics'],
    badge: 'Enterprise ERP System'
  },
  {
    id: 10,
    cat: 'corporate',
    title: 'الموقع المؤسسي لشركات المقاولات والهندسة',
    industry: '🏗️ شركات مقاولات ومؤسسات',
    desc: 'موقع تعريفي فاخر يعرض سابقة المشاريع الضخمة، نماذج طلب عروض الأسعار، خريطة المشاريع التفاعلية، وتوثيق الإنجازات.',
    image: '/portfolio/corporate.jpg',
    tags: ['Next.js', 'Sanity CMS', 'Mapbox', 'High Performance'],
    badge: 'Corporate Website'
  },
  {
    id: 11,
    cat: 'hospitality',
    title: 'منظومة الفنادق والمنتجعات السياحية (PMS)',
    industry: '🏨 فنادق وشقق فندقية ومنتجعات',
    desc: 'نظام إدارة فندقي متكامل مع محرك حجز مباشر، إدارة الغرف والأسعار، فواتير إلكترونية، والربط مع Booking.com وAirbnb.',
    image: '/portfolio/hotel.jpg',
    tags: ['React', 'Channel Manager', 'Stripe', 'Booking Engine'],
    badge: 'Hospitality & Booking'
  },
  {
    id: 12,
    cat: 'ecommerce',
    title: 'متجر العطور والمجوهرات الراقية',
    industry: '💎 عطور ومجوهرات ونفائس',
    desc: 'تصميم فخم يعكس الرقي مع تكبير دقيق للصور، ميزة نحت الأسماء على الهدايا، بوابات دفع بالتقسيط (تابي وتمارا)، وتغليف هدايا.',
    image: '/portfolio/fashion.jpg',
    tags: ['React', 'Custom Engraving UI', 'Tabby & Tamara', 'Fast CDN'],
    badge: 'Luxury Boutique'
  }
];

const PORT_CATS = [
  { id: 'all', label: 'جميع المشاريع', icon: Package },
  { id: 'ecommerce', label: 'متاجر إلكترونية', icon: ShoppingBag },
  { id: 'restaurant', label: 'مطاعم وكافيهات', icon: Utensils },
  { id: 'clinic', label: 'صحة وعيادات', icon: Heart },
  { id: 'realestate', label: 'عقارات وهندسة', icon: Home },
  { id: 'education', label: 'منصات تعليمية', icon: GraduationCap },
  { id: 'app', label: 'تطبيقات جوال', icon: Smartphone },
  { id: 'erp', label: 'أنظمة ERP', icon: Building2 },
  { id: 'hospitality', label: 'فنادق وسياحة', icon: Globe2 },
  { id: 'corporate', label: 'شركات ومؤسسات', icon: Code2 },
];

/* ─── ADMIN ERP SHOWCASE FEATURES ───────────────────── */
const ADMIN_FEATURES = [
  {
    icon: BarChart3,
    title: 'لوحة تحكم إحصائية حية',
    desc: 'متابعة المبيعات اليومية، الأرباح، متوسط قيمة السلة، والتقارير المالية التنبؤية بالذكاء الاصطناعي في شاشات تفاعلية واضحة.'
  },
  {
    icon: Database,
    title: 'إدارة المستودعات والمخزون الذكي',
    desc: 'متابعة الكميات عبر الفروع المتعددة، تنبيهات تلقائية عند اقتراب نفاد المنتج، وإدارة الباركود وموردي البضائع.'
  },
  {
    icon: Receipt,
    title: 'الفواتير الضريبية الإلكترونية',
    desc: 'إصدار فواتير متوافقة مع متطلبات ضريبة الدخل والمبيعات، طباعة حرارية سريعة، وتحميل الفواتير بصيغة PDF بنقرة واحدة.'
  },
  {
    icon: Bot,
    title: 'شات بوت الذكاء الاصطناعي والواتساب',
    desc: 'إرسال إشعارات فورية عبر الواتساب لتأكيد الطلبات وتحديثات الشحن، مع مساعد ذكي يجيب على أسئلة العملاء على مدار الساعة.'
  },
  {
    icon: Video,
    title: 'التحكم بالوسائط والفيديوهات بضغطة زر',
    desc: 'إمكانية تغيير فيديو الهيدر، البانرات الترويجية، وصور المنتجات مباشرة من لوحة التحكم دون الحاجة لكتابة أي كود.'
  },
  {
    icon: Users,
    title: 'إدارة الصلاحيات والموظفين',
    desc: 'تحديد صلاحيات دقيقة لكل مستخدم (مدير، كاشير، محاسب، مسؤول مستودع) مع سجل تدقيق يوثق جميع العمليات بالوقت والتاريخ.'
  }
];

/* ─── HOSTING & SERVER PLANS ────────────────────────── */
const HOSTING_PLANS = [
  {
    name: 'الاستضافة السريعة',
    nameEn: 'STARTER CLOUD',
    icon: Globe,
    price: '24',
    period: 'سنة',
    desc: 'الخيار الأفضل للمواقع التعريفية والمدونات والشركات الناشئة',
    features: [
      { label: 'مساحة التخزين', value: '10 GB NVMe SSD' },
      { label: 'نطاق ترددي (Bandwidth)', value: 'غير محدود' },
      { label: 'عدد الدومينات المربوطة', value: '1 دومين' },
      { label: 'حسابات البريد الرسمي', value: '5 صناديق بريد' },
      { label: 'شهادة أمان SSL', value: '✓ مجانية مدى الحياة' },
      { label: 'لوحة التحكم', value: 'cPanel حديثة وسهلة' },
      { label: 'النسخ الاحتياطي', value: 'أسبوعي تلقائي' },
      { label: 'الدعم الفني', value: 'دعم سريع 8/5' }
    ],
    highlighted: false,
    color: '#6366f1'
  },
  {
    name: 'السحابية الاحترافية',
    nameEn: 'PRO CLOUD HOSTING',
    icon: Server,
    price: '59',
    period: 'سنة',
    desc: 'الأنسب للمتاجر الإلكترونية والمواقع النشطة عالية الزيارات',
    features: [
      { label: 'مساحة التخزين', value: '50 GB NVMe SSD فائق' },
      { label: 'نطاق ترددي (Bandwidth)', value: 'غير محدود فائق السرعة' },
      { label: 'عدد الدومينات المربوطة', value: '5 دومينات' },
      { label: 'حسابات البريد الرسمي', value: 'غير محدود' },
      { label: 'شهادة أمان SSL', value: '✓ مجانية مدى الحياة' },
      { label: 'تسريع كاش مدمج (LiteSpeed)', value: '✓ 3X سرعة تحميل' },
      { label: 'النسخ الاحتياطي', value: 'يومي سحابي آلي' },
      { label: 'الدعم الفني', value: 'دعم مباشر 24/7' }
    ],
    highlighted: true,
    color: '#b8943a'
  },
  {
    name: 'سيرفر VPS سحابي مخصص',
    nameEn: 'MANAGED VPS CLOUD',
    icon: HardDrive,
    price: '149',
    period: 'سنة',
    desc: 'قوة معالجة حصرية للتطبيقات والمنصات الكبرى والـ ERP',
    features: [
      { label: 'الذاكرة العشوائية (RAM)', value: '8 GB DDR4 مخصصة' },
      { label: 'المعالج (CPU)', value: '4 vCPU Cores سريعة' },
      { label: 'التخزين السريع', value: '120 GB NVMe Enterprise' },
      { label: 'حركة البيانات', value: '10 TB / شهرياً' },
      { label: 'عنوان IP مخصص', value: '1 Dedicated Static IP' },
      { label: 'نظام التشغيل وإدارته', value: 'Ubuntu / CentOS مدار بالكامل' },
      { label: 'النسخ الاحتياطي', value: 'Snapshot يومي لحظي' },
      { label: 'الدعم الفني', value: 'أولوية قصوى 24/7' }
    ],
    highlighted: false,
    color: '#8b5cf6'
  },
  {
    name: 'البنية التحتية المؤسسية',
    nameEn: 'ENTERPRISE AZURE & AWS',
    icon: CloudLightning,
    price: 'مخصص',
    period: '',
    desc: 'تصميم بنية سحابية عملاقة على Azure وAWS مع موازنة أحمال وحماية متقدمة',
    features: [
      { label: 'المنصة السحابية', value: 'Microsoft Azure / AWS' },
      { label: 'التوسع التلقائي (Auto-Scale)', value: '✓ حسب ضغط الزوار' },
      { label: 'موزع الأحمال (Load Balancer)', value: '✓ مدمج ومتكرر' },
      { label: 'شبكة CDN عالمية', value: '✓ 250+ نقطة اتصال' },
      { label: 'حماية سيبرانية WAF & DDoS', value: '✓ درع حماية متكامل' },
      { label: 'ضمان التشغيل (SLA)', value: '99.99% Guaranteed' },
      { label: 'النسخ الاحتياطي', value: 'متعدد المناطق Multi-Region' },
      { label: 'مهندس سحابي مخصص', value: 'متابعة وإشراف دائم' }
    ],
    highlighted: false,
    color: '#10b981'
  }
];

/* ─── DOMAINS PRICING ───────────────────────────────── */
const DOMAINS = [
  { ext: '.com', reg: '12', renew: '14', popular: true, note: 'النطاق الأكثر شهرة وموثوقية في العالم' },
  { ext: '.jo', reg: '30', renew: '30', popular: true, note: 'النطاق الوطني الرسمي للمملكة الأردنية الهاشمية' },
  { ext: '.net', reg: '14', renew: '16', popular: false, note: 'مثالي للشركات التقنية والشبكات والخدمات' },
  { ext: '.store', reg: '8', renew: '18', popular: true, note: 'ممتاز للمتاجر الإلكترونية والعلامات التجارية' },
  { ext: '.app', reg: '16', renew: '18', popular: false, note: 'مخصص لتطبيقات الهواتف الذكية مع حماية HTTPS إجبارية' },
  { ext: '.tech', reg: '9', renew: '24', popular: false, note: 'للشركات البرمجية والمشاريع التقنية والابتكارية' },
  { ext: '.shop', reg: '8', renew: '20', popular: false, note: 'خيار عصري ومباشر لمواقع التسوق والتجارة' },
  { ext: '.online', reg: '6', renew: '18', popular: false, note: 'نطاق متعدد الأغراض وسهل الحفظ للأنشطة الرقمية' }
];

/* ─── ECOSYSTEM PARTNERS ────────────────────────────── */
const PARTNERS = [
  { name: 'CliQ الأردن', category: 'دفع فوري محلي', icon: CreditCard },
  { name: 'Visa & MasterCard', category: 'بطاقات دفع دولية', icon: Lock },
  { name: 'Apple Pay', category: 'دفع ذكي بنقرة واحدة', icon: Smartphone },
  { name: 'Tamara & Tabby', category: 'تقسيط بدون فوائد', icon: ShoppingBag },
  { name: 'Microsoft Azure', category: 'خوادم سحابية عالمية', icon: Server },
  { name: 'Amazon AWS', category: 'بنية تحتية موثوقة', icon: Database },
  { name: 'Cloudflare', category: 'حماية CDN وDDoS', icon: ShieldCheck },
  { name: 'WhatsApp Cloud API', category: 'إشعارات وبوتات آلية', icon: MessageCircle }
];

/* ─── PROCESS STEPS ─────────────────────────────────── */
const PROCESS_STEPS = [
  { num: '01', title: 'الاستشارة والتحليل الدقيق', desc: 'نجتمع بك لفهم أهدافك التجارية، نحلل المنافسين واحتياجات السوق، ونضع خطة تقنية محكمة.' },
  { num: '02', title: 'التصميم الفاخر والنمذجة (UI/UX)', desc: 'نصمم واجهات مخصصة وعصرية بأدوات Figma ونبني نموذجاً تفاعلياً تختبره بنفسك قبل كتابة الكود.' },
  { num: '03', title: 'الهندسة البرمجية المتطورة', desc: 'يكتب مهندسونا كوداً نظيفاً وقوياً بأحدث لغات البرمجة مع اجتماعات دورية وتحديثات أسبوعية شفافة.' },
  { num: '04', title: 'فحص الأداء وضمان الجودة (QA)', desc: 'نختبر النظام بدقة على كافة الهواتف والشاشات، ونتحقق من السرعة الخارقة وأمن البيانات 100%.' },
  { num: '05', title: 'الإطلاق السحابي والدعم المستمر', desc: 'نطلق مشروعك على السحابة بثقة تامة ونقدم ضماناً شاملاً ودعماً فنياً مجانياً بعد التسليم.' }
];

/* ─── TESTIMONIALS ──────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'أحمد المنصوري',
    role: 'مدير العمليات — مجموعة النخبة التجارية',
    quote: 'فريق زهرة بيسان التقني حوّل فكرتنا إلى منصة تجارة إلكترونية متكاملة خلال 3 أسابيع فقط. مبيعاتنا تضاعفت أكثر من مرتين خلال أول شهر بفضل سرعة الموقع وسلاسة الدفع.',
    rating: 5
  },
  {
    name: 'سارة الخطيب',
    role: 'مؤسسة — بوتيك سارة للأزياء',
    quote: 'التصميم فاخر جداً ويعكس هوية علامتنا التجارية بدقة مذهلة. لوحة التحكم سهلت علينا إدارة الفيديوهات والمخزون بضغطة زر. تجربة ممتازة تستحق كل التقدير.',
    rating: 5
  },
  {
    name: 'م. خالد العمري',
    role: 'الرئيس التنفيذي — مجموعة العمري للمقاولات',
    quote: 'نظام ERP الذي طوروه لنا وفّر علينا أكثر من 15 ساعة عمل أسبوعياً كانت تضيع في العمليات اليدوية. فريق هندسي محترف وملتزم بالمواعيد والجودة العالية.',
    rating: 5
  }
];

/* ─── FAQS ──────────────────────────────────────────── */
const FAQS = [
  {
    q: 'كم يستغرق تصميم وبرمجة موقع أو متجر إلكتروني متكامل؟',
    a: 'الموقع التعريفي الفاخر يستغرق 5–7 أيام عمل، المتجر الإلكتروني المتكامل مع بوابات الدفع يستغرق 2–3 أسابيع، والأنظمة المخصصة وتطبيقات الجوال من 3–6 أسابيع. نلتزم بالجدول الزمني بنسبة 100%.'
  },
  {
    q: 'هل سأتمكن من إدارة وتعديل المنتجات والفيديوهات بنفسي بعد الاستلام؟',
    a: 'نعم بالتأكيد! ستحصل على لوحة تحكم إدارية (Admin Panel) سهلة جداً وفاخرة باللغة العربية، تمكنك من إضافة وتعديل المنتجات، تغيير فيديوهات الواجهة والبانرات، متابعة الطلبات، وطباعة الفواتير بدون أي خبرة برمجية.'
  },
  {
    q: 'ما هي بوابات الدفع التي يمكن ربطها في المتجر أو التطبيق؟',
    a: 'نربط جميع بوابات الدفع المعتمدة: كليك (CliQ) في الأردن، فيزا وماستركارد، آبل باي (Apple Pay)، بوابات التقسيط (تابي وتمارا)، وStripe وPayPal للدفع الدولي.'
  },
  {
    q: 'هل تقدمون ضماناً ودعماً فنياً بعد تسليم المشروع؟',
    a: 'نعم، نقدم ضماناً كاملاً وشاملاً لمدة 3 أشهر بعد التسليم لإصلاح أي ملاحظات مجاناً، بالإضافة لتدريب كامل لفريق عملك وخطط صيانة وتطوير شهرية بأسعار منافسة.'
  },
  {
    q: 'ما هو الفرق بين الاستضافة السحابية وسيرفرات الـ VPS؟',
    a: 'الاستضافة السحابية المشتركة مثالية للمواقع والمتاجر في مراحلها الأولى بتكلفة اقتصادية. بينما سيرفر الـ VPS يمنحك معالجاً وذاكرة عشوائية مخصصة بالكامل لمتجرك لضمان أقصى سرعة واستيعاب آلاف الزوار في نفس اللحظة.'
  },
  {
    q: 'هل تقومون بتسجيل وحجز الدومين وربطه بالسيرفر نيابة عني؟',
    a: 'نعم، نقوم بإدارة كل شيء بالكامل من حجز الدومين المطلوب (.com, .jo وغيرها)، إعداد السيرفر، تثبيت شهادة الأمان SSL المجانية، وربط البريد الإلكتروني الرسمي لشركتك.'
  }
];

/* ─── ANIMATED COUNTER ──────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = (target / 1600) * 16;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
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

/* ─── PORTFOLIO CARD COMPONENT ──────────────────────── */
function PortfolioCard({ p }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={styles.portCard}>
      <div className={styles.portMediaWrap}>
        {!imgError ? (
          <img
            src={p.image}
            alt={p.title}
            className={styles.portImg}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.portImgFallback}>
            <span className={styles.portFallbackIcon}>{p.industry.split(' ')[0]}</span>
            <span className={styles.portFallbackTitle}>{p.title}</span>
          </div>
        )}
        <span className={styles.portBadge}>{p.badge}</span>
      </div>

      <div className={styles.portBody}>
        <span className={styles.portIndustry}>{p.industry}</span>
        <h3 className={styles.portTitle}>{p.title}</h3>
        <p className={styles.portDesc}>{p.desc}</p>
        <div className={styles.portTags}>
          {p.tags.map((t, idx) => (
            <span key={idx} className={styles.portTag}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────── */
export default function TechAgency() {
  const [portFilter, setPortFilter] = useState('all');
  const [projectType, setProjectType] = useState('ecommerce');
  const [platforms, setPlatforms] = useState(['web']);
  const [features, setFeatures] = useState(['payments', 'admin']);
  const [timeline, setTimeline] = useState('standard');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    service: 'متجر إلكتروني متكامل',
    budget: '700 - 1,500 د.أ',
    details: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const filteredPorts = portFilter === 'all'
    ? PORTFOLIO
    : PORTFOLIO.filter(p => p.cat === portFilter);

  // Cost calculator
  const calcEstimate = () => {
    const bases = { ecommerce: 650, mobile: 900, erp: 1250, custom: 550 };
    const base = bases[projectType] || 650;
    const plat = platforms.length === 3 ? 2.1 : (platforms.length === 2 ? 1.6 : 1);
    const feat = features.length * 110;
    const rush = timeline === 'express' ? 1.25 : 1;
    const total = Math.round((base * plat + feat) * rush);
    return { min: total, max: Math.round(total * 1.35) };
  };
  const est = calcEstimate();

  const togglePlatform = p => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) setPlatforms(platforms.filter(x => x !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const toggleFeature = f => {
    setFeatures(features.includes(f) ? features.filter(x => x !== f) : [...features, f]);
  };

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
    const txt = encodeURIComponent(
      `مرحباً زهرة بيسان للتكنولوجيا 💻✨\nأود الاستفسار عن خدمة: ${formData.service}\nالاسم: ${formData.name || 'عميل مهتم'}\nالميزانية المقدرة: ${formData.budget || 'غير محدد'}\nالتفاصيل: ${formData.details || 'طلب استشارة وتحديد موعد'}`
    );
    window.open(`https://wa.me/962788888888?text=${txt}`, '_blank');
  };

  return (
    <div className={styles.page} dir="rtl">

      {/* ── TOP NAV ──────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/tech" className={styles.brand}>
            <div className={styles.brandIcon}><Code2 size={22} /></div>
            <div>
              <span className={styles.brandMain}>زهرة بيسان للحلول الرقمية</span>
              <span className={styles.brandSub}>ZAHRAT BEESAN TECH & SOFTWARE</span>
            </div>
          </Link>

          <nav className={styles.navLinks}>
            <a href="#services">الخدمات</a>
            <a href="#portfolio">المشاريع والتخصصات</a>
            <a href="#admin-erp">لوحة تحكم ERP</a>
            <a href="#hosting">السيرفرات والدومينات</a>
            <a href="#calculator">حاسبة الأسعار</a>
            <a href="#contact" className={styles.navCta}>ابدأ مشروعك ←</a>
            <Link to="/" className={styles.navStore}>👑 المتجر الملكي</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.gridOverlay} />

          {/* Luxury Floating Tech Status Badges */}
          <div className={styles.floatCard1}>
            <div className={styles.floatPulseWrap}>
              <div className={styles.floatPulseRing} />
              <div className={styles.floatPulseDot} />
            </div>
            <div>
              <span className={styles.floatCardTitle}>حالة السيرفر: متصل 100%</span>
              <span className={styles.floatCardSub}>Uptime 99.99% • 24ms Response</span>
            </div>
          </div>

          <div className={styles.floatCard2}>
            <div className={styles.floatIconGold}><CloudLightning size={17} /></div>
            <div>
              <span className={styles.floatCardTitle}>نشر سحابي فوري ومؤتمت</span>
              <span className={styles.floatCardSub}>Microsoft Azure & AWS Cloud</span>
            </div>
          </div>

          <div className={styles.floatCard3}>
            <div className={styles.floatIconGreen}><ShieldCheck size={17} /></div>
            <div>
              <span className={styles.floatCardTitle}>تشفير وأمان مصرفي 256-Bit</span>
              <span className={styles.floatCardSub}>PCI-DSS & SSL Enterprise</span>
            </div>
          </div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={15} /> شريكك الهندسي الموثوق لتطوير وبناء المواقع والتطبيقات 2026
          </div>

          <h1 className={styles.heroTitle}>
            نبتكر الحلول البرمجية والمتاجر الرقمية
            <span className={styles.heroGold}> التي تصنع الفارق الحقيقي.</span>
          </h1>

          <p className={styles.heroDesc}>
            من الفكرة إلى الإطلاق الكامل — نصمم ونبرمج متاجر إلكترونية خارقة السرعة، تطبيقات هواتف ذكية، أنظمة ERP سحابية، وحلول ذكاء اصطناعي تضمن نمو مبيعاتك وتمنح علامتك التجارية المكانة التي تليق بها.
          </p>

          <div className={styles.heroButtons}>
            <a href="#contact" className={styles.btnGold}>
              <Zap size={19} /> ابدأ مشروعك الآن
            </a>
            <a href="#portfolio" className={styles.btnGhost}>
              <span>استكشف المشاريع والتخصصات</span> <ArrowLeft size={18} />
            </a>
          </div>

          {/* Trust Metrics Strip */}
          <div className={styles.statsStrip}>
            <div className={styles.statItem}>
              <span className={styles.statNum}><AnimatedCounter target={99} suffix=".9%" /></span>
              <span className={styles.statLbl}>استقرار وحماية سحابية</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}><AnimatedCounter target={3} suffix="X" /></span>
              <span className={styles.statLbl}>مضاعفة متوسطة للمبيعات</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}><AnimatedCounter target={85} suffix="+" /></span>
              <span className={styles.statLbl}>مشروع مُنجز بنجاح</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}><AnimatedCounter target={24} suffix="/7" /></span>
              <span className={styles.statLbl}>دعم فني وتطوير مستمر</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES SECTION ─────────────────── */}
      <section className={styles.section} id="services">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>مجالات خبرتنا البرمجية</span>
            <h2 className={styles.sectionTitle}>خدمات هندسية متكاملة بمعايير عالمية</h2>
            <p className={styles.sectionDesc}>
              حلول برمجية مصممة لدعم نمو الشركات الناشئة، المتاجر الرائدة، والشركات الكبرى في الأردن والخليج.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={styles.serviceCard}>
                  <div className={styles.serviceNum}>{s.num}</div>
                  <div className={styles.serviceIconBox}>
                    <Icon size={28} color="#b8943a" />
                  </div>
                  <h3 className={styles.serviceTitle}>{s.title}</h3>
                  <span className={styles.serviceEn}>{s.enTitle}</span>
                  <p className={styles.serviceDesc}>{s.desc}</p>
                  <div className={styles.tagRow}>
                    {s.tags.map((t, j) => (
                      <span key={j} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ALL-INDUSTRIES PORTFOLIO ─────────── */}
      <section className={styles.portfolioSection} id="portfolio">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>معرض الأعمال والتخصصات</span>
            <h2 className={styles.sectionTitle}>حلول مصممة خصيصاً لكل قطاع ومجال</h2>
            <p className={styles.sectionDesc}>
              استعرض نماذج وتطبيقات حية صممناها وطورناها لأكثر من 10 قطاعات تجارية وخدمية مختلفة.
            </p>
          </div>

          {/* Filter Pills */}
          <div className={styles.portFilters}>
            {PORT_CATS.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setPortFilter(cat.id)}
                  className={`${styles.portFilter} ${portFilter === cat.id ? styles.portFilterActive : ''}`}
                >
                  <Icon size={16} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Projects Grid */}
          <div className={styles.portGrid}>
            {filteredPorts.map(p => (
              <PortfolioCard key={p.id} p={p} />
            ))}
          </div>

          {/* Portfolio CTA Strip */}
          <div className={styles.portCta}>
            <div className={styles.portCtaContent}>
              <Sparkles size={28} color="#b8943a" />
              <div>
                <h3>هل لديك فكرة أو قطاع خاص ترغب بتطويره؟</h3>
                <p>فريقنا يصمم لك نظاماً مخصصاً بالكامل يلبي احتياجات عملك بدقة هندسية متناهية.</p>
              </div>
            </div>
            <a href="#contact" className={styles.btnGold}>
              <Send size={18} /> اطلب استشارة لمشروعك الآن
            </a>
          </div>
        </div>
      </section>

      {/* ── ADMIN ERP SHOWCASE ───────────────── */}
      <section className={styles.section} id="admin-erp" style={{ background: '#ffffff' }}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>منظومة الإدارة الذكية</span>
            <h2 className={styles.sectionTitle}>لوحة تحكم ERP شاملة لإدارة عملك بسهولة</h2>
            <p className={styles.sectionDesc}>
              تحكم كامل في مبيعاتك، مخزونك، فيديوهاتك، فواتيرك، وعملائك من شاشة واحدة باللغة العربية الفصحى.
            </p>
          </div>

          <div className={styles.adminGrid}>
            {ADMIN_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className={styles.adminCard}>
                  <div className={styles.adminIconBox}>
                    <Icon size={26} color="#b8943a" />
                  </div>
                  <h3 className={styles.adminTitle}>{feat.title}</h3>
                  <p className={styles.adminDesc}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOSTING & CLOUD SERVERS ──────────── */}
      <section className={styles.section} id="hosting">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>الخوادم والاستضافة السحابية</span>
            <h2 className={styles.sectionTitle}>باقات السيرفرات والاستضافة فائقة السرعة</h2>
            <p className={styles.sectionDesc}>
              بنية تحتية سحابية في مراكز بيانات متطورة مع أقراص NVMe فائقة السرعة، حماية SSL مجانية، ودعم 24/7.
            </p>
          </div>

          <div className={styles.hostingGrid}>
            {HOSTING_PLANS.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <div
                  key={i}
                  className={`${styles.hostCard} ${plan.highlighted ? styles.hostHighlighted : ''}`}
                >
                  {plan.highlighted && (
                    <div className={styles.hostPopular}>
                      <Sparkles size={12} /> الأكثر طلباً للمتاجر
                    </div>
                  )}
                  
                  <div
                    className={styles.hostIconWrap}
                    style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}35` }}
                  >
                    <Icon size={28} style={{ color: plan.color }} />
                  </div>

                  <div className={styles.hostNameEn}>{plan.nameEn}</div>
                  <div className={styles.hostNameAr}>{plan.name}</div>

                  <div className={styles.hostPrice}>
                    {plan.price === 'مخصص' ? (
                      <span className={styles.hostPriceBig}>حسب المواصفات</span>
                    ) : (
                      <>
                        <span className={styles.hostPriceCur}>JOD</span>
                        <span className={styles.hostPriceBig}>{plan.price}</span>
                        <span className={styles.hostPricePer}>/{plan.period}</span>
                      </>
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

                  <a
                    href="#contact"
                    className={plan.highlighted ? styles.btnGold : styles.btnOutline}
                  >
                    اطلب السيرفر الآن ←
                  </a>
                </div>
              );
            })}
          </div>

          {/* ── DOMAIN PRICING TABLE ── */}
          <div className={styles.domainsSection}>
            <div className={styles.domainHead}>
              <div>
                <h3 className={styles.domainTitle}>أسعار تسجيل وتجديد النطاقات (الدومينات)</h3>
                <p className={styles.domainSub}>الأسعار شاملة إدارة الـ DNS المجانية، حماية الخصوصية WHOIS، وربط تلقائي بالسيرفر.</p>
              </div>
              <div className={styles.domainTag}>دفع سنوي شفاف بالدينار الأردني</div>
            </div>

            <div className={styles.domainGrid}>
              {DOMAINS.map((d, i) => (
                <div key={i} className={`${styles.domainCard} ${d.popular ? styles.domainPopular : ''}`}>
                  {d.popular && <span className={styles.domainPopBadge}>موصى به</span>}
                  <span className={styles.domainExt}>{d.ext}</span>
                  <p className={styles.domainNote}>{d.note}</p>
                  
                  <div className={styles.domainPriceRow}>
                    <span className={styles.domainLabel}>التسجيل الجديد</span>
                    <span className={styles.domainPrice}>JOD {d.reg}</span>
                  </div>
                  <div className={styles.domainPriceRow}>
                    <span className={styles.domainLabel}>التجديد السنوي</span>
                    <span className={styles.domainRenew}>JOD {d.renew}</span>
                  </div>

                  <a href="#contact" className={styles.domainBtn}>
                    احجز الدومين ←
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── PARTNERS & PAYMENT GATEWAYS ──────── */}
      <section className={styles.partnersSection}>
        <div className={styles.container}>
          <div className={styles.sectionHead} style={{ marginBottom: '36px' }}>
            <span className={styles.sectionTag}>التكامل والشراكات التقنية</span>
            <h2 className={styles.sectionTitle} style={{ fontSize: '1.9rem' }}>
              متكاملون مع أقوى بوابات الدفع والمنصات السحابية
            </h2>
          </div>

          <div className={styles.partnersGrid}>
            {PARTNERS.map((partner, idx) => {
              const Icon = partner.icon;
              return (
                <div key={idx} className={styles.partnerCard}>
                  <div className={styles.partnerIcon}>
                    <Icon size={20} color="#b8943a" />
                  </div>
                  <div>
                    <strong>{partner.name}</strong>
                    <span>{partner.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SMART COST CALCULATOR ────────────── */}
      <section className={styles.calcSection} id="calculator">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>حاسبة التكلفة الذكية التفاعلية</span>
            <h2 className={styles.sectionTitle}>قدّر تكلفة ومدة مشروعك خلال لحظات</h2>
            <p className={styles.sectionDesc}>
              اختر مواصفات نظامك واحصل على تقدير فوري وشفاف لميزانية التصميم والتطوير والاستضافة.
            </p>
          </div>

          <div className={styles.calcLayout}>
            
            {/* Options Form */}
            <div className={styles.calcForm}>
              
              {/* 1. Project Type */}
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>1. ما هو نوع المنظومة المطلوبة؟</label>
                <div className={styles.calcOptions}>
                  {[
                    { id: 'ecommerce', label: '🛍️ متجر إلكتروني متكامل', desc: 'بيع المنتجات، دفع، شحن، ERP' },
                    { id: 'mobile', label: '📱 تطبيق هاتف ذكي (iOS/Android)', desc: 'تطبيق أندرويد وآبل فائق السرعة' },
                    { id: 'erp', label: '🏢 نظام ERP وإدارة أعمال', desc: 'مخازن، محاسبة، موظفين، فواتير' },
                    { id: 'custom', label: '⚡ موقع تعريفي وخدمي راقي', desc: 'شركات، عيادات، منصات حجز' }
                  ].map(o => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setProjectType(o.id)}
                      className={`${styles.calcOpt} ${projectType === o.id ? styles.calcOptActive : ''}`}
                    >
                      <span className={styles.calcOptLabel}>{o.label}</span>
                      <span className={styles.calcOptDesc}>{o.desc}</span>
                      {projectType === o.id && (
                        <CheckCircle2 size={18} className={styles.calcCheck} color="#b8943a" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Target Platforms */}
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>2. المنصات المستهدفة:</label>
                <div className={styles.calcPills}>
                  {[
                    { id: 'web', label: '🌐 منصة ويب تفاعلية (Web App)' },
                    { id: 'ios', label: '🍏 تطبيق أبل (iOS)' },
                    { id: 'android', label: '🤖 تطبيق أندرويد (Android)' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`${styles.pill} ${platforms.includes(p.id) ? styles.pillActive : ''}`}
                    >
                      {platforms.includes(p.id) && <Check size={14} />} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Features */}
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>3. الميزات والإضافات المتقدمة:</label>
                <div className={styles.calcFeatures}>
                  {[
                    { id: 'payments', label: '💳 بوابات الدفع الإلكتروني (CliQ, Visa, Apple Pay)' },
                    { id: 'admin', label: '📊 لوحة تحكم إدارية متقدمة مع إحصائيات حية' },
                    { id: 'ai', label: '🤖 شات بوت ذكاء اصطناعي للرد الآلي والمبيعات' },
                    { id: 'multilang', label: '🌍 دعم متعدد اللغات (عربي / إنجليزي)' },
                    { id: 'loyalty', label: '🏆 نظام نقاط ولاء وكوبونات خصم' },
                    { id: 'whatsapp', label: '💬 ربط آلي مع إشعارات ورسائل الواتساب' }
                  ].map(f => (
                    <div
                      key={f.id}
                      onClick={() => toggleFeature(f.id)}
                      className={`${styles.featureRow} ${features.includes(f.id) ? styles.featureActive : ''}`}
                    >
                      <div className={styles.checkbox}>
                        {features.includes(f.id) && <Check size={12} />}
                      </div>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Timeline */}
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>4. الجدول الزمني المفضل للإنجاز:</label>
                <div className={styles.timelineBtns}>
                  <button
                    type="button"
                    onClick={() => setTimeline('standard')}
                    className={`${styles.timeBtn} ${timeline === 'standard' ? styles.timeBtnActive : ''}`}
                  >
                    ⏳ قياسي (2 - 4 أسابيع)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeline('express')}
                    className={`${styles.timeBtn} ${timeline === 'express' ? styles.timeBtnActive : ''}`}
                  >
                    ⚡ سريع ومكثف (7 - 12 يوم) <span className={styles.rushBadge}>+25%</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Estimate Summary Card */}
            <div className={styles.estimateCard}>
              <div className={styles.estHeader}>
                <Sparkles size={22} color="#b8943a" />
                <span>التقدير المبدئي للاستثمار</span>
              </div>

              <div className={styles.estPrice}>
                <span className={styles.estCur}>JOD</span>
                <span className={styles.estRange}>{est.min.toLocaleString()} – {est.max.toLocaleString()}</span>
              </div>

              <p className={styles.estNote}>
                * التقدير يشمل التصميم الفاخر، البرمجة الكاملة، الاستضافة السحابية السريعة، وتدريب فريق العمل.
              </p>

              <div className={styles.estIncludes}>
                {[
                  'تصميم واجهات UI/UX حصرية لعلامتك',
                  'برمجة آمنة 100% بدون قوالب جاهزة',
                  'استضافة سحابية فائقة السرعة + SSL مجاني',
                  'دعم فني وضمان تشغيلي لمدة 3 أشهر'
                ].map((item, i) => (
                  <div key={i} className={styles.estIncItem}>
                    <CheckCircle2 size={16} color="#16a34a" /> <span>{item}</span>
                  </div>
                ))}
              </div>

              <a href="#contact" className={styles.btnGoldFull}>
                اعتماد المواصفات وحجز موعد التنفيذ ←
              </a>

              <button onClick={openWhatsApp} className={styles.btnWa}>
                <MessageCircle size={18} /> تواصل فوري عبر الواتساب
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── WORK METHODOLOGY ─────────────────── */}
      <section className={styles.processSection} id="process">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>منهجية العمل المحكمة</span>
            <h2 className={styles.sectionTitle}>رحلة مشروعك من الفكرة إلى النجاح</h2>
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

      {/* ── CLIENT TESTIMONIALS ──────────────── */}
      <section className={styles.testimSection}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>آراء وشهادات العملاء</span>
            <h2 className={styles.sectionTitle}>قصص نجاح حقيقية نفخر بصناعتها</h2>
          </div>

          <div className={styles.testimGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`${styles.testimCard} ${i === activeTestimonial ? styles.testimActive : ''}`}
              >
                <div className={styles.stars}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} fill="#b8943a" color="#b8943a" />
                  ))}
                </div>
                <p className={styles.testimQuote}>"{t.quote}"</p>
                <div className={styles.testimAuthor}>
                  <div className={styles.testimAvatar}>{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.testimDots}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`${styles.dot} ${i === activeTestimonial ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQS ─────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>الأسئلة الأكثر شيوعاً</span>
            <h2 className={styles.sectionTitle}>كل ما ترغب بمعرفته حول خدماتنا</h2>
          </div>

          <div className={styles.faqList}>
            {FAQS.map((f, i) => (
              <FAQItem key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT & CONSULTATION FORM ──────── */}
      <section className={styles.contactSection} id="contact">
        <div className={styles.container}>
          <div className={styles.contactLayout}>
            
            <div className={styles.contactInfo}>
              <span className={styles.sectionTag}>تواصل معنا الآن</span>
              <h2 className={styles.contactTitle}>جاهزون لتحويل رؤيتك الرقمية إلى واقع ملموس</h2>
              <p className={styles.contactDesc}>
                فريقنا الهندسي جاهز لدراسة فكرتك، تقديم الاستشارة التقنية الأمثل، وتنفيذ مشروعك بأعلى درجات الاحترافية والسرعة.
              </p>

              <div className={styles.contactItems}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}><Phone size={20} color="#b8943a" /></div>
                  <div>
                    <strong>الهاتف والواتساب المباشر</strong>
                    <span dir="ltr">+962 7 8888 8888</span>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}><Mail size={20} color="#b8943a" /></div>
                  <div>
                    <strong>البريد الإلكتروني الرسمي</strong>
                    <span dir="ltr">tech@zahratbeesan.com</span>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}><Globe2 size={20} color="#b8943a" /></div>
                  <div>
                    <strong>المقر الرئيسي</strong>
                    <span>عمّان، المملكة الأردنية الهاشمية</span>
                  </div>
                </div>
              </div>

              <button onClick={openWhatsApp} className={styles.btnWaLarge}>
                <MessageCircle size={22} /> تواصل فوري ومباشر عبر الواتساب
              </button>
            </div>

            <div className={styles.contactForm}>
              {submitted ? (
                <div className={styles.successBox}>
                  <CheckCircle2 size={60} color="#16a34a" />
                  <h3>تم استلام طلبك بنجاح! 🎉</h3>
                  <p>
                    شكراً لتواصلك مع زهرة بيسان للحلول الرقمية. سيقوم مستشارنا التقني بالتواصل معك هاتفياً وعبر الواتساب خلال دقائق لمناقشة تفاصيل المشروع.
                  </p>
                  <button onClick={() => setSubmitted(false)} className={styles.btnOutline}>
                    إرسال استفسار آخر
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <h3 className={styles.formTitle}>طلب استشارة وعرض سعر مجاني</h3>

                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label>الاسم الكريم *</label>
                      <input
                        required
                        type="text"
                        placeholder="مثال: سلطان العدوي"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>رقم الهاتف / الواتساب *</label>
                      <input
                        required
                        type="tel"
                        dir="ltr"
                        placeholder="079XXXXXXXX"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>البريد الإلكتروني</label>
                      <input
                        type="email"
                        dir="ltr"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>اسم الشركة أو النشاط التجاري</label>
                      <input
                        type="text"
                        placeholder="اسم متجرك أو شركتك"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>نوع الخدمة المطلوبة</label>
                      <select
                        value={formData.service}
                        onChange={e => setFormData({ ...formData, service: e.target.value })}
                      >
                        <option>متجر إلكتروني متكامل</option>
                        <option>تطبيق هواتف ذكية (iOS & Android)</option>
                        <option>نظام ERP وإدارة أعمال سحابية</option>
                        <option>حلول وأتمتة الذكاء الاصطناعي</option>
                        <option>استضافة سحابية وسيرفرات VPS</option>
                        <option>حجز وتسجيل دومين رسمي</option>
                        <option>نظام مطاعم وكافيهات وكاشير POS</option>
                        <option>منظومة عيادات ومراكز طبية</option>
                        <option>منصة عقارات ومقاولات</option>
                        <option>منصة تعليمية LMS</option>
                        <option>استشارة وتطوير برمجيات خاصة</option>
                      </select>
                    </div>

                    <div className={styles.formField}>
                      <label>الميزانية التقريبية</label>
                      <select
                        value={formData.budget}
                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                      >
                        <option>أقل من 300 د.أ (استضافة ودومين)</option>
                        <option>300 - 700 د.أ</option>
                        <option>700 - 1,500 د.أ</option>
                        <option>1,500 - 3,000 د.أ</option>
                        <option>أكثر من 3,000 د.أ (أنظمة كبرى)</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formField}>
                    <label>تفاصيل وملاحظات حول مشروعك</label>
                    <textarea
                      rows={4}
                      placeholder="اكتب نبذة عن فكرتك، الميزات الخاصة التي ترغب بها، أو أي استفسار تريده..."
                      value={formData.details}
                      onChange={e => setFormData({ ...formData, details: e.target.value })}
                    />
                  </div>

                  <button type="submit" disabled={submitting} className={styles.btnSubmit}>
                    {submitting ? 'جاري إرسال الطلب...' : <><Send size={18} /> إرسال طلب المشروع والبدء فوراً</>}
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
            <div className={styles.brandIcon}><Code2 size={18} /></div>
            <div>
              <strong>زهرة بيسان للحلول الرقمية وتكنولوجيا المعلومات</strong>
              <span>شريكك الهندسي الموثوق لصناعة المنظومات والمتاجر الرقمية الفاخرة.</span>
            </div>
          </div>

          <div className={styles.footerLinks}>
            <Link to="/">👑 متجر الأزياء والعبايات</Link>
            <a href="#services">الخدمات التقنية</a>
            <a href="#portfolio">سابقة الأعمال</a>
            <a href="#admin-erp">لوحة تحكم ERP</a>
            <a href="#hosting">السيرفرات والدومينات</a>
            <a href="#calculator">حاسبة التكلفة</a>
            <a href="#contact">طلب استشارة</a>
          </div>

          <div className={styles.footerCopy}>
            © {new Date().getFullYear()} Zahrat Beesan Tech Solutions. All Rights Reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
