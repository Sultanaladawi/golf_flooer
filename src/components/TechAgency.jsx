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
  CloudLightning, RefreshCw, Briefcase, Scale, Truck, Wrench,
  Calendar, Plane, FileText, Activity, Award, Search, Eye,
  Play, X, Maximize2, SlidersHorizontal, Layers3, Box, Settings,
  HelpCircle, CheckSquare, Compass, MapPin, Tag, Clock, Headphones,
  MessageSquare, Coffee, Pill, Sparkle, DollarSign, LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ─── SERVICES WITH DEEP DIVE SPECS ───────────────── */
const SERVICES = [
  {
    id: 'ecommerce',
    icon: Globe2,
    num: '01',
    title: 'المتاجر الإلكترونية الفاخرة',
    enTitle: 'Luxury E-Commerce Platforms',
    desc: 'نبني منصات تجارة إلكترونية متطورة وسريعة متكاملة مع بوابات الدفع (كليك، تمارا، تابي، فيزا)، الشحن الآلي، وإدارة المخزون الحية.',
    tags: ['React / Next.js', 'Node.js', 'بوابات دفع محلية ودولية', 'لوحة ERP ذكية'],
    accent: '#b8943a',
    deepOverview: 'نبني متاجر إلكترونية ذات طابع فاخر وسرعة فائقة تتفوق على المنصات الجاهزة بنسبة 400% في سرعة التحميل وتجربة الشراء، مع تخصيص كامل 100% دون أي عمولات مقتطعة من مبيعاتك.',
    deliverables: [
      'متجر ويب متجاوب بالكامل مع الهواتف الذكية والأجهزة اللوحية',
      'تكامل بوابات الدفع: CliQ، تمارا، تابي، فيزا، ماستركارد، Apple Pay',
      'لوحة تحكم ERP شاملة لإدارة الطلبات والمخازن والعملاء',
      'نظام كوبونات وعروض ترويجية وخصومات متقدمة',
      'إشعارات الرسائل والواتساب الآلية عند كل حركة طلب',
      'تتبع مباشر لتحركات الزوار في الوقت الفعلي (Live Store Radar)'
    ],
    techStack: [
      { name: 'React 18 / Next.js', role: 'واجهة المستخدم فائقة السرعة' },
      { name: 'Node.js & Express', role: 'خوادم معالجة الطلبات والـ API' },
      { name: 'MySQL / PostgreSQL', role: 'قواعد البيانات المتوافقة مع ACID' },
      { name: 'Microsoft Azure', role: 'الاستضافة السحابية وشهادات الأمان' }
    ],
    pipeline: [
      { step: '01', title: 'دراسة المتطلبات', desc: 'تحليل المنتجات والجمهور وتحديد بوابات الدفع والشحن' },
      { step: '02', title: 'تصميم الواجهات UI/UX', desc: 'ابتكار هوية بصرية فاخرة وتجربة شراء سلسة بلمسة واحدة' },
      { step: '03', title: 'البرمجة والتكامل', desc: 'بناء النظام وربط بوابات الدفع والفواتير الضريبية' },
      { step: '04', title: 'الإطلاق والضمان', desc: 'رفع المتجر على السحابة مع دعم فني وضمان سنة كاملة' }
    ],
    timelineEstimate: '7 إلى 14 يوم عمل',
    priceRange: '490 - 950 د.أ'
  },
  {
    id: 'mobile',
    icon: Smartphone,
    num: '02',
    title: 'تطبيقات الهواتف الذكية (iOS & Android)',
    enTitle: 'Native & Flutter Mobile Apps',
    desc: 'تصميم وبرمجة تطبيقات جوال فائقة السلاسة والسرعة تعمل على App Store وGoogle Play بتجربة مستخدم فاخرة ومريحة للعملاء.',
    tags: ['Flutter', 'React Native', 'Push Notifications', 'Offline Mode'],
    accent: '#3b82f6',
    deepOverview: 'نطور تطبيقات هواتف هجينة وأصلية تمنح عملاءك تجربة استخدام استثنائية وسلسة على الآيفون والأندرويد مع دعم الإشعارات الفورية والدفع بنقرة واحدة.',
    deliverables: [
      'تطبيق مخصص لنظام iOS (App Store) ونظام Android (Google Play)',
      'نظام إشعارات فورية تسويقية (Push Notifications) لجذب العملاء',
      'دعم وضع العمل دون إنترنت (Offline Caching)',
      'تكامل الموقع الإلكتروني مع التطبيق بقاعدة بيانات مركزية موحدة',
      'تتبع مباشر لموقع المناديب والشحن عبر خرائط GPS',
      'مساعدة كاملة في نشر التطبيقات على الحسابات الرسمية للمتاجر'
    ],
    techStack: [
      { name: 'Flutter & Dart', role: 'إطار العمل الموحد عالي الأداء' },
      { name: 'Firebase Cloud Messaging', role: 'نظام الإشعارات اللحظية' },
      { name: 'REST & GraphQL API', role: 'الربط السحابي فائق السرعة' },
      { name: 'Apple & Google Pay', role: 'بوابات الدفع بلمسة الإصبع' }
    ],
    pipeline: [
      { step: '01', title: 'تخطيط تجربة المستخدم', desc: 'رسم رحلة العميل وتدفق الشاشات التفاعلية' },
      { step: '02', title: 'النمذجة والبرمجة', desc: 'برمجة التطبيق وربط قواعد البيانات السحابية' },
      { step: '03', title: 'فحص الجودة والأداء', desc: 'اختبار التطبيق على عشرات الأجهزة للتأكد من انعدام الأخطاء' },
      { step: '04', title: 'النشر في المتاجر', desc: 'رفع واعتماد التطبيق رسمياً على App Store وGoogle Play' }
    ],
    timelineEstimate: '10 إلى 21 يوم عمل',
    priceRange: '750 - 1,450 د.أ'
  },
  {
    id: 'ai',
    icon: Cpu,
    num: '03',
    title: 'حلول الذكاء الاصطناعي والأتمتة',
    enTitle: 'AI Solutions & Smart Automation',
    desc: 'دمج نماذج GPT-4 وGemini، روبوتات المحادثة الذكية للمبيعات، وأتمتة رسائل الواتساب لرفع كفاءة العمليات ومضاعفة المبيعات.',
    tags: ['AI Chatbots', 'LLM Integration', 'أتمتة الواتساب', 'تحليل البيانات'],
    accent: '#8b5cf6',
    deepOverview: 'نحول عملك إلى شركة ذكية مؤتمتة تعمل 24 ساعة دون توقف! ندمج أحدث نماذج الذكاء الاصطناعي (GPT-4o, Claude 3.5, Gemini 1.5) لخدمة العملاء، الرد على المحادثات، وتوقع سلوك المشترين.',
    deliverables: [
      'شات بوت ذكاء اصطناعي مدرب على كتالوج منتجاتك وسياساتك بالكامل',
      'أتمتة محادثات الواتساب الرسمية (WhatsApp Business Cloud API)',
      'نظام ترشيح وتوصية منتجات ذكي مخصص لكل عميل',
      'تحليلات تنبؤية للمبيعات وتنبيهات بنفاد المخزون تلقائياً',
      'توليد محتوى ووصف المنتجات والتسويق بضغطة زر واحدة'
    ],
    techStack: [
      { name: 'OpenAI GPT-4o API', role: 'محرك المحادثة والاستيعاب الذكي' },
      { name: 'Google Gemini Pro', role: 'تحليل الوسائط والبيانات الضخمة' },
      { name: 'Meta WhatsApp API', role: 'الربط المعتمد مع تطبيق الواتساب' },
      { name: 'Python & FastApi', role: 'معالجة وتدريب نماذج البيانات' }
    ],
    pipeline: [
      { step: '01', title: 'تغذية البيانات', desc: 'جمع معلومات المنتجات والأسعار والأسئلة الشائعة' },
      { step: '02', title: 'تدريب الـ AI', desc: 'ضبط النبرة وتدريب النموذج على اللهجات واللغة العربية' },
      { step: '03', title: 'ربط القنوات', desc: 'دمج المساعد الذكي مع موقعك وحساب الواتساب وإنستغرام' },
      { step: '04', title: 'المراقبة والتحسين', desc: 'تحسين دقة الإجابات ومتابعة تفاعلات الزبائن' }
    ],
    timelineEstimate: '5 إلى 10 أيام عمل',
    priceRange: '350 - 800 د.أ'
  },
  {
    id: 'erp',
    icon: Code2,
    num: '04',
    title: 'أنظمة ERP وإدارة الشركات المخصصة',
    enTitle: 'Custom ERP & Business Systems',
    desc: 'منظومة سحابية متكاملة مصممة لعملك: إدارة المبيعات، الفواتير الضريبية، المحاسبة، شؤون الموظفين، وسلاسل التوريد في منصة واحدة.',
    tags: ['SaaS ERP', 'CRM Systems', 'إدارة المخازن', 'تقارير مالية حية'],
    accent: '#10b981',
    deepOverview: 'منظومة إدارية سحابية مخصصة تجمع كل عمليات شركتك في لوحة تحكم واحدة، مما يوفر مئات ساعات العمل اليدوية ويقضي على الأخطاء المحاسبية تماماً.',
    deliverables: [
      'نظام فواتير ضريبية إلكترونية معتمد برمز الاستجابة السريعة QR',
      'إدارة المخزون متعدد المستودعات مع تنبيهات النواقص',
      'نظام إدارة علاقات العملاء (CRM) وسجل المشتريات والولاء',
      'إدارة الصندوق والحسابات المحاسبية وتقارير الأرباح والخسائر',
      'إدارة صلاحيات الموظفين والمستخدمين وتتبع سجل النشاط'
    ],
    techStack: [
      { name: 'Enterprise PostgreSQL', role: 'قاعدة البيانات المالية المحصنة' },
      { name: 'Node.js Microservices', role: 'محرك العمليات المحاسبية' },
      { name: 'React Data Tables', role: 'واجهات العرض والتقارير الفورية' },
      { name: 'PDF-Lib & Excel Export', role: 'تصدير التقارير والفواتير الرسمية' }
    ],
    pipeline: [
      { step: '01', title: 'هندسة العمليات', desc: 'رسم الدورة المستندية والمحاسبية الخاصة بشركتك' },
      { step: '02', title: 'بناء الهيكل وقواعد البيانات', desc: 'تصميم الجداول والتحقق من قواعد الأمان المالي' },
      { step: '03', title: 'التكامل وتدريب الفريق', desc: 'ربط الفروع وتدريب موظفيك على استخدام النظام' },
      { step: '04', title: 'الدعم والصيانة', desc: 'نسخ احتياطي يومي تلقائي وضمان دائم' }
    ],
    timelineEstimate: '14 إلى 28 يوم عمل',
    priceRange: '950 - 2,200 د.أ'
  },
  {
    id: 'uiux',
    icon: Layers,
    num: '05',
    title: 'تصميم واجهات وتجارب المستخدم (UI/UX)',
    enTitle: 'High-End UI/UX Design',
    desc: 'دراسة سلوك العملاء وتصميم واجهات عصرية فاخرة تركز على سهولة الاستخدام، جمالية التفاصيل، ومضاعفة معدلات التحويل والمبيعات.',
    tags: ['Figma UI/UX', 'Design Systems', 'Interactive Prototypes', 'Mobile-First'],
    accent: '#f43f5e',
    deepOverview: 'نصمم تجارب رقمية تأسر القلوب وتزيد المبيعات، مبنية على سيكولوجية المستخدم وتصميم الواجهات الفاخرة للعلامات التجارية المتميزة.',
    deliverables: [
      'ملف تصميم تفاعلي كامل على Figma قابل للنقر والتجربة',
      'نظام تصميم موحد (Design System) للألوان والأيقونات والخطوط',
      'تصاميم مخصصة لشاشات الهواتف والكمبيوتر والأجهزة اللوحية',
      'أصول ورسومات جرافيكية عالية الدقة جاهزة للبرمجة مباشرة'
    ],
    techStack: [
      { name: 'Figma Pro', role: 'أداة التصميم والنمذجة العالمية' },
      { name: 'Adobe Creative Suite', role: 'صناعة الأصول والهوية البصرية' },
      { name: 'Tailwind Design System', role: 'معايير الألوان والمسافات' }
    ],
    pipeline: [
      { step: '01', title: 'البحث والتحليل', desc: 'دراسة المنافسين وسلوك المستخدمين المستهدفين' },
      { step: '02', title: 'رسم الهيكل (Wireframes)', desc: 'تحديد توزيع العناصر وتدفق الشاشات' },
      { step: '03', title: 'التصميم البصري الفاخر', desc: 'إضافة الألوان والخطوط واللمسات الملكية' },
      { step: '04', title: 'التسليم للمطورين', desc: 'تسليم ملفات Figma المنظمة مع إرشادات البرمجة' }
    ],
    timelineEstimate: '4 إلى 8 أيام عمل',
    priceRange: '250 - 600 د.أ'
  },
  {
    id: 'cloud',
    icon: ShieldCheck,
    num: '06',
    title: 'الاستضافة السحابية وحماية البيانات',
    enTitle: 'Cloud Architecture & DevOps',
    desc: 'بنية تحتية سحابية موثوقة على Azure وAWS مع حماية سيبرانية شاملة من الهجمات، نسخ احتياطي لحظي، وضمان عمل 99.9%.',
    tags: ['Microsoft Azure', 'Amazon AWS', 'WAF & DDoS Shield', '24/7 Monitoring'],
    accent: '#6366f1',
    deepOverview: 'نضمن تشغيل موقعك ونظامك دون أي توقف وبأعلى معايير الأمان والحماية السحابية العالمية من خلال شراكاتنا مع Microsoft Azure وAWS.',
    deliverables: [
      'خوادم سحابية مخصصة ذات سعة عالية ومطابقة للمواصفات',
      'جدار حماية ضد هجمات حجب الخدمة (DDoS Shield & Cloudflare WAF)',
      'نسخ احتياطي يومي وأسبوعي مشفر لقواعد البيانات والملفات',
      'شهادات أمان SSL/TLS مشفرة بدرجة 256-bit',
      'لوحة مراقبة للأداء وسرعة الاستجابة على مدار الساعة 24/7'
    ],
    techStack: [
      { name: 'Microsoft Azure App Service', role: 'الاستضافة السحابية العالمية' },
      { name: 'Cloudflare Enterprise WAF', role: 'حماية السيرفرات وشبكة التوزيع CDN' },
      { name: 'Redis In-Memory Cache', role: 'تسريع الاستعلامات والصفحات' },
      { name: 'Docker & Kubernetes', role: 'الحاويات السحابية القابلة للتوسع' }
    ],
    pipeline: [
      { step: '01', title: 'تقييم الحجم والسعة', desc: 'تحديد حجم الزيارات المتوقع والموارد المطلوبة' },
      { step: '02', title: 'تهيئة الخوادم', desc: 'بناء البنية السحابية وتهيئة قواعد البيانات والـ CDN' },
      { step: '03', title: 'تطبيق طبقات الحماية', desc: 'تفعيل جدران الحماية والنسخ الاحتياطي التلقائي' },
      { step: '04', title: 'المراقبة المستمرة', desc: 'متابعة حية للأداء واستجابة فورية لأي طارئ' }
    ],
    timelineEstimate: 'يوم إلى 3 أيام عمل',
    priceRange: '150 - 450 د.أ / سنوياً'
  }
];

/* ─── PRICING PLANS ─────────────────────────────────── */
const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'باقة الانطلاق السريع',
    enName: 'Starter E-Commerce',
    badge: 'مثالية للمشاريع الناشئة',
    desc: 'الحل الأمثل لبدء بيع منتجاتك أونلاين بمتجر فاخر وسريع مع بوابات دفع آمنة.',
    monthlyPrice: 49,
    annualPrice: 39,
    setupFee: '490 د.أ لمرة واحدة',
    accent: '#3b82f6',
    features: [
      'متجر إلكتروني فاخر فائق السرعة (Next.js / React)',
      'تكامل بوابات الدفع (CliQ، فيزا، ماستركارد)',
      'لوحة تحكم ERP لإدارة المنتجات والمخزون والطلبات',
      'تتبع مباشر للطلبات مع إشعارات الرسائل',
      'دومين مجاني (.com أو .jo) لمدة سنة كاملة',
      'استضافة سحابية فائقة السرعة مع شهادة SSL مجانية',
      'دعم فني وضمان سلامة الكود لمدة 3 أشهر'
    ]
  },
  {
    id: 'growth',
    name: 'باقة الأعمال والنمو المتقدم',
    enName: 'Professional Growth & Mobile App',
    badge: 'الأكثر طلباً واختياراً ⭐',
    featured: true,
    desc: 'منظومة متكاملة لرفع المبيعات تشمل متجر ويب وتطبيق هاتف فلاتر مع أتمتة الواتساب.',
    monthlyPrice: 89,
    annualPrice: 69,
    setupFee: '890 د.أ لمرة واحدة',
    accent: '#b8943a',
    features: [
      'متجر ويب متطور + تطبيق هاتف فلاتر (iOS & Android)',
      'ربط جميع بوابات الدفع والتقسيط (تمارا، تابي، كليك، فيزا)',
      'أتمتة إشعارات ورسائل الواتساب اللحظية للعملاء',
      'نظام فواتير ضريبية إلكترونية متوافق مع الضريبة QR',
      'لوحة رادار المبيعات المباشرة ومراقبة حركة الزوار والسلات',
      'استضافة سحابية مدعومة على Microsoft Azure مع نسخ يومي',
      'ضمان شامل ودعم فني متواصل لمدة 12 شهراً'
    ]
  },
  {
    id: 'enterprise',
    name: 'باقة المؤسسات والأنظمة المخصصة',
    enName: 'Enterprise Custom Ecosystem',
    badge: 'للشركات الكبرى وسلاسل الفروع',
    desc: 'بنية تحتية برمجية مخصصة بالكامل مع حلول الذكاء الاصطناعي وإدارة الفروع المتعددة.',
    monthlyPrice: 165,
    annualPrice: 135,
    setupFee: '1,650 د.أ لمرة واحدة',
    accent: '#10b981',
    features: [
      'منظومة ERP متكاملة مخصصة لإدارة الفروع والمستودعات والمحاسبة',
      'تطبيقات هواتف ذكية متقدمة مع وضع العمل دون اتصال (Offline)',
      'شات بوت ذكاء اصطناعي وأتمتة مبيعات تنبؤية (GPT-4 / Gemini)',
      'تكامل مع أجهزة الكاشير ونقاط البيع POS وباركود الفروع',
      'بنية تحتية سحابية موزعة عالية التوفر (Multi-Region Cloud)',
      'تسليم كامل للكود المصدري وقواعد البيانات 100%',
      'مدير حساب ومهندس برمجيات خاص متاح 24/7'
    ]
  }
];

