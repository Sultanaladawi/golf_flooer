import React from 'react';
import { X, ShieldCheck, RefreshCw, Crown, Truck, PhoneCall, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PolicyModal({ type, isOpen, onClose }) {
  if (!isOpen || !type) return null;

  const contentMap = {
    privacy: {
      title: 'سياسة الاستخدام والخصوصية الملكية',
      subtitle: 'حماية بياناتكِ وخصوصيتكِ هي أولويتنا المطلقة في دار زهرة بيسان',
      icon: <ShieldCheck size={28} color="var(--gold)" />,
      badge: 'سرية وتشفير تام 100%',
      sections: [
        {
          heading: '1. حماية وتشفير البيانات الشخصية',
          text: 'نحن في دار زهرة بيسان نلتزم بأقصى درجات السرية والخصوصية. جميع البيانات التي تدمجينها (الاسم، العنوان، رقم الهاتف، والبريد الإلكتروني) تُشفر باستخدام أحدث بروتوكولات الأمان الإلكتروني ولا يتم مشاركتها أو بيعها مطلقاً لأي طرف ثالث.'
        },
        {
          heading: '2. أمان المعاملات المالية والدفع',
          text: 'جميع المعاملات المالية البنكية أو بطاقات الائتمان تتم عبر بوابات دفع مخصصة ومعتمدة عالمياً بدعم التشفير التام (SSL 256-bit). لا يقوم متجرنا بتخزين أرقام البطاقات البنكية الخاصة بكِ في أي مرحلة من مراحل الدفع.'
        },
        {
          heading: '3. استخدام خيارات التواصل والحساب',
          text: 'نستخدم معلومات التواصل المباشرة (مثل رقم الواتساب والهاتف) حائرياً لإبلاغكِ بتحديثات حالة الطلب، مواعيد التوصيل مع شركة الشحن، أو تقديم خدمة الاستشارات الخاصة بالتصميم والمقاسات.'
        },
        {
          heading: '4. الملكية الفكرية وحقوق التصاميم',
          text: 'جميع تصاميم العبايات، الصور الفاخرة، الفيديوهات الحصرية، والشعار الرسمي هي ملكية فكرية وحصرية لدار "زهرة بيسان". يمنع منعاً باتاً استخدامها أو إعادة نشرها لأغراض تجارية دون إذن كتابي مسبق.'
        }
      ]
    },
    returns: {
      title: 'سياسة التجربة والتبديل والترجيع',
      subtitle: 'معاينة وقياس فورية عند باب المنزل لضمان التنسيق والمقاس المثالي',
      icon: <RefreshCw size={28} color="var(--gold)" />,
      badge: 'الاستبدال والترجيع الفوري عند التوصيل',
      sections: [
        {
          heading: '1. التبديل والترجيع الفوري عند التسليم (داخل الأردن فقط)',
          text: 'التبديل والترجيع متاح حصرياً داخل المملكة الأردنية الهاشمية ويتم فوراً أثناء تواجد كابتن التوصيل عند باب المنزل؛ حيث يبقى الكابتن عند الباب حتى تقوم العميلة بتجربة العباءة والمعاينة والتأكد من المقاس والجودة.'
        },
        {
          heading: '2. رسوم التوصيل في حال التبديل أو الترجيع',
          text: 'مبلغ ورسوم التوصيل غير قابلة للاسترداد وتكون على حساب العميل في حال التبديل أو الترجيع داخل الأردن، حيث يتم دفع أجور التوصيل للكابتن مقابل خدمة النقل والشحن.'
        },
        {
          heading: '3. الطلبات والشحنات الخارجية (خارج الأردن)',
          text: 'جميع الشحنات والعبايات التي يتم شحنها إلى خارج المملكة الأردنية الهاشمية نهائية تماماً، ولا يوجد لها تبديل أو إرجاع نظراً لإجراءات الجمارك والشحن الدولي.'
        },
        {
          heading: '4. انتهاء مهلة التبديل والترجيع',
          text: 'بمجرد انتهاء التجربة ومغادرة كابتن التوصيل وتأكيد الاستلام، يُعتبر الطلب مكتملاً ونهائياً ولا يُتاح التبديل أو الترجيع بعد مغادرة الكابتن.'
        }
      ]
    },

    about: {
      title: 'عن دار زهرة بيسان للأزياء الفاخرة',
      subtitle: 'أصالة العباءة الشرقية بالفخامة العصرية واللمسات الملكية',
      icon: <Crown size={28} color="var(--gold)" />,
      badge: 'تصاميم حصرية وفخامة لا تضاهى',
      sections: [
        {
          heading: 'قصة زهرة بيسان — العراقة والأنوثة',
          text: 'تأسست دار زهرة بيسان لتكون العنوان الأول لكل امرأة عربية تبحث عن الأناقة الرفيعة والتميز الملكي. نجمع في تصاميمنا بين سحر الأصالة الشرقية وأحدث صيحات الموضة العالمية.'
        },
        {
          heading: 'حرفية الخياطة والتطريز اليدوي',
          text: 'نختار خاماتنا من أفخم مصانع الأقمشة العالمية (الحرير الملكي، الكريب المقصّب الياباني، والدانتيل الفرنسي). كل قطعة تشهد ساعات من الشك والتطريز اليدوي المتقن بأيدي أشهر الحرفيين.'
        },
        {
          heading: 'التزامنا بالجودة والاستدامة',
          text: 'نؤمن بأن كل عباءة تحمل اسم "زهرة بيسان" هي قطعة فنية تحكي قصة ذوقكِ الرفيع، مع الحرص التام على العناية بالتفاصيل من القصّة وحتى التغليف الراقي الذي يصلكِ.'
        }
      ]
    },

    size: {
      title: 'دليل المقاسات الملكي الذكي',
      subtitle: 'جدول قياسات دقيق لضمان إطلالة متناسقة ومريحة تناسب قوامكِ',
      icon: <Sparkles size={28} color="var(--gold)" />,
      badge: 'دقة وتفصيل مثالي',
      sections: [
        {
          heading: 'كيف تختارين مقاس العباءة المناسب لطولكِ؟',
          text: '• مقاس 50: مناسب للطول من 150 سم إلى 154 سم\n• مقاس 52: مناسب للطول من 155 سم إلى 159 سم\n• مقاس 54: مناسب للطول من 160 سم إلى 164 سم\n• مقاس 56: مناسب للطول من 165 سم إلى 169 سم\n• مقاس 58: مناسب للطول من 170 سم إلى 174 سم\n• مقاس 60: مناسب للطول من 175 سم فما فوق'
        },
        {
          heading: 'القصّات المتاحة وطريقة القياس',
          text: 'تتوفر عباءاتنا بقصّة عادية (Regular Fit) وقصّة كلوش واسعة وقصّة بشت ملكية فضفاضة. يُقاس طول العباءة من أعلى الكتف وحتى أسفل الكاحل مباشرة.'
        },
        {
          heading: 'استشارة مجانية للمقاسات الخاصة',
          text: 'هل تحتاجين لتعديل خاص على الطول أو الأكمام؟ يمكنكِ التواصل مع مستشارتنا عبر الواتساب أو الشات المباشر وسنقوم بتجهيز القطعة بمقاساتكِ المخصصة.'
        }
      ]
    },

    shipping: {
      title: 'سياسة الشحن والتوصيل المحلي والدولي',
      subtitle: 'تغليف ملكي فاخر وشحن سريع ومؤمن إلى جميع أنحاء العالم',
      icon: <Truck size={28} color="var(--gold)" />,
      badge: 'شحن سريع وتغليف هدية راقٍ',
      sections: [
        {
          heading: '1. التوصيل داخل المملكة الأردنية الهاشمية',
          text: 'يتم التوصيل لجميع محافظات الأردن خلال 24 - 48 ساعة من تأكيد الطلب، مع إمكانية المعاينة والتجربة الفورية عند الاستلام.'
        },
        {
          heading: '2. الشحن الدولي لدول الخليج والعالم',
          text: 'نشحن إلى السعودية، الإمارات، قطر، الكويت، البحرين، عمان، وجميع دول أوروبا وأمريكا عبر أفضل شركات الشحن السريع (DHL / Aramex) وتصل الشحنة خلال 3 - 5 أيام عمل مع رقم تتبع فوري.'
        },
        {
          heading: '3. التغليف الملكي الفاخر',
          text: 'تصل جميع العباءات في صندوق هدايا ملكي محمي ومعطر برائحة العود الفاخر، جاهز للإهداء والإطلالات الفخمة.'
        }
      ]
    }
  };

  const current = contentMap[type] || contentMap.privacy;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }} onClick={onClose}>
      
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        backgroundColor: 'var(--bg-surface, #ffffff)',
        border: '1px solid var(--border, rgba(212, 175, 55, 0.35))',
        borderRadius: '24px',
        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.3), 0 0 40px rgba(212, 175, 55, 0.15)',
        color: 'var(--espresso, #2c1a0e)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl'
      }} onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: '1px solid var(--border, rgba(212, 175, 55, 0.15))',
          background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {current.icon}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'serif', color: 'var(--gold-dim, #c5a880)' }}>
                  {current.title}
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  color: 'var(--gold-dim, #c5a880)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  fontWeight: 600
                }}>
                  {current.badge}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--espresso-dim, #665849)' }}>
                {current.subtitle}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(197, 168, 128, 0.1)',
              border: '1px solid rgba(197, 168, 128, 0.25)',
              color: 'var(--gold-dim, #c5a880)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(197, 168, 128, 0.1)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '28px 32px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {current.sections.map((sec, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-card, rgba(197, 168, 128, 0.05))',
              border: '1px solid var(--border, rgba(212, 175, 55, 0.15))',
              borderRadius: '16px',
              padding: '20px 22px'
            }}>
              <h4 style={{
                margin: '0 0 10px 0',
                color: 'var(--espresso, #2c1a0e)',
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700
              }}>
                <CheckCircle2 size={16} color="var(--gold-dim, #c5a880)" />
                {sec.heading}
              </h4>
              <p style={{
                margin: 0,
                color: 'var(--espresso-mid, #4a3b30)',
                fontSize: '0.92rem',
                lineHeight: '1.7'
              }}>
                {sec.text}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '18px 32px',
          borderTop: '1px solid var(--border, rgba(212, 175, 55, 0.15))',
          background: 'var(--bg-surface, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--espresso-dim, #665849)' }}>
            <PhoneCall size={14} color="var(--gold-dim, #c5a880)" />
            <span>لأي استفسار إضافي: تواصل مباشر عبر الواتساب الفاخر</span>
          </div>

          <button 
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--gold, #c5a880) 0%, var(--gold-dim, #a6865d) 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(197, 168, 128, 0.35)'
            }}
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
}