/* ─── ALL-INDUSTRIES COMPREHENSIVE PORTFOLIO (22+ SECTORS) ── */
const PORTFOLIO = [
  {
    id: 1,
    cat: 'ecommerce',
    title: 'منصة زهرة بيسان الفاخرة للأزياء والعبايات',
    industry: '👗 أزياء وعبايات راقية',
    desc: 'متجر إلكتروني فائق السرعة مع لوحة تحكم ERP شاملة، بوابات دفع متعددة، مشغل فيديو عالي الدقة، وتتبع حي للطلبات.',
    image: '/portfolio/fashion.jpg',
    tags: ['React', 'Node.js', 'MySQL 8.0', 'Azure Cloud', 'AI Stylist'],
    badge: 'E-Commerce Platform',
    storefront: {
      heroTitle: 'فخامة الأزياء الشرقية والتصاميم الملكية',
      heroSubtitle: 'تشكيلات حصرية من العبايات والفساتين الفاخرة مع شحن دولي ودفع آمن',
      sampleProducts: [
        { name: 'عباية سلتانة الملكية', cat: 'المجموعة الملكية', price: '120.00 د.أ', badge: 'الأكثر طلباً', icon: '👑' },
        { name: 'عباية مخمل شتوية مطرزة', cat: 'تشكيلة الشتاء', price: '95.00 د.أ', badge: 'جديد', icon: '✨' },
        { name: 'عباية حرير طبيعي ناعمة', cat: 'مناسبات خاصة', price: '85.00 د.أ', badge: 'فاخر', icon: '💎' },
        { name: 'طقم طرح وإكسسوارات ذهبية', cat: 'إكسسوارات', price: '35.00 د.أ', badge: 'عرض خاص', icon: '🧣' },
      ],
      features: ['تحديد المقاس الذكي بالفيديو', 'دفع فوري عبر كليك والبطاقات', 'توصيل خلال 24 ساعة', 'تتبع الطلب بالواتساب']
    },
    dashboard: {
      kpis: [
        { label: 'مبيعات اليوم', val: '1,840 د.أ', trend: '+18.5%' },
        { label: 'الطلبات النشطة', val: '42 طلب', trend: '12 قيد التجهيز' },
        { label: 'العملاء الجدد', val: '+29 عميل', trend: 'معدل عالي' },
        { label: 'معدل التحويل', val: '4.9%', trend: '+0.8%' }
      ],
      ordersTable: [
        { id: '#ZB-9021', customer: 'نورة الهاشمي', item: 'عباية سلتانة (مقاس 56)', amount: '120 د.أ', status: 'في التوصيل', statusClass: 'statusProcess', time: 'منذ 15 دقيقة' },
        { id: '#ZB-9020', customer: 'سارة المجالي', item: 'عباية مخمل + طرحة', amount: '130 د.أ', status: 'مكتمل ومدفوع', statusClass: 'statusDone', time: 'منذ 40 دقيقة' },
        { id: '#ZB-9019', customer: 'ريم الخالدي', item: 'عباية حرير (مقاس 54)', amount: '85 د.أ', status: 'مدفوع عبر كليك', statusClass: 'statusPaid', time: 'منذ ساعتين' }
      ],
      erpModules: ['إدارة المخزون متعدد المقاسات والألوان', 'الفواتير الضريبية الإلكترونية QR', 'تتبع مناديب الشحن', 'تحليلات المبيعات التنبؤية']
    },
    database: {
      engine: 'MySQL 8.0 Enterprise Cluster + Redis 7.0 Cache',
      tables: [
        { name: 'products', fields: ['id (PK)', 'sku_code', 'title_ar', 'price_jod', 'category_id', 'stock_qty', 'video_url'] },
        { name: 'orders', fields: ['order_id (PK)', 'user_id (FK)', 'total_amount', 'payment_status', 'shipping_address', 'created_at'] },
        { name: 'order_items', fields: ['item_id (PK)', 'order_id (FK)', 'product_id (FK)', 'size_variant', 'unit_price', 'qty'] },
        { name: 'invoices_vat', fields: ['invoice_no (PK)', 'order_id (FK)', 'tax_amount', 'qr_hash', 'pdf_s3_url'] }
      ],
      cloudSetup: 'Azure App Service P1v3, Azure Database for MySQL Flexible Server, Redis Cache, Multi-AZ Replication, Cloudflare Enterprise CDN.'
    }
  },
  {
    id: 2,
    cat: 'ecommerce',
    title: 'منظومة السوبرماركت والتوصيل السريع للمنازل',
    industry: '🛒 بقالة وسوبرماركت',
    desc: 'منظومة طلب بقالة أونلاين مع تتبع جغرافي حي لمركبات التوصيل، إدارة ذكية لتعدد الفروع والمخزون، وتطبيق جوال فائق السلاسة.',
    image: '/portfolio/grocery.jpg',
    tags: ['Next.js', 'Flutter', 'MongoDB', 'Redis', 'Real-time GPS'],
    badge: 'Quick Commerce & Grocery',
    storefront: {
      heroTitle: 'تسوق مقاضي بيتك وتصلك خلال 30 دقيقة طازجة',
      heroSubtitle: 'خضار، فواكه، لحوم، ألبان ومستلزمات منزلية بأسعار الجملة وتوصيل فوري',
      sampleProducts: [
        { name: 'صندوق خضار مشكل طازج (5 كغم)', cat: 'خضار وفواكه', price: '4.50 د.أ', badge: 'طازج يومياً', icon: '🥦' },
        { name: 'زيت زيتون بلدي بكر (1 لتر)', cat: 'المؤونة المنزلية', price: '7.50 د.أ', badge: 'عضوي', icon: '🫒' },
        { name: 'حليب كامل الدسم طازج (4 عبوات)', cat: 'الألبان والأجبان', price: '3.20 د.أ', badge: 'عرض توفير', icon: '🥛' },
        { name: 'أرز بسمتي درجة أولى (10 كغم)', cat: 'البقوليات', price: '11.00 د.أ', badge: 'الأكثر مبيعاً', icon: '🍚' },
      ],
      features: ['تحديد موعد التوصيل الدقيق', 'تتبع المندوب على الخريطة الحية', 'الدفع عند الاستلام أو كليك', 'إعادة الطلب بنقرة واحدة']
    },
    dashboard: {
      kpis: [
        { label: 'طلبات اليوم', val: '248 طلب', trend: '+34%' },
        { label: 'متوسط زمن التوصيل', val: '24 دقيقة', trend: 'ممتاز' },
        { label: 'إجمالي المبيعات', val: '3,420 د.أ', trend: '+22%' },
        { label: 'المناديب النشطون', val: '18 كابتن', trend: 'في الخدمة' }
      ],
      ordersTable: [
        { id: '#GRO-148', customer: 'أحمد التميمي', item: 'سلة مقاضي أسبوعية (12 صنف)', amount: '38.50 د.أ', status: 'جاري التوصيل', statusClass: 'statusProcess', time: 'منذ 8 دقائق' },
        { id: '#GRO-147', customer: 'منى حداد', item: 'خضار ولحوم طازجة', amount: '26.00 د.أ', status: 'تم التسليم', statusClass: 'statusDone', time: 'منذ 25 دقيقة' },
        { id: '#GRO-146', customer: 'عمر القاسم', item: 'مشروبات ومخبوزات', amount: '15.20 د.أ', status: 'مكتمل', statusClass: 'statusDone', time: 'منذ ساعة' }
      ],
      erpModules: ['ربط أجهزة الباركود الكاشير POS', 'إدارة المخزون حسب الفروع والمستودعات', 'نظام توزيع الطلبات الآلي للمناديب', 'تنبيهات اقتراب تاريخ انتهاء الصلاحية']
    },
    database: {
      engine: 'MongoDB Atlas Sharded Cluster + Redis Geo-Spatial',
      tables: [
        { name: 'catalog_items', fields: ['_id', 'barcode', 'name_ar', 'weight_unit', 'price', 'branch_stocks[]', 'expiry_date'] },
        { name: 'orders', fields: ['_id', 'customer_id', 'delivery_address_geo', 'items[]', 'subtotal', 'assigned_rider_id', 'status'] },
        { name: 'riders_telemetry', fields: ['_id', 'rider_id', 'current_lat', 'current_lng', 'is_available', 'active_order_id'] },
        { name: 'branches_inventory', fields: ['_id', 'branch_name', 'zone_polygon', 'low_stock_alerts[]'] }
      ],
      cloudSetup: 'AWS EC2 Cluster, MongoDB Atlas Dedicated, Redis Elasticache for Live GPS Tracking, Route53 Geolocation Routing.'
    }
  },
  {
    id: 3,
    cat: 'food',
    title: 'نظام المطاعم، الكافيهات، والمنيو الرقمي الذكي (KDS & POS)',
    industry: '🍕 مطاعم وكافيهات فاخرة',
    desc: 'منصة طلب طعام أونلاين مع QR Code Menu ذكي، نظام إدارة شاشات المطبخ KDS، تتبع التوصيل، ونقاط ولاء العملاء.',
    image: '/portfolio/restaurant.jpg',
    tags: ['React', 'Node.js', 'Socket.io', 'PostgreSQL', 'Kitchen KDS'],
    badge: 'Restaurant & POS System',
    storefront: {
      heroTitle: 'قائمة طعام تفاعلية مع تجربة طلب استثنائية',
      heroSubtitle: 'اطلب من طاولتك مباشرة عبر QR Code أو اطلب للتوصيل مع تخصيص المكونات والإضافات',
      sampleProducts: [
        { name: 'ستيك تندرلوين مشوي مع صوص الفطر', cat: 'الأطباق الرئيسية', price: '16.50 د.أ', badge: 'توصية الشيف', icon: '🥩' },
        { name: 'بيتزا تروفل إيطالية بالحطب', cat: 'البيتزا والمعجنات', price: '9.00 د.أ', badge: 'الأكثر طلباً', icon: '🍕' },
        { name: 'سلطة بوراتا إيطالية طازجة', cat: 'المقبلات والسلطات', price: '6.50 د.أ', badge: 'صحي', icon: '🥗' },
        { name: 'كيكة الشوكولاتة الذائبة مع آيس كريم', cat: 'الحلويات', price: '4.50 د.أ', badge: 'حلوى اليوم', icon: '🍰' },
      ],
      features: ['مسح QR للطاولات بدون تطبيق', 'تخصيص الإضافات والملاحظات للشيف', 'دفع إلكتروني فوري أو نقدي', 'تتبع حالة التحضير دقيقة بدقيقة']
    },
    dashboard: {
      kpis: [
        { label: 'مبيعات اليوم', val: '2,150 د.أ', trend: '+28%' },
        { label: 'طلبات المطبخ النشطة', val: '14 طلب', trend: 'تحت التحضير' },
        { label: 'إشغال الطاولات', val: '88%', trend: 'ذروة المساء' },
        { label: 'متوسط زمن التحضير', val: '12 دقيقة', trend: 'سريع ومثالي' }
      ],
      ordersTable: [
        { id: '#ORD-882', customer: 'طاولة رقم 7 (داخل الصالة)', item: '2 ستيك + 1 بوراتا', amount: '39.50 د.أ', status: 'في المطبخ KDS', statusClass: 'statusProcess', time: 'منذ 4 دقائق' },
        { id: '#ORD-881', customer: 'توصيل: رامي نصار', item: '3 بيتزا تروفل عائلية', amount: '27.00 د.أ', status: 'جاهز للاستلام', statusClass: 'statusPaid', time: 'منذ 18 دقيقة' },
        { id: '#ORD-880', customer: 'طاولة رقم 2 (الترس الخارجي)', item: 'قهوة وحلويات', amount: '12.00 د.أ', status: 'مكتمل وتم الدفع', statusClass: 'statusDone', time: 'منذ 35 دقيقة' }
      ],
      erpModules: ['شاشات المطبخ KDS لتقسيم محطات الطبخ', 'حساب تكاليف الوصفات والهدر (Food Costing)', 'إدارة الوردات والشفتات الكاشير', 'ربط طابعات الفواتير الحرارية ESC/POS']
    },
    database: {
      engine: 'PostgreSQL 16 High-Availability + Socket.io Server',
      tables: [
        { name: 'menu_items', fields: ['id (PK)', 'title_ar', 'price', 'category_id', 'calories', 'is_available', 'recipe_bom_id'] },
        { name: 'table_sessions', fields: ['session_id (PK)', 'table_number', 'opened_at', 'waiter_id', 'total_amount', 'status'] },
        { name: 'kds_tickets', fields: ['ticket_id (PK)', 'order_id (FK)', 'station_name', 'items_list[]', 'prep_started_at', 'status'] },
        { name: 'inventory_ingredients', fields: ['ing_id (PK)', 'name', 'unit_cost', 'current_stock_kg', 'reorder_level'] }
      ],
      cloudSetup: 'Azure Virtual Machines, Managed PostgreSQL Flexible Server, Real-time WebSockets Gateway, Automated Daily DB Snapshots.'
    }
  },
  {
    id: 4,
    cat: 'health',
    title: 'منظومة المستشفيات، العيادات، والمراكز الطبية الذكية',
    industry: '🏥 مستشفيات وعيادات وأطباء',
    desc: 'نظام حجز مواعيد أونلاين، سجلات طبية إلكترونية للمرضى، تذكيرات واتساب تلقائية، ودفع إلكتروني آمن وفق معايير HIPAA.',
    image: '/portfolio/clinic.jpg',
    tags: ['React', 'PostgreSQL', 'WhatsApp Cloud API', 'HIPAA Secure', 'EHR'],
    badge: 'Smart Healthcare & Clinics',
    storefront: {
      heroTitle: 'رعاية صحية متطورة وحجز مواعيد فوري مع نخبة الأطباء',
      heroSubtitle: 'اختر التخصص، الطبيب المعالج، والوقت المناسب لك مع استشارات عن بعد وسجلات طبية رقمية',
      sampleProducts: [
        { name: 'استشارة طبية تخصصية (عيادة الباطنية)', cat: 'كشفية العيادة', price: '25.00 د.أ', badge: 'متاح اليوم', icon: '🩺' },
        { name: 'فحص دوري شامل ومختبر متكامل', cat: 'الباقات الوقائية', price: '60.00 د.أ', badge: 'باقة مميزة', icon: '🔬' },
        { name: 'جلسة تنظيف وتبييض أسنان ليزر', cat: 'عيادة الأسنان', price: '45.00 د.أ', badge: 'عرض خاص', icon: '🦷' },
        { name: 'استشارة طبية مرئية عن بعد (Telehealth)', cat: 'الطب الاتصالي', price: '20.00 د.أ', badge: 'فيديو مباشر', icon: '💻' },
      ],
      features: ['حجز الموعد وتأكيده برسالة واتساب', 'إلغاء أو إعادة جدولة بضغطة زر', 'تحميل نتائج الفحوصات والتقارير PDF', 'ربط مباشر مع شركات التأمين الصحي']
    },
    dashboard: {
      kpis: [
        { label: 'مواعيد اليوم', val: '64 مريض', trend: 'كامل العيادات' },
        { label: 'نسبة الحضور والتأكيد', val: '96%', trend: '+4% عبر تذكيرات الواتساب' },
        { label: 'إيرادات اليوم', val: '1,920 د.أ', trend: 'نقدي + تأمين' },
        { label: 'الأطباء المناوبون', val: '8 استشاريين', trend: 'في العيادات' }
      ],
      ordersTable: [
        { id: '#MED-409', customer: 'خالد عبد الرحيم', item: 'كشفية أسنان + أشعة بانوراما', amount: '50 د.أ', status: 'في غرفة الكشف', statusClass: 'statusProcess', time: '10:30 صباحاً' },
        { id: '#MED-408', customer: 'فاطمة العبداللات', item: 'فحوصات دم ومختبر شامل', amount: '60 د.أ', status: 'تمت المعاينة والتقرير جاهز', statusClass: 'statusDone', time: '10:00 صباحاً' },
        { id: '#MED-407', customer: 'يوسف الهنداوي', item: 'استشارة باطنية (تأمين نات هيلث)', amount: '25 د.أ', status: 'معتمد من التأمين', statusClass: 'statusPaid', time: '09:30 صباحاً' }
      ],
      erpModules: ['الملف الطبي الإلكتروني للمريض (EMR/EHR)', 'كتابة الوصفات الطبية الإلكترونية المعتمدة', 'إدارة مطالبات التأمين والخصم المباشر', 'جدول مواعيد الأطباء وغرف العمليات']
    },
    database: {
      engine: 'PostgreSQL 16 Enterprise (HIPAA Compliant) + TDE Encryption',
      tables: [
        { name: 'patients', fields: ['patient_id (PK)', 'national_id', 'full_name', 'dob', 'blood_type', 'insurance_id', 'phone'] },
        { name: 'appointments', fields: ['app_id (PK)', 'doctor_id (FK)', 'patient_id (FK)', 'slot_datetime', 'status', 'notes'] },
        { name: 'medical_records', fields: ['record_id (PK)', 'patient_id (FK)', 'diagnosis_icd10', 'prescription_data', 'doctor_signature'] },
        { name: 'insurance_claims', fields: ['claim_id (PK)', 'company_name', 'claim_amount', 'approval_code', 'submitted_at'] }
      ],
      cloudSetup: 'Azure Dedicated Medical Cloud, HIPAA & GDPR Compliant, 256-bit Encryption at Rest & in Transit, Hourly Immutable Backups.'
    }
  },
  {
    id: 5,
    cat: 'health',
    title: 'منظومة الصيدليات وتطبيقات توصيل الأدوية المعتمدة',
    industry: '💊 صيدليات ومستلزمات طبية',
    desc: 'تطبيق طلب أدوية مع رفع الوصفة الطبية إلكترونياً، تحقق الصيدلي المعتمد، استشارات طبية فورية، وتوصيل سريع مع تتبع.',
    image: '/portfolio/pharmacy.jpg',
    tags: ['React Native', 'Node.js', 'Prescription OCR', 'PostgreSQL', 'Express Delivery'],
    badge: 'Pharmacy & Medical Delivery',
    storefront: {
      heroTitle: 'صيدليتك أونلاين: ارفع وصفتك وتصلك أدويتك لباب بيتك',
      heroSubtitle: 'أدوية معتمدة، فيتامينات، مستلزمات العناية الشخصية والأجهزة الطبية مع استشارة صيدلاني مرخص',
      sampleProducts: [
        { name: 'جهاز قياس ضغط الدم الرقمي الدقيق', cat: 'أجهزة طبية', price: '28.00 د.أ', badge: 'ضمان سنتين', icon: '🩺' },
        { name: 'فيتامين C + زنك مكمل غذائي (60 كبسولة)', cat: 'فيتامينات ومكملات', price: '8.50 د.أ', badge: 'أصلي 100%', icon: '💊' },
        { name: 'كريم مرطب علاجي للبشرة الحساسة', cat: 'العناية بالبشرة', price: '14.00 د.أ', badge: 'طبي معتمد', icon: '🧴' },
        { name: 'مجموعة العناية بصحة الطفل والرضيع', cat: 'الأم والطفل', price: '19.50 د.أ', badge: 'باقة توفير', icon: '👶' },
      ],
      features: ['تصوير الوصفة الطبية بالهاتف (OCR)', 'تذكير بمواعيد تجديد الدواء الدوري', 'استشارة فورية مع صيدلاني عبر الشات', 'توصيل فوري خلال 40 دقيقة']
    },
    dashboard: {
      kpis: [
        { label: 'طلبات اليوم', val: '112 طلب', trend: '+19%' },
        { label: 'الوصفات المعتمدة', val: '46 وصفة', trend: 'تدقيق صيدلاني' },
        { label: 'مبيعات الأدوية', val: '1,750 د.أ', trend: '+15%' },
        { label: 'أصناف قاربت على النفاد', val: '7 أصناف', trend: 'تنبيه آلي للمورد' }
      ],
      ordersTable: [
        { id: '#PH-612', customer: 'زياد المصري', item: 'وصفة أدوية ضغط وسكري + جهاز فحص', amount: '42.00 د.أ', status: 'معتمد وفي التوصيل', statusClass: 'statusProcess', time: 'منذ 10 دقائق' },
        { id: '#PH-611', customer: 'لبنى الشريف', item: 'فيتامينات وعناية بالبشرة', amount: '22.50 د.أ', status: 'تم التسليم', statusClass: 'statusDone', time: 'منذ نصف ساعة' },
        { id: '#PH-610', customer: 'طارق الزعبي', item: 'مستلزمات إسعافات أولية', amount: '18.00 د.أ', status: 'مكتمل', statusClass: 'statusDone', time: 'منذ ساعتين' }
      ],
      erpModules: ['إدارة تواريخ صلاحية الأدوية والدفعات (Batch & Expiry)', 'سجل الأدوية المراقبة والنفسية', 'ربط نقاط البيع POS مع المستودعات', 'أوامر الشراء التلقائية من مستودعات الأدوية']
    },
    database: {
      engine: 'PostgreSQL 16 + Redis Cache for Fast Search',
      tables: [
        { name: 'medications_catalog', fields: ['drug_id (PK)', 'trade_name', 'scientific_name', 'dosage_form', 'requires_rx', 'price'] },
        { name: 'prescriptions_uploaded', fields: ['rx_id (PK)', 'user_id', 'image_url', 'ocr_extracted_text', 'pharmacist_approval_status'] },
        { name: 'batches_inventory', fields: ['batch_id (PK)', 'drug_id (FK)', 'lot_number', 'expiry_date', 'qty_in_stock'] }
      ],
      cloudSetup: 'AWS Elastic Beanstalk, Amazon RDS Multi-AZ, S3 Secure Document Storage with Server-Side Encryption.'
    }
  },
  {
    id: 6,
    cat: 'realestate',
    title: 'بوابة العقارات، التطوير العقاري، والمقاولات الفاخرة',
    industry: '🏡 عقارات وفلل وهندسة',
    desc: 'منصة عقارية متكاملة مع خرائط تفاعلية، جولات افتراضية 360°، نظام فلترة وبحث متقدم، وبوابة حجز وتواصل مع الوكلاء.',
    image: '/portfolio/realestate.jpg',
    tags: ['Next.js', 'Mapbox 3D', 'PostgreSQL', 'AWS S3', 'Virtual Tour'],
    badge: 'Real Estate & Property Portal',
    storefront: {
      heroTitle: 'اكتشف أرقى الفلل والشقق والعقارات الاستثمارية',
      heroSubtitle: 'جولات افتراضية ثلاثية الأبعاد 360°، مواقع دقيقة على الخرائط، وخطط أقساط ميسرة من المطور مباشرة',
      sampleProducts: [
        { name: 'فيلا مودرن مستقلة مع مسبح خاص (دابوق)', cat: 'فلل فاخرة', price: '450,000 د.أ', badge: 'جاهز للسكن', icon: '🏰' },
        { name: 'شقة دوبلكس إطلالة بانورامية (عبدون)', cat: 'شقق ديلوكس', price: '185,000 د.أ', badge: 'تشطيب سوبر', icon: '🏙️' },
        { name: 'مكتب تجاري ذكي في برج أعمال (الشميساني)', cat: 'عقارات تجارية', price: '95,000 د.أ', badge: 'عائد استثماري 9%', icon: '🏢' },
        { name: 'قطعة أرض استثمارية مميزة (طريق المطار)', cat: 'أراضي وسكن', price: '130,000 د.أ', badge: 'إفراز رسمي', icon: '📐' },
      ],
      features: ['جولة افتراضية 360° داخل العقار', 'حاسبة القروض والأقساط البنكية التفاعلية', 'حجز موعد معاينة ميدانية فوري', 'خريطة تفاعلية للخدمات والمدارس المحيطة']
    },
    dashboard: {
      kpis: [
        { label: 'طلبات المعاينة', val: '38 طلب', trend: 'هذا الأسبوع' },
        { label: 'العقارات المعروضة', val: '142 عقار', trend: 'محدثة حياً' },
        { label: 'عقود البيع والإيجار', val: '9 عقود', trend: 'قيد التوثيق' },
        { label: 'الوسطاء النشطون', val: '12 وسيط', trend: 'مرخص' }
      ],
      ordersTable: [
        { id: '#REQ-301', customer: 'المهندس رائد النابلسي', item: 'معاينة فيلا دابوق المودرن', amount: '450,000 د.أ', status: 'موعد مؤكد الجمعة', statusClass: 'statusProcess', time: 'منذ 20 دقيقة' },
        { id: '#REQ-300', customer: 'د. سوزان حداد', item: 'حجز مبدئي: شقة عبدون', amount: '185,000 د.أ', status: 'دفعة عربون مستلمة', statusClass: 'statusDone', time: 'منذ ساعتين' },
        { id: '#REQ-299', customer: 'مجموعة المشرق الاستثمارية', item: 'استفسار مكتب تجاري', amount: '95,000 د.أ', status: 'تم التواصل وتقديم العرض', statusClass: 'statusPaid', time: 'أمس' }
      ],
      erpModules: ['إدارة علاقات العملاء العقارية (Real Estate CRM)', 'توليد عقود الإيجار والبيع الرسمية آلياً', 'مصفوفة تتبع الدفعات والأقساط الشهرية', 'نظام عمولات الوسطاء وإدارات الأملاك']
    },
    database: {
      engine: 'PostgreSQL 16 + PostGIS Spatial Engine + S3',
      tables: [
        { name: 'properties', fields: ['property_id (PK)', 'title_ar', 'price_jod', 'area_sqm', 'location_geom (GIS)', 'vr_tour_url', 'status'] },
        { name: 'leads_crm', fields: ['lead_id (PK)', 'name', 'phone', 'budget_range', 'preferred_zone', 'assigned_agent_id'] },
        { name: 'property_contracts', fields: ['contract_id (PK)', 'property_id (FK)', 'buyer_id', 'installment_plan', 'signed_pdf_url'] }
      ],
      cloudSetup: 'AWS Elastic Container Service (ECS), RDS PostgreSQL with PostGIS, CloudFront CDN for Fast 360 VR Video Streaming.'
    }
  },
  {
    id: 7,
    cat: 'realestate',
    title: 'المكاتب الهندسية، التصميم الداخلي، والديكور الراقي',
    industry: '🎨 مكاتب هندسية وتصميم داخلي',
    desc: 'منصة استعراض مشاريع الديكور والمخططات الهندسية، حساب تكلفة التشطيب التفاعلي، وإدارة مراحل التنفيذ خطوة بخطوة.',
    image: '/portfolio/corporate.jpg',
    tags: ['Next.js', 'WebGL 3D', 'Node.js', 'Figma API', 'Cost Estimator'],
    badge: 'Interior Design & Architecture',
    storefront: {
      heroTitle: 'نحول مساحتك إلى تحفة معمارية عصرية تنبض بالفخامة',
      heroSubtitle: 'تصاميم داخلية مخصصة، مخططات تنفيذية معتمدة، وإشراف هندسي متكامل من الفكرة حتى التسليم',
      sampleProducts: [
        { name: 'باقة التصميم الداخلي الكامل للفلل (3D)', cat: 'تصميم داخلي', price: '1,500 د.أ', badge: 'شامل المخططات', icon: '🏛️' },
        { name: 'تصميم وتنفيذ ديكورات الصالون والمعيشة', cat: 'ديكورات ومودرن', price: '850.00 د.أ', badge: 'عصري فاخر', icon: '🛋️' },
        { name: 'مخطط كهروميكانيك وإضاءة ذكية Smart Home', cat: 'أنظمة هندسية', price: '600.00 د.أ', badge: 'معتمد', icon: '💡' },
        { name: 'استشارة هندسية ميدانية مع مهندس الديكور', cat: 'استشارات', price: '50.00 د.أ', badge: 'زيارة موقع', icon: '📐' },
      ],
      features: ['معرض أعمال ثلاثي الأبعاد تفاعلي', 'حاسبة ميزانية التشطيب الفورية', 'متابعة مراحل المشروع الميدانية بالصور', 'اعتماد التصاميم وتعديلها أونلاين']
    },
    dashboard: {
      kpis: [
        { label: 'المشاريع الجارية', val: '18 مشروع', trend: 'قيد التنفيذ' },
        { label: 'معدل رضا العملاء', val: '99.4%', trend: 'تقييم ممتاز' },
        { label: 'عروض الأسعار المرسلة', val: '32 عرض', trend: '+40% هذا الشهر' },
        { label: 'المهندسون المشرفون', val: '7 مهندسين', trend: 'في الميدان' }
      ],
      ordersTable: [
        { id: '#ENG-112', customer: 'السيد غسان التل', item: 'مشروع فيلا دابوق (مرحلة التشطيب)', amount: '14,500 د.أ', status: 'مرحلة 3: تركيب الأرضيات', statusClass: 'statusProcess', time: 'اليوم' },
        { id: '#ENG-111', customer: 'كافيه لافندر (عبدون)', item: 'تصميم وتنفيذ هوية الديكور', amount: '8,200 د.أ', status: 'تسليم نهائي معتمد', statusClass: 'statusDone', time: 'أمس' }
      ],
      erpModules: ['مخططات غانت Gantt Chart لإدارة زمن المشاريع', 'جدول الكميات والمواصفات (BOQ) وحساب التكاليف', 'إدارة المقاولين من الباطن وموردي المواد', 'الفواتير حسب نسب الإنجاز Milestone Invoicing']
    },
    database: {
      engine: 'PostgreSQL 16 + AWS S3 Media Bucket',
      tables: [
        { name: 'projects', fields: ['project_id (PK)', 'client_name', 'sqm_area', 'total_budget', 'start_date', 'current_phase'] },
        { name: 'project_milestones', fields: ['milestone_id (PK)', 'project_id (FK)', 'title', 'completion_pct', 'photos_gallery[]', 'is_approved'] },
        { name: 'boq_items', fields: ['boq_id (PK)', 'project_id (FK)', 'item_desc', 'quantity', 'unit_rate', 'total_cost'] }
      ],
      cloudSetup: 'Azure Container Apps, Azure Blob Storage for 4K Renders, Serverless API functions.'
    }
  },
  {
    id: 8,
    cat: 'education',
    title: 'منصة التعليم، الجامعات، والأكاديميات الإلكترونية (LMS)',
    industry: '📚 جامعات وأكاديميات تعليمية',
    desc: 'نظام إدارة تعلم ذكي LMS مع بث مباشر للمحاضرات، اختبارات تفاعلية، تصحيح آلي، إصدار شهادات رقمية، وبنوك أسئلة.',
    image: '/portfolio/education.jpg',
    tags: ['React', 'Node.js', 'Live WebRTC', 'PostgreSQL', 'Auto Grading'],
    badge: 'EdTech & Smart LMS',
    storefront: {
      heroTitle: 'تعلم بذكاء مع منصة تعليمية تفاعلية بمعايير عالمية',
      heroSubtitle: 'دورات احترافية، محاضرات مباشرة، اختبارات ذكية، وشهادات معتمدة توثق مهاراتك',
      sampleProducts: [
        { name: 'دبلوم البرمجة وتطوير الويب الشامل (Full-Stack)', cat: 'البرمجة والتكنولوجيا', price: '150.00 د.أ', badge: 'شهادة معتمدة', icon: '💻' },
        { name: 'كورس الذكاء الاصطناعي وهندسة الأوامر (Prompt Engineering)', cat: 'الذكاء الاصطناعي', price: '75.00 د.أ', badge: 'الأكثر تسجيلاً', icon: '🤖' },
        { name: 'دورة التسويق الرقمي وإدارة الحملات الإعلانية', cat: 'إدارة الأعمال', price: '60.00 د.أ', badge: 'تطبيقي وعملي', icon: '📈' },
        { name: 'تدريب احترافي لتصميم واجهات المستخدم (UI/UX Figma)', cat: 'التصميم الرقمي', price: '80.00 د.أ', badge: 'مشاريع حقيقية', icon: '🎨' },
      ],
      features: ['مشغل فيديو فائق السرعة ومحمي من التسجيل', 'اختبارات قصيرة تصحح آلياً مع تقرير أداء', 'غرف بث مباشر تفاعلية مع المدرب', 'إصدار شهادة إلكترونية برمز QR معتمد']
    },
    dashboard: {
      kpis: [
        { label: 'الطلاب النشطون', val: '2,840 طالب', trend: '+450 هذا الشهر' },
        { label: 'الدورات المكتملة', val: '1,120 شهادة', trend: 'صادرة' },
        { label: 'إجمالي المبيعات', val: '9,600 د.أ', trend: '+35%' },
        { label: 'ساعات المشاهدة', val: '14,200 ساعة', trend: 'تفاعل ممتاز' }
      ],
      ordersTable: [
        { id: '#ENR-992', customer: 'أنس بني هاني', item: 'تسجيل: دبلوم البرمجة الكامل', amount: '150.00 د.أ', status: 'تم الدفع وتفعيل الكورس', statusClass: 'statusDone', time: 'منذ 5 دقائق' },
        { id: '#ENR-991', customer: 'دعاء الخطيب', item: 'تسجيل: كورس الذكاء الاصطناعي', amount: '75.00 د.أ', status: 'مدفوع عبر كليك', statusClass: 'statusPaid', time: 'منذ 40 دقيقة' }
      ],
      erpModules: ['لوحة تحكم المدربين وحساب الأرباح والنسب', 'بنك الأسئلة والتصحيح الآلي للواجبات', 'إدارة صلاحيات الوصول وبوابات الدفع بالتقسيط', 'تحليلات تقدم الطلاب التنبؤية بالـ AI']
    },
    database: {
      engine: 'PostgreSQL 16 + Redis + Cloudflare Stream Video CDN',
      tables: [
        { name: 'courses', fields: ['course_id (PK)', 'title_ar', 'instructor_id', 'price', 'duration_hours', 'certificate_template_id'] },
        { name: 'lessons', fields: ['lesson_id (PK)', 'course_id (FK)', 'video_stream_uid', 'order_index', 'attachments_json'] },
        { name: 'enrollments', fields: ['enrollment_id (PK)', 'user_id', 'course_id', 'progress_percentage', 'completed_at'] },
        { name: 'certificates', fields: ['cert_id (PK)', 'qr_verify_hash', 'student_name', 'issue_date', 'pdf_url'] }
      ],
      cloudSetup: 'AWS Elastic Beanstalk + Cloudflare Stream for HLS Encrypted Video Delivery + PostgreSQL RDS.'
    }
  },
  {
    id: 9,
    cat: 'services',
    title: 'مكاتب المحاماة، الاستشارات القانونية، والشرعية',
    industry: '⚖️ مكاتب محاماة وقانون',
    desc: 'منظومة سرية مشفرة لإدارة القضايا، مواعيد الجلسات بالمحاكم، حجز الاستشارات القانونية، وأرشفة المستندات السرية.',
    image: '/portfolio/corporate.jpg',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Court Calendar', '256-Bit Encrypted'],
    badge: 'Legal Practice Management',
    storefront: {
      heroTitle: 'حماية قانونية احترافية وخبرة عريقة في الترافع والاستشارات',
      heroSubtitle: 'استشارات قانونية للشركات والأفراد، صياغة العقود، وإدارة القضايا بأعلى معايير السرية',
      sampleProducts: [
        { name: 'استشارة قانونية تخصصية (شركات وعقود تجارية)', cat: 'استشارات قانونية', price: '60.00 د.أ', badge: 'جلسة ساعة', icon: '⚖️' },
        { name: 'صياغة وتدقيق العقود والاتفاقيات التجارية', cat: 'صياغة عقود', price: '120.00 د.أ', badge: 'خلال 48 ساعة', icon: '📜' },
        { name: 'خدمات تأسيس وتسجيل الشركات والعلامات التجارية', cat: 'تأسيس شركات', price: '250.00 د.أ', badge: 'شامل الإجراءات', icon: '🏢' },
        { name: 'تمثيل قانوني وتوكيل قضايا عمالية ومدنية', cat: 'ترافع ومحاكم', price: '350.00 د.أ', badge: 'دراسة ملف', icon: '🏛️' },
      ],
      features: ['حجز استشارة سرية مع المستشار القانوني', 'رفع المستندات وتشفيرها بالكامل 256-bit', 'تتبع حالة القضية إلكترونياً للموكل', 'الدفع الآمن للأتعاب والأقساط']
    },
    dashboard: {
      kpis: [
        { label: 'القضايا النشطة', val: '46 قضية', trend: 'بالمحاكم' },
        { label: 'جلسات هذا الأسبوع', val: '14 جلسة', trend: 'مجدولة' },
        { label: 'الاستشارات المحجوزة', val: '22 استشارة', trend: '+18%' },
        { label: 'نسبة النجاح والتسويات', val: '94%', trend: 'سجل ممتاز' }
      ],
      ordersTable: [
        { id: '#LAW-182', customer: 'مجموعة الأفق التجارية', item: 'صياغة عقد شراكة وتوزيع دولي', amount: '350.00 د.أ', status: 'قيد التدقيق القانوني', statusClass: 'statusProcess', time: 'اليوم 09:00' },
        { id: '#LAW-181', customer: 'السيد مروان الكردي', item: 'استشارة قضايا ملكية فكرية', amount: '60.00 د.أ', status: 'تمت الجلسة وإصدار الرأي', statusClass: 'statusDone', time: 'أمس' }
      ],
      erpModules: ['أجندة مواعيد جلسات المحاكم مع تنبيهات SMS', 'إدارة ملفات القضايا وأرشفة مذكرات الدفاع', 'سجل الساعات المستحقة الفواتير (Billable Hours)', 'خزنة المستندات السرية عالية التشفير']
    },
    database: {
      engine: 'PostgreSQL 16 with Row-Level Security & AES-256 Encryption',
      tables: [
        { name: 'legal_cases', fields: ['case_id (PK)', 'court_case_number', 'client_id', 'case_type', 'presiding_judge', 'status'] },
        { name: 'court_hearings', fields: ['hearing_id (PK)', 'case_id (FK)', 'hearing_date', 'court_room', 'lawyer_assigned', 'hearing_decision'] },
        { name: 'legal_documents', fields: ['doc_id (PK)', 'case_id (FK)', 'encrypted_s3_key', 'uploaded_by', 'access_level'] }
      ],
      cloudSetup: 'Microsoft Azure Isolated App Service, Azure Key Vault for Hardware Encryption, Encrypted PostgreSQL.'
    }
  },
  {
    id: 10,
    cat: 'automotive',
    title: 'معارض وتأجير السيارات الفاخرة وخدمات الليموزين',
    industry: '🚗 تأجير ومعارض سيارات',
    desc: 'منصة حجز سيارات ذكية مع تتبع الأسطول GPS، نظام توثيق رخص القيادة، عقود الإيجار الرقمية، وإدارة الصيانة الدورية.',
    image: '/portfolio/vipapp.jpg',
    tags: ['React Native', 'Flutter', 'Node.js', 'GPS Live Tracking', 'Contract Sign'],
    badge: 'Car Rental & Fleet ERP',
    storefront: {
      heroTitle: 'استأجر أرقى السيارات الفاخرة والاقتصادية بضغطة زر',
      heroSubtitle: 'أسطول متكامل من أحدث موديلات 2025 مع تأمين شامل وتوصيل السيارة للمطار أو الفندق',
      sampleProducts: [
        { name: 'مرسيدس بنز S-Class 2025 مع سائق VIP', cat: 'فاخر ليموزين', price: '180.00 د.أ / يوم', badge: 'VIP فخم', icon: '🚘' },
        { name: 'رينج روفر سبورت 2024 دفع رباعي', cat: 'SUV عائلي', price: '140.00 د.أ / يوم', badge: 'الأكثر طلباً', icon: '🚙' },
        { name: 'هيونداي سوناتا هايبرد 2024 اقتصادية', cat: 'سيدان اقتصادي', price: '30.00 د.أ / يوم', badge: 'عرض توفير', icon: '🚗' },
        { name: 'تويوتا برادو 7 ركاب للمغامرات والرحلات', cat: 'عائلي كبير', price: '65.00 د.أ / يوم', badge: 'دفع رباعي', icon: '🏕️' },
      ],
      features: ['حجز فوري وتحديد موقع الاستلام والتسليم', 'رفع رخصة القيادة والهوية إلكترونياً', 'توقيع العقد الرقمي على شاشة الهاتف', 'دفع إلكتروني للوديعة والتأمين']
    },
    dashboard: {
      kpis: [
        { label: 'الأسطول المؤجر', val: '86%', trend: '48 من 56 سيارة' },
        { label: 'إيرادات اليوم', val: '2,650 د.أ', trend: '+24%' },
        { label: 'السيارات قيد الصيانة', val: '3 سيارات', trend: 'فحص دوري' },
        { label: 'حجوزات المطار القادمة', val: '12 حجز', trend: 'مؤكد' }
      ],
      ordersTable: [
        { id: '#RENT-502', customer: 'عبد الله السعيد (سياحة)', item: 'مرسيدس S-Class (3 أيام)', amount: '540.00 د.أ', status: 'مؤجر - تسليم مطار الملكة علياء', statusClass: 'statusProcess', time: 'اليوم 11:00' },
        { id: '#RENT-501', customer: 'طارق حداد', item: 'سوناتا هايبرد (أسبوع)', amount: '190.00 د.أ', status: 'تم إرجاع السيارة وفحص الوديعة', statusClass: 'statusDone', time: 'أمس' }
      ],
      erpModules: ['تتبع أسطول السيارات المباشر عبر الـ GPS', 'إدارة فحص أضرار السيارة قبل وبعد الاستلام بالصور', 'جدولة الصيانة الدورية وتغيير الزيوت والتراخيص', 'إدارة المخالفات المرورية وربطها بالمستأجر']
    },
    database: {
      engine: 'PostgreSQL 16 + Redis TimeSeries + GPS Telemetry',
      tables: [
        { name: 'fleet_vehicles', fields: ['vehicle_id (PK)', 'plate_no', 'make_model', 'year', 'daily_rate', 'gps_device_imei', 'status'] },
        { name: 'rentals', fields: ['rental_id (PK)', 'vehicle_id (FK)', 'customer_id', 'start_date', 'end_date', 'total_cost', 'deposit_held'] },
        { name: 'inspection_reports', fields: ['report_id (PK)', 'rental_id (FK)', 'odometer_reading', 'fuel_level', 'damage_photos[]'] }
      ],
      cloudSetup: 'AWS Elastic Container Service with Redis Telemetry Cache for Real-time Vehicle Geofencing & GPS Alerts.'
    }
  },
  {
    id: 11,
    cat: 'automotive',
    title: 'مراكز صيانة السيارات، كراجات الـ Auto Service، وقطع الغيار',
    industry: '🔧 صيانة سيارات وكراجات',
    desc: 'نظام إدارة كروت العمل (Job Cards)، حجز مواعيد الصيانة، إدارة فواتير قطع الغيار، ومتابعة فنيي الميكانيك والكهرباء.',
    image: '/portfolio/vipapp.jpg',
    tags: ['React', 'Node.js', 'VIN Decoder', 'MySQL', 'Job Cards POS'],
    badge: 'Auto Repair & Workshop ERP',
    storefront: {
      heroTitle: 'صيانة احترافية لسيارتك مع فحص كمبيوتر وضمان شامل',
      heroSubtitle: 'احجز موعد الصيانة الدورية، واطلب قطع الغيار الأصلية بضمان معتمد وتقارير فحص رقمية',
      sampleProducts: [
        { name: 'فحص كمبيوتر شامل لجميع الأنظمة (35 نقطة)', cat: 'فحص وتشخيص', price: '20.00 د.أ', badge: 'تقرير PDF فوري', icon: '💻' },
        { name: 'باقة تبديل زيت محرك أصلي + فلتر ألماني', cat: 'صيانة دورية', price: '35.00 د.أ', badge: 'شامل العمل', icon: '🛢️' },
        { name: 'صيانة نظام الفرامل وتبديل سفايف أصلية', cat: 'فرامل وهيدروليك', price: '45.00 د.أ', badge: 'قطع أصلية', icon: '🛑' },
        { name: 'فحص وصيانة بطاريات الهايبرد والسيارات الكهربائية', cat: 'هايبرد وEV', price: '50.00 د.أ', badge: 'فنيون معتمدون', icon: '⚡' },
      ],
      features: ['إدخال رقم الشاصي (VIN) وتحديد القطع المناسبة', 'حجز موعد الصيانة السريعة بدون انتظار', 'متابعة مراحل تصليح سيارتك عبر رسائل الواتساب', 'سجل صيانة رقمي دائم للسيارة']
    },
    dashboard: {
      kpis: [
        { label: 'السيارات في المركز', val: '19 سيارة', trend: 'قيد الصيانة' },
        { label: 'كروت العمل المنجزة', val: '14 سيارة', trend: 'جاهزة للتسليم' },
        { label: 'مبيعات قطع الغيار', val: '1,420 د.أ', trend: '+16%' },
        { label: 'الفنيون النشطون', val: '8 ميكانيكيين', trend: 'في الورشة' }
      ],
      ordersTable: [
        { id: '#JOB-881', customer: 'م. فادي حداد (BMW X5)', item: 'تبديل فحمات فرامل + صيانة هيدروليك', amount: '180.00 د.أ', status: 'قيد العمل على الرافعة 3', statusClass: 'statusProcess', time: 'اليوم 10:00' },
        { id: '#JOB-880', customer: 'أيمن العبداللات (تويوتا كامري)', item: 'صيانة دورية وزيوت', amount: '45.00 د.أ', status: 'تم الفحص وجاهزة للتسليم', statusClass: 'statusDone', time: 'اليوم 09:30' }
      ],
      erpModules: ['نظام كروت الصيانة الرقمية Job Cards', 'إدارة مخزون قطع الغيار وربطه مع أرقام الـ OEM', 'حساب عمولات وإنتاجية الفنيين والميكانيكيين', 'إصدار فواتير صيانة ضريبية إلكترونية مفصلة']
    },
    database: {
      engine: 'MySQL 8.0 Enterprise + ElasticSearch for Parts Search',
      tables: [
        { name: 'job_cards', fields: ['job_id (PK)', 'vin_number', 'plate_no', 'customer_name', 'technician_id', 'status', 'total_labor_cost'] },
        { name: 'spare_parts', fields: ['part_id (PK)', 'oem_part_number', 'brand', 'compatible_models', 'qty_in_stock', 'selling_price'] },
        { name: 'service_history', fields: ['history_id (PK)', 'vin_number', 'service_date', 'mileage', 'work_done_summary'] }
      ],
      cloudSetup: 'Azure Managed App Service with MySQL Database, ElasticSearch instance for instantaneous OEM parts search.'
    }
  },
  {
    id: 12,
    cat: 'hospitality',
    title: 'منظومة الفنادق، الشقق الفندقية، والمنتجعات السياحية (PMS)',
    industry: '🏨 فنادق وشقق ومنتجعات',
    desc: 'نظام إدارة فندقي متكامل مع محرك حجز مباشر، إدارة الغرف والأسعار، فواتير إلكترونية، والربط مع Booking.com وAirbnb.',
    image: '/portfolio/hotel.jpg',
    tags: ['React', 'Node.js', 'Channel Manager', 'PostgreSQL', 'Booking Engine'],
    badge: 'Hotel PMS & Booking System',
    storefront: {
      heroTitle: 'إقامة ساحرة وخدمات فندقية 5 نجوم بأفضل الأسعار',
      heroSubtitle: 'احجز جناحك الفاخر مباشرة بدون وسيط واستمتع بإطلالات خلابة، سبا عالمي، وتجارب طعام فاخرة',
      sampleProducts: [
        { name: 'جناح ملكي فاخر مع جاكوزي وإطلالة بانورامية', cat: 'أجنحة فاخرة', price: '190.00 د.أ / ليلة', badge: 'شامل الإفطار', icon: '👑' },
        { name: 'شاليه عائلي خاص مع مسبح مدفأ (البحر الميت)', cat: 'شاليهات ومنتجعات', price: '220.00 د.أ / ليلة', badge: 'خصوصية تامة', icon: '🏊‍♂️' },
        { name: 'غرفة ديلوكس كينج لرجال الأعمال', cat: 'غرف تنفيذية', price: '95.00 د.أ / ليلة', badge: 'خدمة غرف 24/7', icon: '🛏️' },
        { name: 'باقة عطلة نهاية الأسبوع (إقامة + سبا + عشاء)', cat: 'باقات رومانسية', price: '280.00 د.أ / ليلتين', badge: 'عرض مميز', icon: '💆‍♀️' },
      ],
      features: ['تقويم إشغال فوري وتأكيد الحجز التلقائي', 'بوابة دفع متعددة العملات والبطاقات الدولية', 'إمكانية طلب خدمات إضافية (استقبال مطار، إفطار بالسرير)', 'تأكيد الحجز فوري عبر الواتساب والبريد']
    },
    dashboard: {
      kpis: [
        { label: 'نسبة الإشغال', val: '92%', trend: 'عالية جداً هذا الأسبوع' },
        { label: 'إيرادات الحجوزات', val: '4,850 د.أ', trend: '+30%' },
        { label: 'تسجيل الوصول اليوم (Check-In)', val: '18 ضيف', trend: 'قادمون' },
        { label: 'الغرف الجاهزة بعد التنظيف', val: '42 غرفة', trend: 'جاهزة' }
      ],
      ordersTable: [
        { id: '#HTL-901', customer: 'الشيخ منصور القاسمي', item: 'الجناح الملكي (4 ليالٍ)', amount: '760.00 د.أ', status: 'مؤكد ومسجل وصول', statusClass: 'statusDone', time: 'اليوم 14:00' },
        { id: '#HTL-900', customer: 'جون ويليامز (حجز Booking)', item: 'غرفة ديلوكس كينج (ليلتين)', amount: '190.00 د.أ', status: 'تمت مزامنة الحجز وتأكيده', statusClass: 'statusPaid', time: 'اليوم 12:30' }
      ],
      erpModules: ['مزامنة الحجوزات آلياً مع Booking.com و Expedia و Airbnb', 'نظام إدارة خدمة الغرف والتنظيف (Housekeeping App)', 'إصدار فواتير الضيوف الفندقية (Guest Folio) بنقرة واحدة', 'إدارة أسعار المواسم والعطلات الديناميكية (Yield Management)']
    },
    database: {
      engine: 'PostgreSQL 16 Multi-Region + Redis Distributed Lock',
      tables: [
        { name: 'hotel_rooms', fields: ['room_id (PK)', 'room_number', 'room_type', 'base_rate', 'cleaning_status', 'is_active'] },
        { name: 'bookings', fields: ['booking_id (PK)', 'guest_name', 'check_in', 'check_out', 'channel_source', 'total_amount', 'status'] },
        { name: 'channel_sync_logs', fields: ['sync_id (PK)', 'ota_platform', 'event_type', 'payload_json', 'synced_at'] }
      ],
      cloudSetup: 'AWS Elastic Beanstalk, Amazon RDS PostgreSQL Multi-AZ, Cloudflare Enterprise DDoS Protection for Hotel Booking Engine.'
    }
  },
  {
    id: 13,
    cat: 'hospitality',
    title: 'شركات السياحة، الرحلات، وحجوزات الطيران والفنادق',
    industry: '✈️ سياحة وسفر وطيران',
    desc: 'منصة تسويق برامج سياحية متكاملة، محرك حجز تذاكر وفنادق، باقات العمرة والرحلات الدولية، وإدارة مجموعات السفر.',
    image: '/portfolio/hotel.jpg',
    tags: ['React', 'GDS API', 'Node.js', 'Amadeus / Sabre', 'Multi-currency'],
    badge: 'Travel & Tourism Portal',
    storefront: {
      heroTitle: 'سافر واستكشف العالم مع أرقى البرامج السياحية المتكاملة',
      heroSubtitle: 'باقات سياحية تشمل الطيران، الفنادق، الجولات السياحية مع مرشدين محترفين ودعم على مدار الساعة',
      sampleProducts: [
        { name: 'رحلة الأحلام إلى تركيا (إسطنبول وبورصة - 7 أيام)', cat: 'رحلات دولية', price: '380.00 د.أ', badge: 'شامل الطيران والفندق', icon: '🇹🇷' },
        { name: 'باقة الاستجمام في البوسنة وسراييفو (8 أيام)', cat: 'طبيعة واستجمام', price: '520.00 د.أ', badge: 'برنامج عائلي', icon: '🌲' },
        { name: 'رحلة البتراء ووادي رم والعقبة (3 أيام VIP)', cat: 'سياحة أردنية', price: '120.00 د.أ', badge: 'تخييم فاخر', icon: '🏜️' },
        { name: 'باقة العمرة الفاخرة بالطائرة (5 أيام فنادق الحرم)', cat: 'رحلات دينية', price: '290.00 د.أ', badge: 'خدمة VIP', icon: '🕋' },
      ],
      features: ['جدول تفصيلي يومي للرحلة مع الصور', 'حجز ودفع بالتقسيط المريح', 'خدمات استخراج التأشيرات السياحية الفيزا', 'تأمين سفر دولي شامل مع كل حجز']
    },
    dashboard: {
      kpis: [
        { label: 'المسافرون هذا الشهر', val: '340 مسافر', trend: '+28%' },
        { label: 'البرامج السياحية النشطة', val: '24 برنامج', trend: 'جاهز للحجز' },
        { label: 'إجمالي المبيعات', val: '48,000 د.أ', trend: '+35%' },
        { label: 'التأشيرات المنجزة', val: '98 تأشيرة', trend: 'صادرة' }
      ],
      ordersTable: [
        { id: '#TRV-442', customer: 'عائلة د. حسام النجار (4 أفراد)', item: 'باقة إسطنبول وبورصة 7 أيام', amount: '1,520 د.أ', status: 'تم إصدار التذاكر وقسائم الفنادق', statusClass: 'statusDone', time: 'اليوم' },
        { id: '#TRV-441', customer: 'طارق غرايبة', item: 'رحلة وادي رم والبتراء VIP', amount: '240.00 د.أ', status: 'مدفوع ومؤكد', statusClass: 'statusPaid', time: 'أمس' }
      ],
      erpModules: ['نظام ربط واجهات الـ GDS للطيران والفنادق', 'إدارة تفويج المجموعات السياحية والمرشدين', 'إصدار قسائم الفنادق Vouchers وتذاكر الطيران', 'حساب أرباح البرامج السياحية وتكاليف الموردين']
    },
    database: {
      engine: 'PostgreSQL 16 + Redis Caching for GDS Flight Queries',
      tables: [
        { name: 'tour_packages', fields: ['package_id (PK)', 'title_ar', 'destination_country', 'duration_days', 'price_per_person', 'itinerary_json'] },
        { name: 'group_bookings', fields: ['booking_id (PK)', 'package_id (FK)', 'lead_passenger_name', 'pax_count', 'total_amount', 'status'] },
        { name: 'passenger_manifest', fields: ['pax_id (PK)', 'booking_id (FK)', 'passport_number', 'nationality', 'visa_status'] }
      ],
      cloudSetup: 'AWS Multi-AZ Cloud, CloudFront CDN, Integration with Global Distribution System (Amadeus/Sabre APIs).'
    }
  },
  {
    id: 14,
    cat: 'industrial',
    title: 'المصانع، الشركات الصناعية، وخطوط الإنتاج والتوريد B2B',
    industry: '🏭 مصانع وسلاسل توريد',
    desc: 'منظومة سحابية مركزية لإدارة خطوط الإنتاج، المستودعات، المحاسبة العامة، الفواتير الضريبية، وإدارة شؤون الموظفين.',
    image: '/portfolio/erp.jpg',
    tags: ['SaaS Cloud ERP', 'Docker', 'Microservices', 'PostgreSQL', 'BI Analytics'],
    badge: 'Enterprise Manufacturing ERP',
    storefront: {
      heroTitle: 'حلول صناعية متطورة بمعايير جودة عالمية وتوريد B2B',
      heroSubtitle: 'استعرض كتالوج المنتجات الصناعية، واطلب عروض أسعار للكميات الكبيرة مع مواصفات فنية دقيقة',
      sampleProducts: [
        { name: 'خط إنتاج وتعبئة أوتوماتيكي متكامل', cat: 'معدات صناعية', price: 'حسب الطلب B2B', badge: 'مخصص', icon: '⚙️' },
        { name: 'مواد خام صناعية نقية معتمدة ISO', cat: 'مواد أولية', price: 'سعر الطن بالجملة', badge: 'مطابق للمواصفات', icon: '🧱' },
        { name: 'عبوات تغليف كرتونية مخصصة للمصانع', cat: 'تغليف وتعبئة', price: 'عقود توريد سنوية', badge: 'طباعة خاصة', icon: '📦' },
        { name: 'أنظمة تحكم وأتمتة صناعية PLC و SCADA', cat: 'أتمتة صناعية', price: 'حلول هندسية', badge: 'كفاءة عالية', icon: '🎛️' },
      ],
      features: ['كتالوج تقني تفصيلي لتحميل ملفات الـ PDF والمواصفات', 'نظام طلب عروض الأسعار والمناقصات (RFQ)', 'حساب تكاليف الشحن الدولي والجمارك', 'تواصل مباشر مع مهندسي المبيعات الصناعية']
    },
    dashboard: {
      kpis: [
        { label: 'أوامر الإنتاج اليوم', val: '24 أمر', trend: 'قيد التشغيل' },
        { label: 'نسبة كفاءة الآلات (OEE)', val: '91.4%', trend: 'ممتاز' },
        { label: 'المخزون من المواد الخام', val: '840 طن', trend: 'مستقر' },
        { label: 'فواتير B2B المعتمدة', val: '68,000 د.أ', trend: 'هذا الشهر' }
      ],
      ordersTable: [
        { id: '#PO-994', customer: 'شركة الشرق الأوسط للصناعات', item: 'توريد دفعة مواد خام (50 طن)', amount: '24,500 د.أ', status: 'في مرحلة التصنيع والتجهيز', statusClass: 'statusProcess', time: 'اليوم' },
        { id: '#PO-993', customer: 'مجمع الأغذية الوطني', item: 'عبوات كرتون مطبوعة (100 ألف قطعة)', amount: '12,000 د.أ', status: 'تم التسليم والفحص المخبري', statusClass: 'statusDone', time: 'أمس' }
      ],
      erpModules: ['شجرة المواد وتكاليف الإنتاج (Bill of Materials - BOM)', 'إدارة جودة خطوط الإنتاج والفحص المخبري (QC)', 'إدارة المستودعات المتعددة وحركات المواد الأولية', 'المحاسبة العامة والتكاليف الصناعية ومراكز التكلفة']
    },
    database: {
      engine: 'PostgreSQL 16 Enterprise Sharded + TimescaleDB for IoT Telemetry',
      tables: [
        { name: 'bom_recipes', fields: ['bom_id (PK)', 'finished_good_sku', 'raw_materials_list[]', 'standard_labor_hours', 'unit_cost'] },
        { name: 'production_orders', fields: ['work_order_id (PK)', 'bom_id (FK)', 'target_quantity', 'actual_produced', 'status', 'machine_id'] },
        { name: 'qc_inspections', fields: ['qc_id (PK)', 'work_order_id (FK)', 'tested_samples_count', 'passed_pct', 'inspector_notes'] }
      ],
      cloudSetup: 'Azure Kubernetes Service (AKS), Azure Database for PostgreSQL Flexible, TimescaleDB extension for live factory IoT machine data.'
    }
  },
  {
    id: 15,
    cat: 'industrial',
    title: 'شركات الشحن، التخليص الجمركي، والتخزين اللوجستي',
    industry: '📦 شحن ولوجستيات وتخليص',
    desc: 'منصة تتبع بوالص الشحن الدولية والمحلية، حساب الرسوم الجمركية والضرائب، إدارة مستودعات التخزين، وحركة الحاويات.',
    image: '/portfolio/grocery.jpg',
    tags: ['React', 'Node.js', 'Waybill Tracking', 'PostgreSQL', 'Customs API'],
    badge: 'Freight & Logistics Platform',
    storefront: {
      heroTitle: 'شحن دولي سريع وتخليص جمركي موثوق لبضائعك حول العالم',
      heroSubtitle: 'شحن جوي، بحري، وبري مع تتبع حي للشحنة لحظة بلحظة وحساب فوري للرسوم والتكاليف',
      sampleProducts: [
        { name: 'شحن جوي إكسبريس (من الباب إلى الباب)', cat: 'شحن جوي', price: 'حسب الوزن والحجم', badge: 'خلال 3-5 أيام', icon: '✈️' },
        { name: 'شحن بحري حاويات كاملة ومجمعة (FCL & LCL)', cat: 'شحن بحري', price: 'أسعار منافسة', badge: 'شحن تجاري', icon: '🚢' },
        { name: 'خدمات التخليص الجمركي الشامل في مطار الملكة علياء والعقبة', cat: 'تخليص جمركي', price: 'رسوم شفافة', badge: 'خبرة عريقة', icon: '📋' },
        { name: 'خدمات التخزين اللوجستي وإدارة الطلبات (Fulfillment)', cat: 'تخزين ومستودعات', price: 'شهرياً حسب المساحة', badge: 'مستودعات مكيفة', icon: '🏬' },
      ],
      features: ['تتبع بوليصة الشحن (Tracking Number) الحية', 'حاسبة أسعار الشحن التقديرية بالوزن والأبعاد', 'تحميل البيانات الجمركية وفواتير الشحن PDF', 'إشعارات تلقائية عبر الواتساب عند وصول الشحنة']
    },
    dashboard: {
      kpis: [
        { label: 'الشحنات النشطة', val: '412 شحنة', trend: 'في الطريق' },
        { label: 'الحاويات المخلصة جمركياً', val: '28 حاوية', trend: 'هذا الأسبوع' },
        { label: 'إجمالي الوزن المشحون', val: '84 طن', trend: '+18%' },
        { label: 'الشاحنات على الطريق', val: '22 شاحنة', trend: 'GPS متصل' }
      ],
      ordersTable: [
        { id: '#AWB-7741', customer: 'شركة النجم للتجارة', item: 'حاوية 40 قدم (أقمشة من الصين)', amount: '3,800 د.أ', status: 'وصلت ميناء العقبة - جاري التخليص', statusClass: 'statusProcess', time: 'اليوم' },
        { id: '#AWB-7740', customer: 'م. سامر الكردي', item: 'شحنة جوية قطع إلكترونية (دبي)', amount: '450.00 د.أ', status: 'تم التسليم في عمان بنجاح', statusClass: 'statusDone', time: 'أمس' }
      ],
      erpModules: ['إصدار بوالص الشحن الجوي والبحري AWB الرقمية', 'إدارة مستودعات التخزين ومواقع الرفوف (WMS)', 'ربط النظام مع البوابات الجمركية ونظام سراج', 'تتبع أسطول النقل البري عبر الـ GPS والمناطق الجغرافية']
    },
    database: {
      engine: 'PostgreSQL 16 + Redis Caching for Real-time Tracking',
      tables: [
        { name: 'shipments', fields: ['waybill_number (PK)', 'shipper_id', 'consignee_id', 'origin_port', 'dest_port', 'weight_kg', 'status'] },
        { name: 'tracking_checkpoints', fields: ['checkpoint_id (PK)', 'waybill_number (FK)', 'location_name', 'status_description', 'timestamp'] },
        { name: 'customs_declarations', fields: ['declaration_no (PK)', 'customs_broker_id', 'tariff_code', 'duty_amount_jod', 'is_cleared'] }
      ],
      cloudSetup: 'AWS Cloud Architecture, PostgreSQL RDS with Multi-AZ, Elasticache Redis for Fast Public Tracking Portal.'
    }
  },
  {
    id: 16,
    cat: 'lifestyle',
    title: 'النوادي الرياضية، مراكز اللياقة البدنية، والكروسفت (Gym ERP)',
    industry: '🏋️‍♂️ نوادي وجيم ولياقة بدنية',
    desc: 'منصة اشتراكات النوادي الرياضية، بوابات الدخول الذكية بالـ QR/RFID، حجز حصص التدريب، وبرامج المدربين الخصوصيين.',
    image: '/portfolio/vipapp.jpg',
    tags: ['Flutter', 'React', 'QR Turnstile Access', 'Node.js', 'PostgreSQL'],
    badge: 'Fitness & Gym Management',
    storefront: {
      heroTitle: 'ابدأ رحلة رشاقتك وقوتك في أفضل نادي رياضي متكامل',
      heroSubtitle: 'أحدث الأجهزة الرياضية، مدربون محترفون، برامج تغذية مخصصة، ومسبح وسبا متكامل',
      sampleProducts: [
        { name: 'اشتراك سنوي شامل VIP (جيم + مسبح + ساونا)', cat: 'اشتراكات سنوية', price: '320.00 د.أ', badge: 'عرض توفير 40%', icon: '🏆' },
        { name: 'اشتراك 3 أشهر لياقة مع حصص جماعية مجانية', cat: 'اشتراكات موسمية', price: '120.00 د.أ', badge: 'الأكثر شعبية', icon: '💪' },
        { name: 'باقة تدريب شخصي مع كابتن خاص (12 جلسة)', cat: 'تدريب شخصي PT', price: '150.00 د.أ', badge: 'متابعة فردية', icon: '🏋️‍♂️' },
        { name: 'برنامج تغذية وحمية مخصص مع أخصائية التغذية', cat: 'تغذية وصحة', price: '45.00 د.أ', badge: 'فحص InBody', icon: '🥗' },
      ],
      features: ['تجديد الاشتراك والدفع الإلكتروني عبر كليك', 'بطاقة دخول رقمية بالـ QR Code على الجوال', 'جدول الحصص الجماعية (Spinning, CrossFit, Yoga)', 'حجز موعد فحص الـ InBody وقياس الكتلة العضلية']
    },
    dashboard: {
      kpis: [
        { label: 'الأعضاء النشطون', val: '840 عضو', trend: 'اشتراكات فعالة' },
        { label: 'الدخول اليومي للنادي', val: '312 زيارة', trend: 'عبر بوابات الـ QR' },
        { label: 'تجديدات الاشتراكات', val: '4,200 د.أ', trend: '+25%' },
        { label: 'المدربون المناوبون', val: '6 مدربين', trend: 'في الصالة' }
      ],
      ordersTable: [
        { id: '#GYM-229', customer: 'يزن الحنيطي', item: 'تجديد اشتراك 6 أشهر VIP', amount: '210.00 د.أ', status: 'تم الدفع وتفعيل البوابة', statusClass: 'statusDone', time: 'منذ 15 دقيقة' },
        { id: '#GYM-228', customer: 'رامي الكردي', item: 'باقة تدريب شخصي 12 حصة', amount: '150.00 د.أ', status: 'مدفوع وتم تعيين الكابتن عمر', statusClass: 'statusPaid', time: 'اليوم' }
      ],
      erpModules: ['ربط بوابات الدخول الإلكترونية Turnstiles بنظام الـ RFID والـ QR', 'نظام إدارة اشتراكات وتجميد العضويات (Freeze Membership)', 'إدارة حصص المدربين والعمولات الشهرية', 'تنبيهات تلقائية للأعضاء قبل انتهاء الاشتراك عبر الواتساب']
    },
    database: {
      engine: 'PostgreSQL 16 + Webhook Gateway for Hardware Access Control',
      tables: [
        { name: 'gym_members', fields: ['member_id (PK)', 'full_name', 'phone', 'qr_access_token', 'inbody_profile_json', 'status'] },
        { name: 'membership_plans', fields: ['plan_id (PK)', 'member_id (FK)', 'start_date', 'end_date', 'freeze_days_left', 'paid_amount'] },
        { name: 'turnstile_access_logs', fields: ['log_id (PK)', 'member_id (FK)', 'gate_id', 'access_result', 'timestamp'] }
      ],
      cloudSetup: 'Azure Virtual Machines, PostgreSQL Flexible Server, WebSockets for Instant Turnstile Gate Unlocking.'
    }
  },
  {
    id: 17,
    cat: 'lifestyle',
    title: 'صالونات التجميل، مراكز العناية الفاخرة، ومراكز السبا (Beauty & Spa)',
    industry: '💄 صالونات تجميل ومراكز سبا',
    desc: 'منصة حجز خدمات التجميل والميك اب، اختيار الأخصائية المفضلة، إدارة بكجات العرائس، ونقاط الولاء للعميلات.',
    image: '/portfolio/fashion.jpg',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Calendar Grid', 'WhatsApp Alerts'],
    badge: 'Beauty Salon & Spa Booking',
    storefront: {
      heroTitle: 'تألقي بجمال ملكي مع أرقى خدمات التجميل والسبا',
      heroSubtitle: 'احجزي موعدكِ مع خبيرات التجميل المعتمدات واستمتعي بتجربة استرخاء وعناية فائقة الدلال',
      sampleProducts: [
        { name: 'باقة العروس الملكية الشاملة (شعر + ميك اب + سبا)', cat: 'باقات العرائس', price: '280.00 د.أ', badge: 'شامل كل التفاصيل', icon: '👰' },
        { name: 'جلسة تنظيف بشرة عميق هيدرافيشل + ماسك كولاجين', cat: 'العناية بالبشرة', price: '45.00 د.أ', badge: 'نضارة فورية', icon: '✨' },
        { name: 'صبغة شعر هايلايت مع معالج فيلر وترميم', cat: 'تصفيف الشعر', price: '70.00 د.أ', badge: 'ألوان موسم 2025', icon: '💇‍♀️' },
        { name: 'جلسة مساج استرخائي بالزيوت العطرية والساونا', cat: 'السبا والمساج', price: '35.00 د.أ', badge: 'استرخاء 60 دقيقة', icon: '🧖‍♀️' },
      ],
      features: ['اختيار الأخصائية وتاريخ وساعة الموعد الدقيقة', 'تأكيد الحجز وتذكير تلقائي عبر الواتساب قبل الموعد بساعتين', 'شراء باقات الهدايا والقسائم الرقمية للصديقات', 'نظام تجميع نقاط المكافآت مع كل زيارة']
    },
    dashboard: {
      kpis: [
        { label: 'حجوزات اليوم', val: '28 عميلة', trend: 'كامل جدول الصالون' },
        { label: 'إيرادات اليوم', val: '1,350 د.أ', trend: '+22%' },
        { label: 'باقات العرائس المحجوزة', val: '8 عرائس', trend: 'هذا الشهر' },
        { label: 'الأخصائيات بالخدمة', val: '9 خبيرات', trend: 'في الصالون' }
      ],
      ordersTable: [
        { id: '#SAL-390', customer: 'روان المجالي (عروس الجمعة)', item: 'باقة العروس الملكية الشاملة', amount: '280.00 د.أ', status: 'دفعة أولى مستلمة - موعد مؤكد', statusClass: 'statusDone', time: 'الجمعة 12:00' },
        { id: '#SAL-389', customer: 'هيا الناصر', item: 'جلسة هيدرافيشل + بديكير', amount: '60.00 د.أ', status: 'في غرفة العناية بالبشرة', statusClass: 'statusProcess', time: 'اليوم 11:30' }
      ],
      erpModules: ['جدول حجوزات الأخصائيات التفاعلي (Time Slot Grid)', 'إدارة مخزون مواد التجميل والصبغات واستهلاك الجلسات', 'حساب عمولات ونسب خبيرات التجميل الشهرية', 'نظام إدارة العروض وقسائم الخصم الترويجية']
    },
    database: {
      engine: 'PostgreSQL 16 + Redis Real-time Slot Lock',
      tables: [
        { name: 'salon_services', fields: ['service_id (PK)', 'title_ar', 'duration_minutes', 'price', 'category_id'] },
        { name: 'stylists', fields: ['stylist_id (PK)', 'name', 'specialty', 'shift_hours_json', 'commission_rate'] },
        { name: 'salon_appointments', fields: ['app_id (PK)', 'customer_name', 'stylist_id (FK)', 'start_time', 'end_time', 'status'] }
      ],
      cloudSetup: 'AWS Elastic Beanstalk, Amazon RDS PostgreSQL, Twilio & WhatsApp Cloud API Integration.'
    }
  },
  {
    id: 18,
    cat: 'services',
    title: 'شركات التنظيف، الصيانة، والخدمات المنزلية الذكية',
    industry: '🧹 تنظيف وصيانة منزلية',
    desc: 'تطبيق طلب عاملات تنظيف بالساعة أو الشهر، خدمات صيانة التكييف والسباكة، وتتبع فنيي الصيانة على الخريطة.',
    image: '/portfolio/grocery.jpg',
    tags: ['Flutter', 'React', 'Node.js', 'PostgreSQL', 'Live Dispatcher'],
    badge: 'On-Demand Home Services',
    storefront: {
      heroTitle: 'خدمات منزلية احترافية بضغطة زر وبأعلى درجات الأمان والخبرة',
      heroSubtitle: 'تنظيف منازل، صيانة تكييف، سباكة، مكافحة حشرات، وغسيل سجاد مع كادر مدرب ومؤهل',
      sampleProducts: [
        { name: 'خدمة تنظيف منزلي بالساعة (عاملات مدربات)', cat: 'تنظيف يومي', price: '20.00 د.أ / 4 ساعات', badge: 'الأكثر طلباً', icon: '🧹' },
        { name: 'صيانة وغسيل مكيفات سبليت مع تعبئة غاز', cat: 'صيانة تكييف', price: '15.00 د.أ / مكيف', badge: 'فني معتمد', icon: '❄️' },
        { name: 'تنظيف وتعقيم الكنب والمفروشات بالبخار', cat: 'غسيل سجاد وكنب', price: '35.00 د.أ / طقم', badge: 'إزالة بقع فورية', icon: '🛋️' },
        { name: 'خدمة التعقيم ومكافحة الحشرات والقوارض', cat: 'مكافحة حشرات', price: '30.00 د.أ', badge: 'ضمان 6 أشهر', icon: '🛡️' },
      ],
      features: ['تحديد اليوم والوقت وعدد العاملات أو الفنيين', 'دفع إلكتروني آمن أو كاش بعد انتهاء الخدمة', 'تقييم الفني بعد إنجاز العمل', 'إمكانية الاشتراك الشهري المنتظم']
    },
    dashboard: {
      kpis: [
        { label: 'الطلبات المجدولة اليوم', val: '54 زيارة', trend: 'موزعة على الفرق' },
        { label: 'نسبة الالتزام بالوقت', val: '98.2%', trend: 'ممتاز' },
        { label: 'إجمالي المبيعات', val: '1,480 د.أ', trend: '+20%' },
        { label: 'الفرق الميدانية النشطة', val: '16 فريق', trend: 'في الخدمة' }
      ],
      ordersTable: [
        { id: '#CLN-802', customer: 'أم أحمد (خلدا)', item: 'تنظيف منزلي 4 ساعات (عاملتان)', amount: '35.00 د.أ', status: 'الفريق في الموقع - جاري العمل', statusClass: 'statusProcess', time: 'اليوم 09:00' },
        { id: '#CLN-801', customer: 'م. عمر الشيخ', item: 'صيانة 3 مكيفات وتعبئة غاز', amount: '45.00 د.أ', status: 'تمت الصيانة وتقييم 5 نجوم', statusClass: 'statusDone', time: 'أمس' }
      ],
      erpModules: ['نظام التوجيه وتوزيع الفرق حسب المناطق الجغرافية', 'إدارة سجلات وجوازات العاملات والفحوصات الطبية', 'إصدار الفواتير وسندات القبض الإلكترونية', 'تحليلات شكاوى العملاء وجودة أداء الفنيين']
    },
    database: {
      engine: 'PostgreSQL 16 + PostGIS for Route Optimization',
      tables: [
        { name: 'service_packages', fields: ['pkg_id (PK)', 'title_ar', 'duration_hours', 'base_price', 'category'] },
        { name: 'field_teams', fields: ['team_id (PK)', 'leader_name', 'current_zone', 'is_available', 'active_booking_id'] },
        { name: 'service_bookings', fields: ['booking_id (PK)', 'customer_address_geom', 'scheduled_time', 'status', 'rating_stars'] }
      ],
      cloudSetup: 'AWS Elastic Beanstalk + PostgreSQL RDS with PostGIS for Spatial Nearest-Technician Dispatching.'
    }
  },
  {
    id: 19,
    cat: 'services',
    title: 'الشركات القابضة، المؤسسات الكبرى، والمواقع المؤسسية الفاخرة',
    industry: '🏢 شركات قابضة واستثمارية',
    desc: 'موقع تعريفي فاخر يعرض سابقة المشاريع الضخمة، علاقات المستثمرين، تقارير الاستدامة والحوكمة، وبوابات التوظيف.',
    image: '/portfolio/corporate.jpg',
    tags: ['Next.js 14', 'Sanity CMS', 'Multi-Language', 'High Performance', 'Investor Relations'],
    badge: 'Enterprise Corporate Portal',
    storefront: {
      heroTitle: 'استثمارات استراتيجية تقود الابتكار وتبني المستقبل',
      heroSubtitle: 'مجموعة استثمارية رائدة تدير محفظة متنوعة من الشركات في قطاعات الطاقة، التكنولوجيا، والعقارات',
      sampleProducts: [
        { name: 'محفظة المشاريع الاستثمارية والعقارية الكبرى', cat: 'المشاريع', price: 'أصول تتجاوز 50M', badge: 'استثمارات استراتيجية', icon: '🏢' },
        { name: 'التقرير المالي السنوي وتقارير الحوكمة (PDF)', cat: 'علاقات المستثمرين', price: 'تحميل مجاني', badge: 'مدقق مالياً', icon: '📊' },
        { name: 'بوابة التقديم على المناقصات والمشتريات الرسمية', cat: 'المناقصات', price: 'بوابة إلكترونية', badge: 'معتمد للموردين', icon: '📑' },
        { name: 'برنامج استقطاب الكفاءات والوظائف التنفيذية', cat: 'الوظائف والمهن', price: 'بوابة التوظيف', badge: 'فرص عمل', icon: '💼' },
      ],
      features: ['لوحة علاقات مستثمرين متكاملة مع أسعار الأسهم', 'أرشيف رقمي للتقارير السنوية والبيانات الصحفية', 'بوابة تقديم عروض الموردين والمناقصات الإلكترونية', 'دعم كامل للغتين العربية والإنجليزية وسرعة تحميل 99+']
    },
    dashboard: {
      kpis: [
        { label: 'الزوار المؤسسيون', val: '45,000 زائر', trend: '+30% هذا الربع' },
        { label: 'طلبات التوظيف المستلمة', val: '380 طلب', trend: 'مفهرسة بالـ AI' },
        { label: 'تحميلات التقرير المالي', val: '1,240 تحميل', trend: 'مستثمرون وصناديق' },
        { label: 'عروض المناقصات', val: '18 عرض', trend: 'قيد التقييم' }
      ],
      ordersTable: [
        { id: '#TND-104', customer: 'شركة الأبراج للمقاولات', item: 'تقديم عطاء مناقصة الطاقة الشمسية', amount: 'مشاريع كبرى', status: 'تم الاستلام وإحالة للجنة الفنية', statusClass: 'statusProcess', time: 'اليوم' },
        { id: '#APP-902', customer: 'م. ياسمين شاهين', item: 'طلب توظيف: مدير مشاريع أول', amount: 'HR Portal', status: 'تم الفرز وتحديد مقابلة', statusClass: 'statusDone', time: 'أمس' }
      ],
      erpModules: ['إدارة المحتوى المؤسسي CMS متعدد اللغات', 'بوابة التوظيف وفرز السير الذاتية بالذكاء الاصطناعي', 'نظام إدارة اجتماعات مجلس الإدارة ومحاضر الجلسات', 'إدارة العطاءات والمناقصات الرقمية المشفرة']
    },
    database: {
      engine: 'PostgreSQL 16 + Sanity Headless CMS + Azure Blob Storage',
      tables: [
        { name: 'corporate_news', fields: ['news_id (PK)', 'title_ar', 'title_en', 'content_markdown', 'published_at', 'cover_image'] },
        { name: 'investor_reports', fields: ['report_id (PK)', 'fiscal_year', 'quarter', 'pdf_download_url', 'download_counter'] },
        { name: 'job_applications', fields: ['app_id (PK)', 'job_id', 'applicant_name', 'resume_pdf_url', 'ai_match_score'] }
      ],
      cloudSetup: 'Azure Front Door CDN with Global Anycast Routing, Azure Static Web Apps, Automated Failover Replication.'
    }
  },
  {
    id: 20,
    cat: 'services',
    title: 'تنظيم الفعاليات، المؤتمرات، المعارض، وحفلات الأعراس الفاخرة',
    industry: '💎 تنظيم فعاليات ومؤتمرات',
    desc: 'منصة بيع تذاكر المؤتمرات والمعارض، إصدار بطاقات الـ QR للمشاركين، حجز أجنحة العارضين، وإدارة حفلات الزفاف الفاخرة.',
    image: '/portfolio/corporate.jpg',
    tags: ['React', 'Node.js', 'QR Gate Scanner', 'PostgreSQL', 'Stripe & CliQ'],
    badge: 'Events & Ticketing Platform',
    storefront: {
      heroTitle: 'نصنع من فعاليتك حدثاً استثنائياً لا ينسى',
      heroSubtitle: 'تنظيم مؤتمرات دولية، معارض تجارية، وإدارة حفلات الأعراس الملكية بأدق التفاصيل الفاخرة',
      sampleProducts: [
        { name: 'تذكرة مؤتمر التكنولوجيا والذكاء الاصطناعي VIP (شامل ورش العمل)', cat: 'تذاكر مؤتمرات', price: '75.00 د.أ', badge: 'مقاعد محدودة', icon: '🎟️' },
        { name: 'حجز جناح عرض تجاري في المعرض الدولي (مساحة 12م²)', cat: 'أجنحة عارضين', price: '650.00 د.أ', badge: 'موقع مميز', icon: '🎪' },
        { name: 'باقة تنظيم وتنسيق حفل الزفاف الأسطوري الملكي', cat: 'تنظيم أعراس', price: '2,500 د.أ', badge: 'ديكور وصوت وإضاءة', icon: '💍' },
        { name: 'خدمات التغطية الإعلامية، البث المباشر، والإنتاج المرئي', cat: 'تغطية إعلامية', price: '450.00 د.أ', badge: 'كاميرات 4K ودرون', icon: '🎥' },
      ],
      features: ['شراء التذكرة واستلام بطاقة الـ QR فوراً على البريد والواتساب', 'خريطة تفاعلية لاختيار مقاعد المسرح أو أجنحة المعرض', 'جدول جلسات المؤتمر والمتحدثين مع تذكيرات بالوقت', 'تطبيق مسح سريع للبطاقات عند البوابات بدون تأخير']
    },
    dashboard: {
      kpis: [
        { label: 'التذاكر المباعة', val: '1,420 تذكرة', trend: '+85% من السعة' },
        { label: 'إيرادات الفعالية', val: '32,500 د.أ', trend: 'تذاكر ورعايات' },
        { label: 'الشركات الراعية', val: '14 راعياً', trend: 'بلاتيني وذهبي' },
        { label: 'الدخول الفعلي عند البوابات', val: '1,280 حاضر', trend: 'سجل دخول' }
      ],
      ordersTable: [
        { id: '#EVT-801', customer: 'د. طلال السالم', item: '2 تذكرة مؤتمر الذكاء الاصطناعي VIP', amount: '150.00 د.أ', status: 'مدفوع وتم إرسال بطاقة الـ QR', statusClass: 'statusDone', time: 'اليوم' },
        { id: '#EVT-800', customer: 'شركة الحلول السحابية', item: 'حجز جناح عرض 12م² في المعرض', amount: '650.00 د.أ', status: 'دفعة كاملة مستلمة وتثبيت الجناح', statusClass: 'statusPaid', time: 'أمس' }
      ],
      erpModules: ['تطبيق مسح الباركود عند البوابات Gate Scanner App', 'إدارة الشركات الراعية والعارضين وإصدار الفواتير', 'نظام إدارة جلسات المتحدثين وورش العمل', 'تحليلات الحضور وساعات الذروة المباشرة']
    },
    database: {
      engine: 'PostgreSQL 16 + Redis for Ultra-Fast QR Ticket Validation',
      tables: [
        { name: 'events', fields: ['event_id (PK)', 'title_ar', 'venue_name', 'start_datetime', 'capacity', 'ticket_tiers_json'] },
        { name: 'event_tickets', fields: ['ticket_id (PK)', 'event_id (FK)', 'attendee_name', 'qr_hash', 'is_scanned', 'scanned_at'] },
        { name: 'booth_allocations', fields: ['booth_id (PK)', 'exhibitor_company', 'booth_number', 'price_paid', 'contract_pdf_url'] }
      ],
      cloudSetup: 'AWS Elastic Load Balancer with Auto-Scaling for sudden high-volume ticket sale launches, Redis Cluster.'
    }
  },
  {
    id: 21,
    cat: 'saas',
    title: 'المنصات السحابية SaaS، تطبيقات الاشتراكات، والحلول البرمجية المتطورة',
    industry: '📱 تطبيقات سحابية SaaS',
    desc: 'بناء منصات برمجية كخدمة SaaS مع بوابات اشتراكات دورية، عزل بيانات المشتركين (Multi-Tenancy)، وواجهات API متطورة.',
    image: '/portfolio/vipapp.jpg',
    tags: ['Next.js 14', 'Stripe Billing', 'Node.js', 'PostgreSQL Multi-Tenant', 'Docker'],
    badge: 'Multi-Tenant SaaS Platform',
    storefront: {
      heroTitle: 'منصة سحابية متكاملة لأتمتة أعمالك ورفع إنتاجية فريقك',
      heroSubtitle: 'ابدأ تجربتك المجانية لمدة 14 يوماً بدون بطاقة بنكية واستمتع بأدوات ذكاء اصطناعي ثورية',
      sampleProducts: [
        { name: 'الباقة الأساسية (للمشاريع الناشئة حتى 5 مستخدمين)', cat: 'اشتراك شهري', price: '19.00 د.أ / شهر', badge: 'تجربة 14 يوم مجاناً', icon: '🚀' },
        { name: 'الباقة الاحترافية Pro (غير محدود مع ميزات الذكاء الاصطناعي)', cat: 'اشتراك شهري', price: '49.00 د.أ / شهر', badge: 'الأكثر اختياراً', icon: '⭐' },
        { name: 'باقة الشركات الكبرى Enterprise (خادم مخصص ودعم 24/7)', cat: 'اشتراك سنوي', price: '120.00 د.أ / شهر', badge: 'حلول مخصصة', icon: '🏢' },
        { name: 'ربط واجهات الـ API المفتوحة والويب هوك المخصصة', cat: 'تكاملات API', price: 'مشمول بالباقة', badge: 'توثيق تقني كامل', icon: '⚡' },
      ],
      features: ['تسجيل فوري وتشغيل مساحة العمل في 30 ثانية', 'تجديد اشتراك آلي بالفواتير الشهرية والسنوية', 'تحليلات استخدام تفصيلية مع تقارير أداء دورية', 'دعم فني مباشر وتكامل مع Slack و WhatsApp']
    },
    dashboard: {
      kpis: [
        { label: 'الإيراد الشهري المتكرر (MRR)', val: '14,200 د.أ', trend: '+32% هذا الشهر' },
        { label: 'الشركات المشتركة النشطة', val: '280 شركة', trend: 'مشتركة' },
        { label: 'معدل إلغاء الاشتراكات (Churn)', val: '1.2%', trend: 'منخفض جداً وممتاز' },
        { label: 'استدعاءات الـ API اليومية', val: '1.8M طلب', trend: 'سرعة <35ms' }
      ],
      ordersTable: [
        { id: '#SUB-9941', customer: 'شركة الأفق للاستشارات', item: 'ترقية إلى باقة Pro السنوية', amount: '490.00 د.أ', status: 'اشتراك مفعل ومجدد آلياً', statusClass: 'statusDone', time: 'منذ ساعتين' },
        { id: '#SUB-9940', customer: 'مكتب الرائد للتدقيق', item: 'تسجيل جديد: باقة الأعمال الأساسية', amount: '19.00 د.أ', status: 'تجربة مجانية نشطة', statusClass: 'statusPaid', time: 'اليوم' }
      ],
      erpModules: ['لوحة تحكم إدارة المشتركين والمستأجرين Multi-Tenant', 'إدارة بوابات الدفع والتجديدات التلقائية وفواتير الـ VAT', 'إدارة مفاتيح الـ API والصلاحيات والـ Rate Limiting', 'مراقبة أداء السيرفرات والأخطاء الحية (Sentry & Datadog)']
    },
    database: {
      engine: 'PostgreSQL 16 Multi-Tenant with Row-Level Security (RLS) + Redis',
      tables: [
        { name: 'tenants', fields: ['tenant_id (PK)', 'company_name', 'subdomain_slug', 'subscription_plan', 'stripe_customer_id', 'is_active'] },
        { name: 'subscriptions', fields: ['sub_id (PK)', 'tenant_id (FK)', 'plan_tier', 'current_period_end', 'billing_interval', 'status'] },
        { name: 'api_keys', fields: ['key_id (PK)', 'tenant_id (FK)', 'hashed_secret', 'permissions_json', 'last_used_at'] }
      ],
      cloudSetup: 'Kubernetes Cluster on Azure AKS with Auto-Scale, Managed PostgreSQL Flexible with Multi-Tenant RLS, Global Redis Cache.'
    }
  },
  {
    id: 22,
    cat: 'health',
    title: 'العيادات البيطرية، مراكز رعاية الحيوانات الأليفة، ومتاجر المستلزمات',
    industry: '🐾 عيادات بيطرية ورعاية أليفة',
    desc: 'منصة حجز المواعيد البيطرية، سجل التطعيمات وجواز السفر الطبي للحيوانات الأليفة، متجر الأغذية، وخدمات العناية والتنظيف.',
    image: '/portfolio/grocery.jpg',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Pet Passport', 'Storefront POS'],
    badge: 'Veterinary & Pet Care Portal',
    storefront: {
      heroTitle: 'رعاية صحية بيطرية فائقة الاهتمام لحيوانك الأليف',
      heroSubtitle: 'كشف بيطري، تطعيمات معتمدة، جواز سفر رقمي، وجلسات عناية ونظافة مع أفضل الأطباء البيطريين',
      sampleProducts: [
        { name: 'كشف بيطري شامل وفحص سريري مع طبيب مختص', cat: 'عيادة بيطرية', price: '15.00 د.أ', badge: 'فحص دقيق', icon: '🩺' },
        { name: 'باقة التطعيمات السنوية الشاملة مع الجواز الصحي', cat: 'تطعيمات ووقاية', price: '35.00 د.أ', badge: 'لقاحات معتمدة', icon: '💉' },
        { name: 'جلسة تنظيف وقص شعر وتقليم أظافر كاملة (Grooming)', cat: 'عناية ونظافة', price: '20.00 د.أ', badge: 'دلال واسترخاء', icon: '✂️' },
        { name: 'غذاء صحي مجفف بريميوم للقطط والكلاب (5 كغم)', cat: 'أغذية ومكملات', price: '22.00 د.أ', badge: 'أصلي وغني بالفيتامين', icon: '🍖' },
      ],
      features: ['جواز سفر وسجل تطعيمات رقمي متاح دائماً على هاتفك', 'تذكير بمواعيد اللقاحات الدورية عبر رسائل الواتساب', 'حجز مواعيد العناية بالحيوان الأليف أونلاين', 'توصيل الأغذية والمستلزمات لباب بيتك']
    },
    dashboard: {
      kpis: [
        { label: 'الحالات المعاينة اليوم', val: '22 أليف', trend: 'في العيادة' },
        { label: 'التطعيمات المنجزة', val: '14 لقاح', trend: 'موثقة بالجواز' },
        { label: 'مبيعات المتجر البيطري', val: '860 د.أ', trend: '+18%' },
        { label: 'جلسات الـ Grooming', val: '9 حيوانات', trend: 'مكتملة' }
      ],
      ordersTable: [
        { id: '#VET-302', customer: 'سارة المصري (القط ميمو)', item: 'تطعيم سنوي + فحص شامل', amount: '35.00 د.أ', status: 'تم الفحص وتحديث الجواز الطبي', statusClass: 'statusDone', time: 'اليوم 11:00' },
        { id: '#VET-301', customer: 'أحمد شاهين (الكلب ريكس)', item: 'جلسة Grooming وتنظيف أظافر', amount: '20.00 د.أ', status: 'في غرفة العناية والتنظيف', statusClass: 'statusProcess', time: 'اليوم 10:00' }
      ],
      erpModules: ['سجل التاريخ الطبي واللقاحات للحيوانات الأليفة', 'إدارة مخزون الأدوية والأغذية البيطرية', 'جدولة مواعيد العمليات والعناية اليومية', 'إصدار الفواتير والشهادات الصحية المعتمدة للسفر']
    },
    database: {
      engine: 'PostgreSQL 16 + AWS S3 for Medical Passports',
      tables: [
        { name: 'pets_registry', fields: ['pet_id (PK)', 'owner_name', 'species_breed', 'microchip_no', 'birth_date', 'medical_notes'] },
        { name: 'vaccine_logs', fields: ['log_id (PK)', 'pet_id (FK)', 'vaccine_name', 'batch_no', 'administered_date', 'next_due_date'] },
        { name: 'vet_appointments', fields: ['app_id (PK)', 'pet_id (FK)', 'vet_doctor_id', 'service_type', 'cost_jod', 'status'] }
      ],
      cloudSetup: 'Azure Container Apps with PostgreSQL Flexible Server, S3 Bucket for High-Res Pet Health Passports.'
    }
  }
];

const PORT_CATS = [
  { id: 'all', label: 'جميع القطاعات والتخصصات (22+ مجال)', icon: Package },
  { id: 'ecommerce', label: 'متاجر إلكترونية وتجارة فاخرة', icon: ShoppingBag },
  { id: 'food', label: 'مطاعم، كافيهات ومطابخ', icon: Utensils },
  { id: 'health', label: 'مستشفيات، عيادات وصيدليات', icon: Heart },
  { id: 'realestate', label: 'عقارات، مقاولات وديكور', icon: Home },
  { id: 'education', label: 'أكاديميات ومنصات LMS', icon: GraduationCap },
  { id: 'automotive', label: 'معارض، تأجير وصيانة السيارات', icon: Car },
  { id: 'hospitality', label: 'فنادق، منتجعات وسياحة', icon: Globe2 },
  { id: 'services', label: 'محاماة، شركات وفعاليات', icon: Briefcase },
  { id: 'industrial', label: 'مصانع، شحن ولوجستيات', icon: Truck },
  { id: 'lifestyle', label: 'نوادي رياضية، صالونات وسبا', icon: Scissors },
  { id: 'saas', label: 'منصات سحابية وتطبيقات SaaS', icon: Smartphone },
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
    name: 'سلطان العدوان',
    role: 'المؤسس والمدير التنفيذي — دار زهرة بيسان الفاخرة',
    avatar: '👑',
    stars: 5,
    text: 'فريق زهرة بيسان تك نقل تجارتنا إلى مستوى عالمي. المنصة فائقة السرعة، ولوحة تحكم الـ ERP أدارت فروعنا ومخزوننا وفواتيرنا بكل دقة وسلاسة.'
  },
  {
    name: 'د. طارق المجالي',
    role: 'المدير الطبي — مراكز النخبة التخصصية',
    avatar: '🏥',
    stars: 5,
    text: 'المنظومة الطبية التي صمموها لنا وفرت أكثر من 70% من وقت تنظيم المواعيد، وتذكيرات الواتساب قضت تماماً على تغيب المرضى.'
  },
  {
    name: 'المهندس رائد النابلسي',
    role: 'الرئيس التنفيذي — الأفق للتطوير العقاري',
    avatar: '🏡',
    stars: 5,
    text: 'الجولات الافتراضية 360° ونظام إدارة العملاء CRM ساعدنا في إغلاق صفقات بيع فلل وشقق بقيمة تجاوزت 2 مليون دينار خلال أشهر قليلة.'
  }
];

/* ─── FAQS ──────────────────────────────────────────── */
const FAQS = [
  {
    q: 'كم يستغرق تسليم المتجر أو النظام الإلكتروني بالكامل؟',
    a: 'المتاجر والمواقع التعريفية الاحترافية تستغرق عادة من 7 إلى 14 يوم عمل. أما الأنظمة السحابية الكبرى والـ ERP المخصص فتستغرق من 3 إلى 5 أسابيع حسب حجم الميزات المطلوبة.'
  },
  {
    q: 'هل أحصل على ملكية الكود المصدري وقواعد البيانات كاملة؟',
    a: 'نعم 100%. عند اكتمال المشروع وتسليمه، نسلمك الكود المصدري بالكامل، حسابات الاستضافة والسيرفرات، وقواعد البيانات لتكون ملكاً خالصاً لشركتك دون أي قيود.'
  },
  {
    q: 'هل تقدمون دعماً فنياً وضماناً بعد التسليم؟',
    a: 'نقدم ضماناً شاملاً مجانياً لمدة 12 شهراً ضد أي أخطاء برمجية، مع دعم فني وصيانة سحابية وتحديثات أمان مستمرة لضمان عمل مشروعك بأعلى كفاءة.'
  },
  {
    q: 'هل يمكن ربط بوابات الدفع الأردنية (كليك) والخليجية (تمارا وتابي)؟',
    a: 'نعم، نربط جميع بوابات الدفع المحلية في الأردن (كليك CliQ، فيزا وماستركارد، المحافظ الإلكترونية)، وبوابات التقسيط الخليجية (تمارا وتابي)، إضافة لـ Apple Pay و Google Pay.'
  }
];

function FaqItem({ q, a }) {
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

/* ─── INTERACTIVE SYSTEM DEMO MODAL ─────────────────── */
function InteractiveSystemModal({ project, onClose, onOrderSimilar }) {
  const [activeTab, setActiveTab] = useState('storefront');
  const [demoActionToast, setDemoActionToast] = useState('');

  if (!project) return null;

  const triggerToast = (msg) => {
    setDemoActionToast(msg);
    setTimeout(() => setDemoActionToast(''), 3500);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalWindow} onClick={e => e.stopPropagation()} dir="rtl">
        {/* Top Mac/iPad Bar */}
        <div className={styles.modalTopBar}>
          <div className={styles.modalMacDots}>
            <span className={styles.macDot} style={{ background: '#ff5f56' }} />
            <span className={styles.macDot} style={{ background: '#ffbd2e' }} />
            <span className={styles.macDot} style={{ background: '#27c93f' }} />
          </div>
          <div className={styles.modalTopTitle}>
            <span>{project.industry.split(' ')[0]}</span>
            <h3>{project.title}</h3>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className={styles.modalTabsBar}>
          <button
            onClick={() => setActiveTab('storefront')}
            className={`${styles.modalTabBtn} ${activeTab === 'storefront' ? styles.modalTabBtnActive : ''}`}
          >
            <Globe2 size={16} /> 🌐 واجهة المتجر / النظام للعملاء
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`${styles.modalTabBtn} ${activeTab === 'dashboard' ? styles.modalTabBtnActive : ''}`}
          >
            <LayoutDashboard size={16} /> 📊 لوحة تحكم الإدارة والـ ERP الحية
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`${styles.modalTabBtn} ${activeTab === 'database' ? styles.modalTabBtnActive : ''}`}
          >
            <Database size={16} /> 🗄️ بنية قواعد البيانات والسيرفرات
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className={styles.modalContentArea}>
          {demoActionToast && (
            <div style={{
              background: 'linear-gradient(135deg, #1a1510, #2b2520)',
              color: '#f3ebd9',
              padding: '12px 20px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontSize: '0.9rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #b8943a',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <span>✨ {demoActionToast}</span>
              <span style={{ fontSize: '0.75rem', color: '#c5a880' }}>معاينة تفاعلية حية</span>
            </div>
          )}

          {/* ── TAB 1: STOREFRONT PREVIEW ── */}
          {activeTab === 'storefront' && (
            <div>
              <div className={styles.demoStoreHeader}>
                <div className={styles.demoStoreInfo}>
                  <h4>{project.storefront.heroTitle}</h4>
                  <p>{project.storefront.heroSubtitle}</p>
                </div>
                <div style={{ background: 'rgba(184, 148, 58, 0.2)', border: '1px solid #b8943a', padding: '8px 16px', borderRadius: '20px', color: '#f3ebd9', fontSize: '0.8rem', fontWeight: 800 }}>
                  ✓ واجهة تفاعلية متجاوبة
                </div>
              </div>

              <div style={{ marginBottom: '14px', fontWeight: 800, color: '#111111', fontSize: '1.05rem' }}>
                🛍️ نماذج المنتجات والخدمات المعروضة في النظام:
              </div>

              <div className={styles.demoProductsGrid}>
                {project.storefront.sampleProducts.map((prod, idx) => (
                  <div key={idx} className={styles.demoProductCard}>
                    <div>
                      <div className={styles.demoCardHeader}>
                        <div className={styles.demoCardIcon}>{prod.icon}</div>
                        <span className={styles.demoCardBadge}>{prod.badge}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#777777', fontWeight: 700, marginBottom: '4px' }}>{prod.cat}</div>
                      <h5 className={styles.demoCardTitle}>{prod.name}</h5>
                    </div>
                    <div>
                      <div className={styles.demoCardPrice}>{prod.price}</div>
                      <button
                        className={styles.demoActionBtn}
                        onClick={() => triggerToast(`تمت تجربة طلب: "${prod.name}" بنجاح في النسخة التجريبية!`)}
                      >
                        <ShoppingBag size={14} /> تجربة إضافة للطلب
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e8e2d5', borderRadius: '18px', padding: '20px', marginTop: '20px' }}>
                <div style={{ fontWeight: 800, color: '#111111', marginBottom: '12px', fontSize: '0.95rem' }}>
                  💎 أبرز ميزات واجهة العميل في هذا النظام:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  {project.storefront.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#333333', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="#b8943a" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: ADMIN ERP DASHBOARD PREVIEW ── */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 900, color: '#111111' }}>
                    لوحة تحكم وإحصائيات العمليات الحية (Live ERP Portal)
                  </h4>
                  <p style={{ margin: 0, color: '#666666', fontSize: '0.85rem' }}>
                    متابعة العمليات، الفواتير الضريبية، المخزون، والتقارير المالية لحظة بلحظة.
                  </p>
                </div>
                <button
                  onClick={() => triggerToast('جاري طباعة الفاتورة الضريبية التجريبية QR بنجاح...')}
                  style={{ background: '#111111', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Receipt size={14} /> طباعة فاتورة ضريبية QR
                </button>
              </div>

              {/* KPI Cards */}
              <div className={styles.demoKpiGrid}>
                {project.dashboard.kpis.map((kpi, idx) => (
                  <div key={idx} className={styles.demoKpiCard}>
                    <div className={styles.demoKpiLabel}>{kpi.label}</div>
                    <div className={styles.demoKpiVal}>{kpi.val}</div>
                    <div className={styles.demoKpiTrend}>
                      <Zap size={12} /> {kpi.trend}
                    </div>
                  </div>
                ))}
              </div>

              {/* Real-time Orders Table */}
              <div className={styles.demoTableWrap}>
                <div className={styles.demoTableHead}>
                  <h5>سجل الطلبات والعمليات الأخيرة المباشرة</h5>
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    تحديث حي متصل بالسيرفر
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.demoTable}>
                    <thead>
                      <tr>
                        <th>رقم العملية</th>
                        <th>اسم العميل / المستفيد</th>
                        <th>تفاصيل الطلب أو الخدمة</th>
                        <th>القيمة</th>
                        <th>الحالة</th>
                        <th>الوقت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.dashboard.ordersTable.map((ord, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#b8943a' }}>{ord.id}</td>
                          <td>{ord.customer}</td>
                          <td>{ord.item}</td>
                          <td style={{ fontWeight: 800 }}>{ord.amount}</td>
                          <td>
                            <span className={`${styles.demoStatusPill} ${styles[ord.statusClass]}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td style={{ color: '#777777', fontSize: '0.8rem' }}>{ord.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ERP Modules */}
              <div style={{ background: '#ffffff', border: '1px solid #e8e2d5', borderRadius: '18px', padding: '20px' }}>
                <div style={{ fontWeight: 800, color: '#111111', marginBottom: '12px', fontSize: '0.95rem' }}>
                  ⚙️ وحدات منظومة الـ ERP المدمجة في هذا النظام:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                  {project.dashboard.erpModules.map((mod, idx) => (
                    <div key={idx} style={{ background: '#fdfaf4', border: '1px solid #f2e3c6', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', color: '#5c4327', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="#b8943a" />
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: DATABASE ARCHITECTURE VIEW ── */}
          {activeTab === 'database' && (
            <div>
              <div className={styles.dbBanner}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>
                    هندسة قواعد البيانات والبنية التحتية السحابية
                  </h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem' }}>
                    جداول مهيكلة بدقة مع فهارس سريعة (Indexing)، ومزامنة سحابية فائقة الأمان.
                  </p>
                </div>
                <div className={styles.dbEngineBadge}>
                  {project.database.engine}
                </div>
              </div>

              <div style={{ marginBottom: '14px', fontWeight: 800, color: '#111111', fontSize: '1.05rem' }}>
                🗄️ مخطط الجداول والحقول الرئيسية (Database Schema):
              </div>

              <div className={styles.dbTablesGrid}>
                {project.database.tables.map((table, idx) => (
                  <div key={idx} className={styles.dbTableCard}>
                    <div className={styles.dbTableHeader}>
                      <div className={styles.dbTableName}>
                        <Database size={15} color="#3b82f6" style={{ display: 'inline', marginLeft: '6px', verticalAlign: 'middle' }} />
                        {table.name}
                      </div>
                      <span style={{ fontSize: '0.72rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>Table</span>
                    </div>
                    <div>
                      {table.fields.map((field, fIdx) => (
                        <div key={fIdx} className={styles.dbFieldRow}>
                          <span className={styles.dbFieldName}>{field.split(' ')[0]}</span>
                          <span className={styles.dbFieldType}>{field.replace(field.split(' ')[0], '').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '20px' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontSize: '0.95rem' }}>
                  ☁️ مواصفات النشر السحابي والأمان (DevOps & Hosting Architecture):
                </div>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem', lineHeight: '1.7', fontFamily: 'monospace' }}>
                  {project.database.cloudSetup}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className={styles.modalFooterBar}>
          <div className={styles.modalEtaTag}>
            <Clock size={16} color="#b8943a" />
            <span>مدة التنفيذ القياسية: <strong>7 - 14 يوم عمل فقط</strong> (شامل الضمان السنوي)</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onOrderSimilar(project);
            }}
            className={styles.btnGold}
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            <Send size={16} /> اطلب نظاماً مخصصاً لقطاعك الآن
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PORTFOLIO CARD COMPONENT ──────────────────────── */
function PortfolioCard({ p, onSelect }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={styles.portCard} onClick={() => onSelect(p)}>
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

      {/* Interactive Hover Pill */}
      <div className={styles.portCardHoverHint}>
        <Sparkles size={15} color="#b8943a" />
        <span>اضغط لمعاينة المتجر، الداش بورد والـ Database</span>
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
  const [selectedProject, setSelectedProject] = useState(null);

  // New Interactive States
  const [pricingCycle, setPricingCycle] = useState('annual'); // 'annual' | 'monthly'
  const [selectedService, setSelectedService] = useState(null); // Deep Dive Modal
  const [consultModalOpen, setConsultModalOpen] = useState(false); // Free Consultation Modal
  const [consultData, setConsultData] = useState({
    name: '',
    phone: '',
    company: '',
    industry: '👗 أزياء وتجارة إلكترونية',
    preferredTime: 'مساءً (04:00 - 08:00)',
    meetingType: 'zoom', // 'zoom' | 'phone' | 'office'
    notes: ''
  });
  const [isConsultSubmitting, setIsConsultSubmitting] = useState(false);
  const [consultSubmitted, setConsultSubmitted] = useState(false);

  // Tech AI Floating Assistant State
  const [techAiOpen, setTechAiOpen] = useState(false);
  const [techAiInputText, setTechAiInputText] = useState('');
  const [techAiMsgs, setTechAiMsgs] = useState([
    {
      id: 1,
      role: 'ai',
      text: 'أهلاً بك في زهرة بيسان للحلول الرقمية وتكنولوجيا المعلومات! 💻✨ أنا مستشارك التقني الذكي، كيف يمكنني مساعدتك في مشروعك اليوم؟'
    }
  ]);

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

  const handleOrderSimilar = (proj) => {
    setFormData(prev => ({
      ...prev,
      service: `نظام مخصص لقطاع: ${proj.industry}`,
      details: `أرغب بنظام متكامل مشابه لمشروع "${proj.title}" يشمل واجهة العملاء ولوحة تحكم ERP وقاعدة بيانات سريعة.`
    }));
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPricingPlan = (plan) => {
    setFormData(prev => ({
      ...prev,
      service: `طلب اشتراك: ${plan.name} (${pricingCycle === 'annual' ? 'اشتراك سنوي مع خصم' : 'اشتراك شهري'})`,
      budget: `${plan.setupFee} + ${pricingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice} د.أ/شهر`,
      details: `أود التعاقد والبدء فوراً على ${plan.name}. المواصفات: ${plan.features.slice(0, 3).join('، ')}.`
    }));
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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

  const handleConsultSubmit = async e => {
    e.preventDefault();
    if (!consultData.name || !consultData.phone) return;
    setIsConsultSubmitting(true);
    try {
      await axios.post('/api/tech/lead', {
        name: consultData.name,
        phone: consultData.phone,
        company: consultData.company || 'غير محدد',
        service: 'حجز استشارة هندسية مجانية 📅',
        budget: 'استشارة مجانية 30 دقيقة',
        details: `المجال: ${consultData.industry} | الموعد المفضل: ${consultData.preferredTime} | وسيلة الاجتماع: ${consultData.meetingType} | ملاحظات: ${consultData.notes || 'لا يوجد'}`
      });
    } catch (_) {}
    setConsultSubmitted(true);
    setIsConsultSubmitting(false);
  };

  const openWhatsApp = (customMsg = null) => {
    const txt = encodeURIComponent(
      customMsg ||
      `مرحباً زهرة بيسان للتكنولوجيا والبرمجيات 💻✨\nأود الاستفسار عن خدمة: ${formData.service}\nالاسم: ${formData.name || 'عميل مهتم'}\nالميزانية المقدرة: ${formData.budget || 'غير محدد'}\nالتفاصيل: ${formData.details || 'طلب استشارة وتحديد موعد لمشروعي'}`
    );
    window.open(`https://wa.me/962796697413?text=${txt}`, '_blank');
  };

  const handleAiQuickAsk = (q, reply) => {
    setTechAiMsgs(prev => [
      ...prev,
      { id: Date.now(), role: 'user', text: q },
      { id: Date.now() + 1, role: 'ai', text: reply }
    ]);
  };

  const handleAiCustomSubmit = (e) => {
    e.preventDefault();
    const query = techAiInputText.trim();
    if (!query) return;

    const userMsg = { id: Date.now(), role: 'user', text: query };
    setTechAiMsgs(prev => [...prev, userMsg]);
    setTechAiInputText('');

    const lower = query.toLowerCase();
    let reply = 'يسعدنا خدمتك! فريقنا الهندسي في زهرة بيسان للحلول الرقمية جاهز لتنفيذ كل متطلبات مشروعك بأعلى معايير السرعة والأمان. يمكنك حجز استشارة مجانية أو التحدث مباشرة مع مهندس عبر الواتساب.';

    if (lower.includes('سعر') || lower.includes('تكلفة') || lower.includes('بكم') || lower.includes('كم')) {
      reply = 'تبدأ باقاتنا من 490 دينار للمتاجر السريعة، وتصل إلى 890 دينار للمنظومات المتكاملة مع تطبيقات الموبايل، و1,650 دينار للأنظمة المخصصة ERP مع تسليم الكود كاملاً 100%! تشمل كل باقة الاستضافة والدومين والضمان لسنة.';
    } else if (lower.includes('تطبيق') || lower.includes('موبايل') || lower.includes('ios') || lower.includes('android') || lower.includes('فلاتر')) {
      reply = 'نبرمج تطبيقات الهواتف بأحدث إصدارات Flutter & Dart لتعمل بسلاسة فائقة على iOS (App Store) و Android مع إشعارات Push وتكامل الدفع الإلكتروني بلمسة الإصبع!';
    } else if (lower.includes('erp') || lower.includes('مخزن') || lower.includes('مخازن') || lower.includes('محاسبة') || lower.includes('فاتورة') || lower.includes('ضريبة')) {
      reply = 'أنظمة الـ ERP الخاصة بنا تشمل الفواتير الإلكترونية المعتمدة برمز QR، إدارة المستودعات المتعددة، تقارير الأرباح والخسائر، وتتبع المناديب وساعات عمل الموظفين بدقة متناهية.';
    } else if (lower.includes('استضافة') || lower.includes('سيرفر') || lower.includes('azure') || lower.includes('سحابة')) {
      reply = 'نستضيف منظوماتنا على سحابة Microsoft Azure و Amazon AWS مع حماية سيبرانية WAF ضد الهجمات، ونسخ احتياطي يومي مشفر وضمان عمل 99.99%!';
    } else if (lower.includes('وقت') || lower.includes('مدة') || lower.includes('ايام') || lower.includes('تسليم')) {
      reply = 'مدة التسليم القياسية تتراوح بين 7 إلى 14 يوم عمل، مع إمكانية التسليم المستعجل خلال 5 إلى 7 أيام فقط.';
    } else if (/\d{8,}/.test(query)) {
      // User sent phone number
      axios.post('/api/tech/lead', {
        name: 'عميل من محادثة الـ AI',
        phone: query,
        service: 'استفسار من الشات بوت الذكي',
        details: `محادثة الـ AI: ${query}`
      }).catch(() => {});
      reply = 'شكراً لك! تم استلام رقم هاتفك بنجاح 🚀 سيتواصل معك أحد مهندسينا خلال أقل من 15 دقيقة لتزويدك بالتفاصيل وعرض السعر المخصص.';
    }

    setTimeout(() => {
      setTechAiMsgs(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: reply }]);
    }, 400);
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
            <a href="#portfolio">المشاريع (22+)</a>
            <a href="#pricing">الباقات والأسعار</a>
            <a href="#admin-erp">لوحة ERP</a>
            <a href="#hosting">السيرفرات والدومين</a>
            <a href="#calculator">حاسبة الأسعار</a>
            <button
              onClick={() => setConsultModalOpen(true)}
              className={styles.navCta}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              احجز استشارة مجانية 📅
            </button>
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
        </div>

        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <Sparkles size={16} />
              <span>وكالة هندسية برمجية وسحابية معتمدة</span>
            </div>

            <h1 className={styles.heroTitle}>
              نبني منظومات ومتاجر رقمية فاخرة
              <br />
              <span className={styles.heroGold}>لكافة القطاعات والتخصصات التجارية</span>
            </h1>

            <p className={styles.heroDesc}>
              حلول برمجية متكاملة ترفع مبيعاتك وتؤتمت عملياتك: متاجر إلكترونية، تطبيقات جوال (iOS & Android)، أنظمة ERP سحابية، وبنية تحتية موثوقة على Microsoft Azure و AWS.
            </p>

            <div className={styles.heroButtons}>
              <a href="#portfolio" className={styles.btnGold}>
                <Eye size={20} /> استعرض النماذج الحية (22+ تخصص)
              </a>
              <button
                onClick={() => setConsultModalOpen(true)}
                className={styles.btnGold}
                style={{ background: '#111111', color: '#ffffff', border: '1px solid #b8943a' }}
              >
                <Calendar size={18} /> احجز استشارة مجانية (30 دقيقة)
              </button>
              <button onClick={() => openWhatsApp()} className={styles.btnWa}>
                <MessageCircle size={20} /> استشارة فورية عبر الواتساب
              </button>
            </div>

            {/* Floating Live Showcase Cards */}
            <div className={styles.heroStatsWrap}>
              <div className={styles.statsStrip}>
                <div className={styles.statItem}>
                  <div className={styles.statVal}>+120</div>
                  <div className={styles.statLabel}>مشروع ومنظومة منجزة</div>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <div className={styles.statVal}>22+</div>
                  <div className={styles.statLabel}>قطاع وتخصص تجاري</div>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <div className={styles.statVal}>99.9%</div>
                  <div className={styles.statLabel}>ضمان تشغيل سحابي (SLA)</div>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <div className={styles.statVal}>100%</div>
                  <div className={styles.statLabel}>تسليم الكود وقواعد البيانات</div>
                </div>
              </div>
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
              اضغط على أي خدمة لاستعراض المواصفات التقنية الكاملة، مراحل العمل، والمخرجات الهندسية.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className={styles.serviceCard}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedService(s)}
                >
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedService(s);
                    }}
                    className={styles.pricingBtn}
                    style={{ marginTop: '16px', padding: '8px 12px', fontSize: '0.82rem' }}
                  >
                    استكشف المواصفات والمخرجات ←
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING PLANS SECTION ───────────────── */}
      <section className={styles.pricingSection} id="pricing">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>باقات استثمارية واضحة وشاملة</span>
            <h2 className={styles.sectionTitle}>اختر الباقة الأنسب لانطلاق وتوسع مشروعك</h2>
            <p className={styles.sectionDesc}>
              خطط تسعير شفافة تشمل التصميم، البرمجة الكاملة، ربط بوابات الدفع، الاستضافة السحابية مع تسليم الكود 100%.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className={styles.pricingToggleWrap}>
            <div className={styles.pricingToggle}>
              <button
                type="button"
                onClick={() => setPricingCycle('annual')}
                className={`${styles.pricingToggleBtn} ${pricingCycle === 'annual' ? styles.pricingToggleBtnActive : ''}`}
              >
                اشتراك سنوي (وفر 20%) 🌟
              </button>
              <button
                type="button"
                onClick={() => setPricingCycle('monthly')}
                className={`${styles.pricingToggleBtn} ${pricingCycle === 'monthly' ? styles.pricingToggleBtnActive : ''}`}
              >
                اشتراك شهري
              </button>
            </div>
            {pricingCycle === 'annual' && (
              <span className={styles.discountPill}>🔥 خصم 20% مفعّل</span>
            )}
          </div>

          {/* Pricing Cards Grid */}
          <div className={styles.pricingGrid}>
            {PRICING_PLANS.map((plan) => {
              const price = pricingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`${styles.pricingCard} ${plan.featured ? styles.pricingCardFeatured : ''}`}
                >
                  {plan.featured && (
                    <div className={styles.pricingBadge}>
                      <Star size={14} fill="#fff" /> {plan.badge}
                    </div>
                  )}
                  <h3 className={styles.pricingTitle}>{plan.name}</h3>
                  <p className={styles.pricingDesc}>{plan.desc}</p>

                  <div className={styles.pricingPriceWrap}>
                    <span className={styles.pricingCurrency}>د.أ</span>
                    <span className={styles.pricingAmount}>{price}</span>
                    <span className={styles.pricingPeriod}>/ شهرياً</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: '20px', fontWeight: 600 }}>
                    ⚡ رسوم التجهيز والبرمجة والتسليم: <strong>{plan.setupFee}</strong>
                  </div>

                  <ul className={styles.pricingFeatures}>
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} className={styles.pricingFeatureItem}>
                        <CheckCircle2 size={18} color="#10b981" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPricingPlan(plan)}
                    className={`${styles.pricingBtn} ${plan.featured ? styles.pricingBtnFeatured : ''}`}
                  >
                    طلب هذه الباقة والبدء فوراً ←
                  </button>
                </div>
              );
            })}
          </div>

          {/* SLA Hosting Care Banner */}
          <div style={{
            marginTop: '40px',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '1px solid #e8e2d5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(184, 148, 58, 0.12)', color: '#b8943a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#111111' }}>هل لديك مشروع قائم وتريد صيانة سحابية ودعماً برمجياً شهرياً؟</strong>
                <p style={{ fontSize: '0.88rem', color: '#666666', margin: 0 }}>نوفر باقات دعم فني، حماية سيبرانية، وترقيات مستمرة تبدأ من 65 د.أ / شهرياً.</p>
              </div>
            </div>
            <button
              onClick={() => openWhatsApp('مرحباً، أود الاستفسار عن باقة الدعم الفني والصيانة السحابية الشهرية...')}
              className={styles.btnGold}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              استفسر عن باقات الصيانة
            </button>
          </div>

        </div>
      </section>

      {/* ── ALL-INDUSTRIES PORTFOLIO (22+ SECTORS) ── */}
      <section className={styles.portfolioSection} id="portfolio">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>معرض الأعمال والتخصصات (22+ قطاع)</span>
            <h2 className={styles.sectionTitle}>حلول مصممة خصيصاً لكل قطاع ومجال</h2>
            <p className={styles.sectionDesc}>
              اضغط على أي تخصص لاستعراض <strong>واجهة المتجر التفاعلية</strong>، <strong>لوحة تحكم الـ ERP</strong>، و<strong>مخطط الـ Database والسيرفرات</strong>.
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
              <PortfolioCard key={p.id} p={p} onSelect={setSelectedProject} />
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
      <section className={styles.adminSection} id="admin-erp">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>القوة والتحكم الكامل</span>
            <h2 className={styles.sectionTitle}>لوحة تحكم ERP ذكية تدير كل تفاصيل عملك</h2>
            <p className={styles.sectionDesc}>
              كل نظام ومتجر نبنيه يأتي مجهزاً بلوحة تحكم مركزية متقدمة تمنحك السيطرة المطلقة على المبيعات، المخزون، والموظفين.
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

      {/* ── HOSTING & DOMAINS ────────────────── */}
      <section className={styles.hostingSection} id="hosting">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>السيرفرات والبنية السحابية</span>
            <h2 className={styles.sectionTitle}>استضافة سحابية فائقة السرعة مع نطاقات رسمية</h2>
            <p className={styles.sectionDesc}>
              بنية تحتية سحابية في مراكز بيانات متطورة مع أقراص NVMe فائقة السرعة، حماية SSL مجانية، ودعم 24/7.
            </p>
          </div>

          {/* Hosting Plans Grid */}
          <div className={styles.hostingGrid}>
            {HOSTING_PLANS.map((plan, idx) => {
              const Icon = plan.icon;
              return (
                <div
                  key={idx}
                  className={`${styles.hostingCard} ${plan.highlighted ? styles.hostingCardHighlight : ''}`}
                >
                  {plan.highlighted && <div className={styles.hostingBadge}>الخيار الأكثر طلباً ⭐</div>}
                  <div className={styles.hostingIconBox} style={{ color: plan.color }}>
                    <Icon size={28} />
                  </div>
                  <h3 className={styles.hostingName}>{plan.name}</h3>
                  <span className={styles.hostingNameEn}>{plan.nameEn}</span>
                  <div className={styles.hostingPriceBox}>
                    {plan.price !== 'مخصص' ? (
                      <>
                        <span className={styles.hostingPrice}>{plan.price}</span>
                        <span className={styles.hostingCurrency}>د.أ / {plan.period}</span>
                      </>
                    ) : (
                      <span className={styles.hostingPriceCustom}>حسب متطلباتك</span>
                    )}
                  </div>
                  <p className={styles.hostingDesc}>{plan.desc}</p>

                  <div className={styles.hostingFeatures}>
                    {plan.features.map((f, j) => (
                      <div key={j} className={styles.hostingFeatureRow}>
                        <span className={styles.hostingFeatureLabel}>{f.label}</span>
                        <span className={styles.hostingFeatureVal}>{f.value}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href="#contact"
                    className={plan.highlighted ? styles.btnGoldFull : styles.btnOutline}
                  >
                    حجز هذه الخطة الآن
                  </a>
                </div>
              );
            })}
          </div>

          {/* Domain Names Strip */}
          <div className={styles.domainsSection}>
            <div className={styles.domainsHead}>
              <Globe size={24} color="#b8943a" />
              <div>
                <h3>تسجيل وحجز النطاقات الرسمية (Domain Names)</h3>
                <p>احجز اسم علامتك التجارية فوراً قبل أن يحجزه منافسوك بأسعار سنوية رسمية وربط فوري بالسيرفر.</p>
              </div>
            </div>
            <div className={styles.domainGrid}>
              {DOMAINS.map((d, idx) => (
                <div key={idx} className={styles.domainCard}>
                  <div className={styles.domainExt}>{d.ext}</div>
                  <div className={styles.domainPrice}>
                    <span>{d.reg} د.أ</span>
                    <small>/ سنة</small>
                  </div>
                  <p className={styles.domainNote}>{d.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM PARTNERS ───────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>التكامل والشراكات التقنية</span>
            <h2 className={styles.sectionTitle}>نربط نظامك مع أفضل بوابات الدفع والسحابة العالمية</h2>
          </div>

          <div className={styles.partnersGrid}>
            {PARTNERS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className={styles.partnerCard}>
                  <div className={styles.partnerIconBox}>
                    <Icon size={24} color="#b8943a" />
                  </div>
                  <div>
                    <h4 className={styles.partnerName}>{p.name}</h4>
                    <span className={styles.partnerCat}>{p.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROCESS SECTION ─────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>منهجية العمل الهندسية</span>
            <h2 className={styles.sectionTitle}>رحلة تحويل فكرتك إلى منظومة حية في 5 خطوات</h2>
          </div>

          <div className={styles.processGrid}>
            {PROCESS_STEPS.map((s, idx) => (
              <div key={idx} className={styles.processCard}>
                <div className={styles.processNum}>{s.num}</div>
                <h3 className={styles.processTitle}>{s.title}</h3>
                <p className={styles.processDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COST CALCULATOR ──────────────────── */}
      <section className={styles.calcSection} id="calculator">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>الشفافية والتسعير الدقيق</span>
            <h2 className={styles.sectionTitle}>حاسبة تكلفة المشروع التقديرية</h2>
            <p className={styles.sectionDesc}>
              حدد متطلبات مشروعك واحصل على تقدير فوري ومباشر للتكلفة والمدة الزمنية.
            </p>
          </div>

          <div className={styles.calcLayout}>
            <div className={styles.calcForm}>
              {/* Project Type */}
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>نوع المشروع الأساسي</label>
                <div className={styles.calcOptions}>
                  {[
                    { id: 'ecommerce', label: 'متجر إلكتروني فاخر', icon: ShoppingBag },
                    { id: 'mobile', label: 'تطبيق هواتف (iOS & Android)', icon: Smartphone },
                    { id: 'erp', label: 'نظام ERP وإدارة أعمال', icon: Building2 },
                    { id: 'custom', label: 'موقع تعريفي وخدمات خاصة', icon: Globe2 }
                  ].map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setProjectType(opt.id)}
                        className={`${styles.calcBtn} ${projectType === opt.id ? styles.calcBtnActive : ''}`}
                      >
                        <Icon size={18} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Platforms */}
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>المنصات المطلوبة</label>
                <div className={styles.calcOptions}>
                  {[
                    { id: 'web', label: 'موقع ويب متجاوب' },
                    { id: 'ios', label: 'تطبيق iPhone (iOS)' },
                    { id: 'android', label: 'تطبيق Android' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      className={`${styles.calcBtn} ${platforms.includes(p.id) ? styles.calcBtnActive : ''}`}
                    >
                      <Check size={16} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>الميزات الإضافية</label>
                <div className={styles.calcFeatures}>
                  {[
                    { id: 'payments', label: 'بوابات الدفع (كليك، فيزا، تمارا)' },
                    { id: 'admin', label: 'لوحة تحكم ERP وفواتير ضريبية' },
                    { id: 'ai', label: 'شات بوت وذكاء اصطناعي' },
                    { id: 'whatsapp', label: 'إشعارات الواتساب الآلية' },
                    { id: 'multilang', label: 'تعدد اللغات (عربي / إنجليزي)' },
                    { id: 'courier', label: 'تتبع الشحن والمناديب GPS' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFeature(f.id)}
                      className={`${styles.featBtn} ${features.includes(f.id) ? styles.featBtnActive : ''}`}
                    >
                      <CheckCircle2 size={16} />
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className={styles.calcGroup}>
                <label className={styles.calcLabel}>المدة الزمنية للتسليم</label>
                <div className={styles.timelineBtns}>
                  <button
                    type="button"
                    onClick={() => setTimeline('standard')}
                    className={`${styles.timelineBtn} ${timeline === 'standard' ? styles.timelineBtnActive : ''}`}
                  >
                    قياسي (7 - 14 يوم عمل)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeline('express')}
                    className={`${styles.timelineBtn} ${timeline === 'express' ? styles.timelineBtnActive : ''}`}
                  >
                    ⚡ تسليم سريع مستعجل (خلال 5 - 7 أيام)
                  </button>
                </div>
              </div>
            </div>

            {/* Estimate Result Card */}
            <div className={styles.estimateCard}>
              <div className={styles.estimateHead}>
                <Sparkles size={24} color="#b8943a" />
                <h3>التكلفة المقدرة لمشروعك</h3>
              </div>
              <div className={styles.estimatePrice}>
                <span>{est.min} - {est.max}</span>
                <small>دينار أردني (JOD)</small>
              </div>
              <p className={styles.estimateNote}>
                * التقدير يشمل التصميم، البرمجة، ربط بوابات الدفع، الاستضافة السحابية للسنة الأولى، والضمان المجاني لمدة سنة كاملة.
              </p>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, budget: `${est.min} - ${est.max} د.أ` }));
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={styles.btnGoldFull}
              >
                تثبيت هذا التقدير وبدء المشروع ←
              </button>

              <button onClick={() => openWhatsApp()} className={styles.btnWa}>
                <MessageCircle size={18} /> مناقشة العرض عبر الواتساب
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>آراء وثقة شركائنا</span>
            <h2 className={styles.sectionTitle}>ماذا يقول عملاؤنا عن أنظمتنا البرمجية</h2>
          </div>

          <div className={styles.testimGrid}>
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className={`${styles.testimCard} ${activeTestimonial === idx ? styles.testimActive : ''}`}
              >
                <div className={styles.testimStars}>
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} size={16} fill="#b8943a" color="#b8943a" />
                  ))}
                </div>
                <p className={styles.testimText}>"{t.text}"</p>
                <div className={styles.testimAuthor}>
                  <div className={styles.testimAvatar}>{t.avatar}</div>
                  <div>
                    <h4 className={styles.testimName}>{t.name}</h4>
                    <span className={styles.testimRole}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQS ─────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>الأسئلة الشائعة</span>
            <h2 className={styles.sectionTitle}>كل ما تحتاج معرفته قبل بدء مشروعك</h2>
          </div>

          <div className={styles.faqList}>
            {FAQS.map((f, idx) => (
              <FaqItem key={idx} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT & LEAD FORM ──────────────── */}
      <section className={styles.contactSection} id="contact">
        <div className={styles.container}>
          <div className={styles.contactLayout}>
            <div className={styles.contactInfo}>
              <span className={styles.sectionTag}>دعنا نبني نجاحك</span>
              <h2 className={styles.contactTitle}>تحدث مع مهندسينا وابدأ مشروعك اليوم</h2>
              <p className={styles.contactDesc}>
                فريقنا الهندسي جاهز لدراسة فكرتك، تقديم الاستشارة التقنية الأمثل، وتنفيذ مشروعك بأعلى درجات الاحترافية والسرعة.
              </p>

              <div className={styles.contactChannels}>
                <div className={styles.contactItem}>
                  <Phone size={20} color="#b8943a" />
                  <div>
                    <strong>الاتصال المباشر والخط الساخن:</strong>
                    <a href="tel:+962796697413" dir="ltr">+962 79 669 7413</a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <MessageCircle size={20} color="#25D366" />
                  <div>
                    <strong>محادثة الواتساب الرسمية:</strong>
                    <a href="https://wa.me/962796697413" target="_blank" rel="noreferrer" dir="ltr">+962 79 669 7413</a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <Mail size={20} color="#b8943a" />
                  <div>
                    <strong>البريد الإلكتروني المعتمد:</strong>
                    <a href="mailto:zahratbeesanshop@gmail.com">zahratbeesanshop@gmail.com</a>
                  </div>
                </div>
              </div>

              <button onClick={() => openWhatsApp()} className={styles.btnWaLarge}>
                <MessageCircle size={22} /> بدء محادثة واتساب فورية مع المستشار
              </button>
            </div>

            <div className={styles.contactFormWrap}>
              {submitted ? (
                <div className={styles.successBox}>
                  <CheckCircle2 size={56} color="#10b981" />
                  <h3>تم استلام طلب مشروعك بنجاح!</h3>
                  <p>سيقوم أحد مهندسينا بالتواصل معك هاتفياً وعبر الواتساب خلال أقل من 30 دقيقة لمناقشة التفاصيل وخطة العمل.</p>
                  <button onClick={() => openWhatsApp()} className={styles.btnWa}>
                    <MessageCircle size={18} /> متابعة الطلب فوراً على الواتساب
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <h3 className={styles.formTitle}>طلب استشارة وتسليم عرض سعر رسمي</h3>

                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label>الاسم الكريم *</label>
                      <input
                        type="text"
                        required
                        placeholder="اسمك الكامل"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>رقم الهاتف / الواتساب *</label>
                      <input
                        type="tel"
                        required
                        placeholder="079XXXXXXXX"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>البريد الإلكتروني</label>
                      <input
                        type="email"
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
            <a href="#portfolio">المشاريع (22+ مجال)</a>
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

      {/* ── INTERACTIVE DEMO SYSTEM MODAL ─────── */}
      <InteractiveSystemModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOrderSimilar={handleOrderSimilar}
      />

      {/* ── SERVICE DEEP DIVE MODAL ───────────── */}
      {selectedService && (
        <div className={styles.modalOverlay} onClick={() => setSelectedService(null)}>
          <div className={styles.serviceModalWindow} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.serviceModalHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(184, 148, 58, 0.12)',
                  color: selectedService.accent || '#b8943a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {React.createElement(selectedService.icon, { size: 28 })}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111111', margin: 0 }}>
                    {selectedService.title}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#777777', fontWeight: 600 }}>
                    {selectedService.enTitle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.serviceModalBody}>
              {/* Overview */}
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111111', marginBottom: '8px' }}>
                  ✦ نظرة هندسية شاملة على الخدمة:
                </h4>
                <p style={{ fontSize: '0.95rem', color: '#444444', lineHeight: 1.8, margin: 0 }}>
                  {selectedService.deepOverview || selectedService.desc}
                </p>
              </div>

              {/* Deliverables Checklist */}
              {selectedService.deliverables && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111111', marginBottom: '14px' }}>
                    📦 المخرجات والأنظمة التي تستلمها:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {selectedService.deliverables.map((item, dIdx) => (
                      <div key={dIdx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: '#fafaf7',
                        border: '1px solid #e8e2d5',
                        fontSize: '0.88rem',
                        color: '#222222',
                        fontWeight: 600
                      }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {selectedService.techStack && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111111', marginBottom: '14px' }}>
                    ⚡ التقنيات والبنية البرمجية (Tech Stack):
                  </h4>
                  <div className={styles.serviceStackGrid}>
                    {selectedService.techStack.map((tech, tIdx) => (
                      <div key={tIdx} className={styles.serviceStackCard}>
                        <Code2 size={20} color="#b8943a" />
                        <div>
                          <strong>{tech.name}</strong>
                          <span>{tech.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4-Stage Pipeline */}
              {selectedService.pipeline && (
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111111', marginBottom: '14px' }}>
                    🛠️ مراحل التنفيذ الهندسية خطوة بخطوة:
                  </h4>
                  <div className={styles.servicePipelineGrid}>
                    {selectedService.pipeline.map((p, pIdx) => (
                      <div key={pIdx} className={styles.servicePipelineCard}>
                        <div className={styles.servicePipelineNum}>{p.step}</div>
                        <strong style={{ display: 'block', fontSize: '0.92rem', marginBottom: '6px', color: '#111' }}>{p.title}</strong>
                        <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline & Pricing footer */}
              <div style={{
                background: '#fafaf7',
                borderRadius: '18px',
                padding: '20px 24px',
                border: '1px solid #e8e2d5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.82rem', color: '#777' }}>
                    ⏱️ مدة التسليم التقديرية: <strong>{selectedService.timelineEstimate}</strong>
                  </span>
                  <span style={{ display: 'block', fontSize: '0.82rem', color: '#777', marginTop: '4px' }}>
                    💰 التكلفة التقديرية: <strong>{selectedService.priceRange}</strong> (شامل الضمان 12 شهراً)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      const s = selectedService;
                      setSelectedService(null);
                      setFormData(prev => ({
                        ...prev,
                        service: s.title,
                        details: `طلب تنفيذ وتطوير: ${s.title} (${s.enTitle}) مع تسليم كامل للمنظومة.`
                      }));
                      const el = document.getElementById('contact');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={styles.btnGold}
                    style={{ padding: '12px 20px', fontSize: '0.88rem' }}
                  >
                    طلب هذه الخدمة الآن ←
                  </button>

                  <button
                    onClick={() => {
                      const s = selectedService;
                      setSelectedService(null);
                      openWhatsApp(`مرحباً زهرة بيسان للتكنولوجيا 💻✨\nأود الاستفسار عن خدمة: ${s.title} (${s.enTitle})`);
                    }}
                    className={styles.btnWa}
                    style={{ padding: '12px 20px', fontSize: '0.88rem' }}
                  >
                    <MessageCircle size={16} /> واتساب
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── FREE CONSULTATION MODAL ─────────────── */}
      {consultModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setConsultModalOpen(false)}>
          <div className={styles.consultModalWindow} onClick={e => e.stopPropagation()}>
            <div className={styles.consultModalHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={26} color="#b8943a" />
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#111111', margin: 0 }}>
                    حجز استشارة هندسية مجانية (30 دقيقة)
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#666666' }}>
                    جلسة تخطيط تقني مع أحد كبار مهندسي البرمجيات لدراسة مشروعك وتحديد التكلفة
                  </span>
                </div>
              </div>
              <button
                onClick={() => setConsultModalOpen(false)}
                className={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.consultModalBody}>
              {consultSubmitted ? (
                <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111111', marginBottom: '8px' }}>
                    تم تثبيت موعد استشارتك بنجاح! 🎉
                  </h3>
                  <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '24px' }}>
                    سيقوم المهندس المختص بمراسلتك عبر الواتساب والاتصال بك لتأكيد رابط الاجتماع وتجهيز ملف التحليل التقني لمشروعك.
                  </p>
                  <button
                    onClick={() => {
                      setConsultModalOpen(false);
                      openWhatsApp(`مرحباً، قمت بحجز موعد استشارة تقنية باسم: ${consultData.name}`);
                    }}
                    className={styles.btnWa}
                    style={{ margin: '0 auto' }}
                  >
                    <MessageCircle size={18} /> فتح محادثة الواتساب للتأكيد الفوري
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConsultSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className={styles.formField}>
                      <label>الاسم الكامل *</label>
                      <input
                        type="text"
                        required
                        placeholder="اسمك الكريم"
                        value={consultData.name}
                        onChange={e => setConsultData({ ...consultData, name: e.target.value })}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>رقم الهاتف / الواتساب *</label>
                      <input
                        type="tel"
                        required
                        placeholder="079XXXXXXXX"
                        value={consultData.phone}
                        onChange={e => setConsultData({ ...consultData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className={styles.formField}>
                      <label>اسم الشركة أو المشروع</label>
                      <input
                        type="text"
                        placeholder="اختياري"
                        value={consultData.company}
                        onChange={e => setConsultData({ ...consultData, company: e.target.value })}
                      />
                    </div>

                    <div className={styles.formField}>
                      <label>قطاع ونوع المشروع</label>
                      <select
                        value={consultData.industry}
                        onChange={e => setConsultData({ ...consultData, industry: e.target.value })}
                      >
                        <option value="👗 أزياء وتجارة إلكترونية">👗 أزياء وتجارة إلكترونية</option>
                        <option value="📱 تطبيق هواتف ذكية (iOS/Android)">📱 تطبيق هواتف ذكية (iOS/Android)</option>
                        <option value="🏢 نظام ERP وإدارة شركات">🏢 نظام ERP وإدارة شركات</option>
                        <option value="🤖 حلول ذكاء اصطناعي وأتمتة">🤖 حلول ذكاء اصطناعي وأتمتة</option>
                        <option value="🏥 عيادات ومراكز طبية">🏥 عيادات ومراكز طبية</option>
                        <option value="🍽️ مطاعم وكافيهات وتوصيل">🍽️ مطاعم وكافيهات وتوصيل</option>
                        <option value="🏗️ عقارات ومقاولات">🏗️ عقارات ومقاولات</option>
                        <option value="✨ قطاع آخر">✨ قطاع آخر</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className={styles.formField}>
                      <label>الموعد المفضل للتواصل</label>
                      <select
                        value={consultData.preferredTime}
                        onChange={e => setConsultData({ ...consultData, preferredTime: e.target.value })}
                      >
                        <option value="صباحاً (10:00 - 01:00)">صباحاً (10:00 - 01:00)</option>
                        <option value="ظهراً (01:00 - 04:00)">ظهراً (01:00 - 04:00)</option>
                        <option value="مساءً (04:00 - 08:00)">مساءً (04:00 - 08:00)</option>
                        <option value="أقرب وقت ممكن فوراً">⚡ أقرب وقت ممكن فوراً</option>
                      </select>
                    </div>

                    <div className={styles.formField}>
                      <label>طريقة الاجتماع المفضلة</label>
                      <select
                        value={consultData.meetingType}
                        onChange={e => setConsultData({ ...consultData, meetingType: e.target.value })}
                      >
                        <option value="zoom">🎥 اجتماع فيديو أونلاين (Zoom / Google Meet)</option>
                        <option value="phone">📞 مكالمة هاتفية مباشرة</option>
                        <option value="office">🏢 اجتماع وجاهي في مكتبنا (عمان - الأردن)</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formField}>
                    <label>ملاحظات أو نبذة عن فكرة المشروع</label>
                    <textarea
                      rows={2}
                      placeholder="أخبرنا باختصار عن أهدافك والمتطلبات الرئيسية..."
                      value={consultData.notes}
                      onChange={e => setConsultData({ ...consultData, notes: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isConsultSubmitting}
                    className={styles.btnGoldFull}
                    style={{ marginTop: '6px' }}
                  >
                    {isConsultSubmitting ? 'جاري تثبيت الموعد...' : 'تأكيد حجز الاستشارة المجانية 📅'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING WIDGETS (WHATSAPP & TECH AI) ── */}
      <div className={styles.floatingWidgetsWrap}>
        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/962796697413?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B2%D9%87%D8%B1%D8%A9%20%D8%A8%D9%8A%D8%B3%D8%A7%D9%86%20%D9%84%D9%84%D8%AA%D9%83%D9%86%D9%88%D9%84%D9%88%D8%AC%D9%8A%D8%A7%20%D9%88%D8%A7%D9%84%D8%A8%D8%B1%D9%85%D8%AC%D9%8A%D8%A7%D8%AA%20%F0%9F%92%BB%E2%9C%A8%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%AA%D8%B7%D9%88%D9%8A%D8%B1%20%D9%86%D8%B8%D8%A7%D9%85%20%D9%84%D9%85%D8%B4%D8%B1%D9%88%D8%B9%D9%8A"
          target="_blank"
          rel="noreferrer"
          className={styles.techWaFab}
          title="محادثة واتساب مباشرة مع المستشار التقني"
        >
          <MessageCircle size={30} />
        </a>

        {/* Floating AI Tech Assistant Button */}
        <button
          onClick={() => setTechAiOpen(!techAiOpen)}
          className={styles.techAiFab}
          title="مستشار بيسان تك الذكي AI"
        >
          <Bot size={28} />
        </button>
      </div>

      {/* ── TECH AI CONSULTATION DRAWER ──────── */}
      {techAiOpen && (
        <div className={styles.techAiDrawer}>
          <div className={styles.techAiDrawerHead}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} color="#c5a880" />
              <div>
                <strong style={{ fontSize: '0.92rem' }}>مستشار بيسان تك الذكي</strong>
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#c5a880' }}>استشارات برمجية وحلول فورية ✦</span>
              </div>
            </div>
            <button
              onClick={() => setTechAiOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#f3ebd9', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.techAiDrawerBody}>
            {techAiMsgs.map(m => (
              <div
                key={m.id}
                className={styles.techAiDrawerMsg}
                style={m.role === 'user' ? { background: 'linear-gradient(135deg, #c5a880, #a6865d)', color: '#1a1209', fontWeight: 700, alignSelf: 'flex-start' } : {}}
              >
                {m.text}
              </div>
            ))}

            <div className={styles.techAiChips}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#888888', margin: '4px 0 2px' }}>
                💡 اختر استفساراً سريعاً للإجابة الفورية:
              </span>
              <button
                className={styles.techAiChipBtn}
                onClick={() => handleAiQuickAsk(
                  '💰 كم تكلفة إنشاء متجر إلكتروني متكامل؟',
                  'تبدأ تكلفة المتجر الإلكتروني لدينا من 490 دينار أردني. تشمل التصميم المتجاوب، بوابات الدفع (كليك، فيزا، تمارا)، لوحة تحكم ERP، واستضافة سريعة مع دومين وضمان مجاني لمدة سنة كاملة!'
                )}
              >
                💰 كم تكلفة إنشاء متجر إلكتروني متكامل؟
              </button>

              <button
                className={styles.techAiChipBtn}
                onClick={() => handleAiQuickAsk(
                  '🏢 كيف يفيدني نظام الـ ERP في إدارة مشروعي؟',
                  'نظام الـ ERP يوفر لك إدارة مركزية للمخزون عبر الفروع، إصدار فواتير ضريبية إلكترونية فورية QR، تقارير أرباح وخسائر تنبؤية بالـ AI، وتتبع مناديب التوصيل وساعات عمل الموظفين في شاشة واحدة!'
                )}
              >
                🏢 كيف يفيدني نظام الـ ERP في إدارة مشروعي؟
              </button>

              <button
                className={styles.techAiChipBtn}
                onClick={() => handleAiQuickAsk(
                  '🗄️ ما هي أفضل قاعدة بيانات لمشروعي (SQL أم NoSQL)؟',
                  'يعتمد ذلك على طبيعة عملك! نستخدم PostgreSQL و MySQL للأنظمة المالية والمتاجر لضمان معايير ACID الصارمة والدقة 100%، بينما نستخدم MongoDB و Redis لمنصات التوصيل السريع والـ GPS اللحظي لسرعة قراءة وكتابة فائقة.'
                )}
              >
                🗄️ ما هي أفضل قاعدة بيانات لمشروعي؟
              </button>

              <button
                className={styles.techAiChipBtn}
                onClick={() => handleAiQuickAsk(
                  '🚀 ما هي مدة تسليم المشروع وضمان الكود؟',
                  'مدة التسليم القياسية من 7 إلى 14 يوم عمل. نسلمك الكود المصدري كاملاً 100% مع قواعد البيانات، ونقدم ضماناً شاملاً مجانياً لمدة 12 شهراً مع دعم فني وصيانة سريعة!'
                )}
              >
                🚀 ما هي مدة تسليم المشروع وضمان الكود؟
              </button>
            </div>
          </div>

          {/* AI Custom Question Input */}
          <form onSubmit={handleAiCustomSubmit} className={styles.techAiInputArea}>
            <input
              type="text"
              className={styles.techAiChatInput}
              placeholder="اكتب سؤالك التقني أو رقمك هنا..."
              value={techAiInputText}
              onChange={e => setTechAiInputText(e.target.value)}
            />
            <button type="submit" className={styles.techAiSendBtn} title="إرسال">
              <Send size={16} />
            </button>
          </form>

          <div style={{ padding: '10px 14px', background: '#ffffff', borderTop: '1px solid #e8e2d5' }}>
            <button
              onClick={() => {
                setTechAiOpen(false);
                openWhatsApp('مرحباً، أود استشارة مهندس برمجيات بخصوص مشروعي التقني...');
              }}
              className={styles.btnWa}
              style={{ padding: '8px 12px', fontSize: '0.82rem', width: '100%', justifyContent: 'center' }}
            >
              <MessageCircle size={15} /> التحدث مع مهندس برمجيات بشري
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
